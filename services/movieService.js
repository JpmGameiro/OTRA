'use strict'

const global = require('../global')
const mapper = require('../domain/mapper')

const utils = require('../utils/utilFunctions')
const cinemaService = require('./cinemaService')()
const tmdbService = require('./tmdbService')()

const urlSessionDb = global.couchdb_url + '/session_db/'
const urlCinemaDb = global.couchdb_url + '/cinema_db/'
const urlMovieDb = global.couchdb_url + '/movie_db/'

function init(dataSource) {
    const req = dataSource ? dataSource : require('request')

    return {
        getExhibitionMovies,
        showMovieDetails,
        updateSession,
        getSpecificMovieSession,
        createSession,
        deleteSession
    }

    function getMovieFromDb(movieId, cb) {
        req(utils.optionsBuilder(urlMovieDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({
                message: `Something Broke!`,
                status: res.statusCode
            })
            let movie
            movieId = parseInt(movieId)
            body.rows.forEach(item => {
                if (item.doc.id === movieId)
                    movie = item.doc
            })
            return cb(null, movie)
        })
    }

    function showMovieDetails(movieId, cb) {
        tmdbService.getMovieDetails(movieId, (err, movieDetails) => {
            if (err) return cb(err)
            getSessionsFromMovie(movieDetails.id, (err, sessions) => {
                if (err) return cb(err)
                sessions.map(session => session.date = utils.presentDate(session.date))
                cinemaService.getAllRooms((err, rooms) => {
                    if (err) return cb(err)
                    return cb(null, {movie: movieDetails, sessions: sessions, rooms: rooms})
                })
            })
        })
    }

    function getExhibitionMovies(cb) {
        req(utils.optionsBuilder(urlMovieDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Something broke!', status: res.statusCode})
            let movies = []
            body.rows.forEach(item => movies.push(item.doc))
            return cb(null, movies)
        })
    }

    function getSessionsFromMovie(movieId, cb) {
        req(utils.optionsBuilder(urlSessionDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Something broke!', status: res.statusCode})
            let sessions = []
            body.rows.forEach(item => {
                if (item.doc.movieId === movieId)
                    sessions.push(item.doc)
            })
            return cb(null, sessions)
        })
    }

    function getSpecificMovieSession(sessionId, cb) {
        req(utils.optionsBuilder(urlSessionDb + sessionId), (err, res, session) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Could not find this session', status: res.statusCode})
            getMovieFromDb(session.movieId, (err, movie) => {
                if (err) return cb(err)
                cinemaService.getSpecificRoomAndCinemaByName(
                    session.cinemaName,
                    session.roomName,
                    (err, body) => {
                        if (err) return cb(err)
                        return cb(null, {movie: movie, session: session, room: body.room})
                    })
            })
        })
    }

    function getSessionsAtSameDay(roomSessions, date, cb) {
        req(utils.optionsBuilder(urlSessionDb + '_all_docs?include_docs=true', 'POST', {keys: roomSessions}), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Could not find this session', status: res.statusCode})
            let sessionsAtSameDay = []
            body.rows.forEach(item => {
                let itemDate = new Date(item.doc.date)
                if (itemDate.getTime() === date.getTime())
                    sessionsAtSameDay.push(item.doc)
            })
            cb(null, sessionsAtSameDay)
        })
    }

    function createSession(movieId, fields, cb) {
        const cinemaName = fields.cinemaName, roomName = fields.roomName
        let date
        if (fields.date)
            date = utils.generateDate(fields.date)
        tmdbService.getMovieDetails(movieId, (err, movie) => {
            if (err) return cb(err)
            cinemaService.getSpecificRoomAndCinemaByName(cinemaName, roomName, (err, obj) => {
                if (err) return cb(err)
                const totalSeats = obj.room.seatsPerRow * obj.room.rows
                let session = mapper.mapToSession(parseInt(movieId), date, cinemaName, roomName, totalSeats, totalSeats, [])
                session = utils.populateSessionWithInitAndEndTime(session, movie)
                let canAdd = true
                let roomIndex = obj.cinema.rooms.findIndex(item => item.name === roomName)
                getSessionsAtSameDay(obj.room.sessions, session.date, (err, sessionsAtSameDay) => {
                    if (err) return cb(err)
                    if (sessionsAtSameDay.length > 0) {
                        sessionsAtSameDay.forEach(s => canAdd = utils.checkIfcanAdd(session, s))
                    }
                    if (canAdd) {
                        req(utils.optionsBuilder(urlSessionDb, 'POST', session), (err, res, body) => {
                            if (err) return cb(err)
                            if (res.statusCode > 400)
                                return cb({message: 'Something broke!', status: res.statusCode})
                            session.id = body.id
                            obj.cinema.rooms[roomIndex].sessions.push(session.id)
                            req(utils.optionsBuilder(urlCinemaDb + cinemaName, 'PUT', obj.cinema), (err, res, body) => {
                                if (err) return cb(err)
                                if (res.statusCode > 400)
                                    return cb({message: 'Something broke!', status: res.statusCode})
                                getMovieFromDb(movieId, (err, movieFromDatabase) => {
                                    if (err) return cb(err)
                                    else if (movieFromDatabase === undefined) {
                                        cacheMovie(movie, (err, body) => {
                                            if (err) return cb(err)
                                            cb()
                                        })
                                    }
                                    else return cb()
                                })
                            })
                        })
                    }
                    else return cb({message: 'Can not add Session', status: 409})
                })
            })
        })
    }

    function updateSession(sessionId, sessionParams, cb) {
        cinemaService.getSpecificRoomAndCinemaByName(sessionParams.cinemaName, sessionParams.roomName, (err, obj) => {
            if (err) return cb(err)
            if (obj.room) {
                getSpecificMovieSession(sessionId, (err, body) => {
                    if (err) return cb(err)
                    let newSession = utils.editSessionFields(body.session, sessionParams)
                    req(utils.optionsBuilder(urlMovieDb + newSession.movieId), (err, res, movie) => {
                        newSession = utils.populateSessionWithInitAndEndTime(newSession, movie)
                        req(utils.optionsBuilder(urlSessionDb + sessionId, 'PUT', newSession), (err, res, updatedSession) => {
                            if (err) return cb(err)
                            if (res.statusCode > 400)
                                return cb({message: 'Could not update this session!', status: res.statusCode})
                            getSpecificMovieSession(sessionId, (err, obj) => {
                                obj.session.date = utils.presentDate(obj.session.date)
                                return cb(null, obj.session)
                            })
                        })
                    })
                })
            }
            else return cb({message: 'There is no Room with given Name!', status: 404})
        })
    }

    function cacheMovie(movie, cb) {
        req(utils.optionsBuilder(urlMovieDb + movie.id, 'PUT', movie), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Could not cache this movie', status: res.statusCode})
            cb(null, body)
        })
    }

    function deleteSession(cinemaName, roomName, sessionId, cb) {
        req(utils.optionsBuilder(urlCinemaDb + cinemaName), (err, res, cinema) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Something broke!', status: res.statusCode})
            let roomIndex = cinema.rooms.findIndex(item => item.name === roomName)
            let sessionIndex = cinema.rooms[roomIndex].sessions.findIndex(session => session === sessionId)
            const roomSessions = cinema.rooms[roomIndex].sessions
            const sessionToDelete = roomSessions[sessionIndex]
            roomSessions.splice(sessionIndex, 1)
            req(utils.optionsBuilder(urlCinemaDb + cinemaName, 'PUT', cinema), (err, res, body) => {
                if (err) return cb(err)
                if (res.statusCode > 400)
                    return cb({message: 'Something broke!', status: res.statusCode})
                req(utils.optionsBuilder(urlSessionDb + sessionId), (err, res, session) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400)
                        return cb({message: 'Something broke!', status: res.statusCode})
                    req(utils.optionsBuilder(urlSessionDb + sessionId + '?rev=' + session._rev, 'DELETE', session), (err, res, body) => {
                        if (err) return cb(err)
                        if (res.statusCode > 400)
                            return cb({message: 'Something broke!', status: res.statusCode})
                        checkIfMovieStillInExhibithion(session, (err) => {
                            if (err) return cb(err)
                            cb(null, session)
                        })
                    })
                })
            })
        })
    }

    function checkIfMovieStillInExhibithion(deletedSession, cb) {
        req(utils.optionsBuilder(urlSessionDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Something broke!', status: res.statusCode})
            if (body.rows.find(session => session.doc.movieId === deletedSession.movieId))
                return cb()
            else {
                req(utils.optionsBuilder(urlMovieDb + deletedSession.movieId), (err, res, movie) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400)
                        return cb({message: 'Something broke!', status: res.statusCode})
                    req(utils.optionsBuilder(urlMovieDb + deletedSession.movieId + '?rev=' + movie._rev, 'DELETE', movie), (err, res, body) => {
                        if (err) return cb(err)
                        if (res.statusCode > 400)
                            return cb({message: 'Something broke!', status: res.statusCode})
                        cb()
                    })
                })
            }
        })
    }
}

module.exports = init
