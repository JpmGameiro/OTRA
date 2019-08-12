'use strict'

const global = require('../global')
const utils = require('../utils/utilFunctions')
const mapper = require('../domain/mapper')

const urlCinemasDb = global.couchdb_url + 'cinema_db/'
const urlSessionsDb = global.couchdb_url + 'session_db/'
const urlMoviesDb = global.couchdb_url + 'movie_db/'

function init(dataSource) {
    let req
    if (dataSource)
        req = dataSource
    else
        req = require('request')

    return {
        getAllCinemas,
        getCinemaByName,
        getAllRoomsFromCinema,
        getCinemaDetails,
        getAllRooms,
        getSpecificRoomAndCinemaByName,
        createCinema,
        createRoom,
        updateCinema,
        updateRoom,
        deleteRoom,
        deleteCinema
    }

    function getAllCinemas(cb) {
        req(utils.optionsBuilder(urlCinemasDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            let cinemas = body.rows.map(elem => elem.doc)
            return cb(null, cinemas)
        })
    }

    function getAllRooms(cb) {
        req(utils.optionsBuilder(urlCinemasDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            let cinemas = body.rows.map(item => item.doc)
            let rooms = []
            cinemas.forEach(cinema => {
                cinema.rooms.forEach(elem => rooms.push(elem))
            })
            return cb(null, rooms)
        })
    }

    function getCinemaByName(name, cb) {
        req(utils.optionsBuilder(urlCinemasDb + name), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode === 404) return cb({message: 'Cinema Not Found', status: res.statusCode})
            return cb(null, body)
        })
    }

    function getCinemaDetails(cinemaName, cb) {
        getCinemaByName(cinemaName, (err, cinema) => {
            if (err) return cb(err)
            if (!cinema) return cb({message: 'Cinema doesn\'t exists', status: 404})
            getAllExhibitionMoviesFromCinema(cinemaName, (err, movies) => {
                if (err) return cb(err)
                return cb(null, {name: cinema.name, movies: movies, rooms: cinema.rooms})
            })
        })
    }

    function getAllExhibitionMoviesFromCinema(cinemaName, cb) {
        req(utils.optionsBuilder(urlSessionsDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            let movieIds = []
            body.rows.forEach(session => {
                if (session.doc.cinemaName === cinemaName && movieIds.find(id => id === session.doc.movieId) === undefined) {
                    movieIds.push(session.doc.movieId)
                }
            })
            movieIds = movieIds.map(id => id.toString())
            req(utils.optionsBuilder(urlMoviesDb + '_all_docs?include_docs=true', 'POST', {keys: movieIds}), (err, res, data) => {
                if (err) return cb(err)
                if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                data.rows = data.rows.map(item => item.doc)
                return cb(null, data.rows)
            })
        })
    }

    function getAllRoomsFromCinema(cinema, cb) {
        req(utils.optionsBuilder(urlCinemasDb + cinema), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            return cb(null, body.rooms)
        })
    }

    function getSpecificRoomAndCinemaByName(cinemaName, roomName, cb) {
        getCinemaByName(cinemaName, (err, cinema) => {
            if (err) return cb(err)
            let room = cinema.rooms.find(room => room.name === roomName)
            return cb(null, {cinema: cinema, room: room})
        })
    }

    function getAllSessionsFromRoom(cinema, roomName, cb) {
        req(utils.optionsBuilder(urlCinemasDb + cinema.name), (err, res, body) => {
            if (err) return cb(err)
            const room = body.rooms.find(room => room.name === roomName)
            return cb(null, room.sessions.sort((a, b) => {
                const dateA = new Date(a), dateB = new Date(b)
                return dateA - dateB
            }))
        })
    }

    function createCinema(cinemaName, city, rooms, cb) {
        const cinema = mapper.mapToCinema(cinemaName, city, rooms)
        req(utils.optionsBuilder(urlCinemasDb + cinema.name, 'PUT', cinema), (err, res, body) => {
                if (err) return cb(err)
                if (res.statusCode === 409)
                    return cb({message: 'Already exists a cinema with the given name!', status: 409})
                if (res.statusCode > 399)
                    return cb({message: 'Something Broke!', status: res.statusCode})
                return cb(null, cinema)
            }
        )
    }

    function createRoom(roomName, cinemaName, rows, seatsPerRow, sessions, cb) {
        const room = mapper.mapToRoom(roomName, cinemaName, rows, seatsPerRow, sessions)
        getCinemaByName(cinemaName, (err, cinema) => {
            if (err) return cb(err)
            let canCreate = cinema.rooms.find(room => room.name === roomName)
            if (canCreate === undefined) {
                cinema.rooms.push(room)
                req(utils.optionsBuilder(urlCinemasDb + cinemaName, 'PUT', cinema), (err, res, body) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400)
                        return cb({message: 'Something broke!', status: res.statusCode})
                    cb()
                })
            }
            else cb({message: 'Already exists a Room with same Name', status: 409})
        })
    }

    function updateCinema(cinemaName, bodyWithNewValues, cb) {
        getAllCinemas((err, cinemas) => {
            if (err) return cb(err)
            if (cinemas.find(cinema => cinema.name === bodyWithNewValues.name) === undefined) {
                req(utils.optionsBuilder(urlSessionsDb + '_all_docs?include_docs=true'), (err, res, sessions) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                    sessions = sessions.rows.map(sessions => sessions.doc)
                    const sessionsToEdit = sessions.filter(session => session.cinemaName === cinemaName)
                    sessionsToEdit.forEach(session => {
                        session.cinemaName = bodyWithNewValues.name
                    })
                    req(utils.optionsBuilder(urlSessionsDb + '_bulk_docs', 'POST', {docs: sessionsToEdit}), (err, res, sessionsEdited) => {
                        if (err) return cb(err)
                        if (res.statusCode > 400)
                            return cb({message: 'Something broke!', status: res.statusCode})
                        getCinemaByName(cinemaName, (err, cinema) => {
                            if (err) return cb(err)
                            cinema.rooms.map(room => {
                                room.cinemaName = bodyWithNewValues.name
                            })
                            const newCinema = mapper.mapToCinema(bodyWithNewValues.name, bodyWithNewValues.city, cinema.rooms)
                            req(utils.optionsBuilder(urlCinemasDb + cinemaName + '?rev=' + cinema._rev, 'DELETE'), (err, res, body) => {
                                if (err) return cb(err)
                                if (res.statusCode > 400) return cb({
                                    message: 'Error Deleting Cinema!',
                                    status: res.statusCode
                                })
                                req(utils.optionsBuilder(urlCinemasDb + newCinema.name, 'PUT', newCinema), (err, res, body) => {
                                    if (err) return cb(err)
                                    if (res.statusCode > 400) return cb({
                                        message: 'Error Updating Cinema!',
                                        status: res.statusCode
                                    })
                                    cb(null, newCinema)
                                })
                            })
                        })
                    })
                })
            }
            else cb({message: 'Already exists a Cinema with given name!', status: 409})
        })
    }

    function updateRoom(cinemaName, roomName, bodyWithNewValues, cb) {
        req(utils.optionsBuilder(urlCinemasDb + cinemaName), (err, res, cinema) => {
            if (err) return cb(err)
            cinema.rooms.forEach(room => {
                if (room.name === roomName) {
                    room.name = bodyWithNewValues.name
                    room.seatsPerRow = bodyWithNewValues.seatsPerRow
                    room.rows = bodyWithNewValues.rows
                }
            })
            req(utils.optionsBuilder(urlCinemasDb + cinemaName, 'PUT', cinema), (err, res, newCinema) => {
                if (err) return cb(err)
                if (res.statusCode > 400) return cb({message: 'Error Updating Cinema!', status: res.statusCode})
                getAllSessionsFromRoom(cinema, bodyWithNewValues.name, (err, sessionsFromRoom) => {
                    if (err) return cb(err)
                    req(utils.optionsBuilder(urlSessionsDb + '_all_docs?include_docs=true', 'POST', {keys: sessionsFromRoom}), (err, res, sessions) => {
                        let sessionsToUpdate = []
                        sessions = sessions.rows.forEach(session => sessionsToUpdate.push(session.doc))
                        sessionsToUpdate.map(session => {
                            session.roomName = bodyWithNewValues.name
                            session.seatsAvailable = bodyWithNewValues.rows * bodyWithNewValues.seatsPerRow
                            session.totalSeats = bodyWithNewValues.rows * bodyWithNewValues.seatsPerRow
                        })
                        req(utils.optionsBuilder(urlSessionsDb + '_bulk_docs', 'POST', {docs: sessionsToUpdate}), (err, res, data) => {
                            if (err) return cb(err)
                            if (res.statusCode > 400) return cb({message: 'Error Updating Sessions!', status: res.statusCode})
                            cb(null, cinema)
                        })
                    })
                })
            })
        })
    }

    function deleteRoom(cinemaName, roomName, cb) {
        req(utils.optionsBuilder(urlCinemasDb + cinemaName), (err, res, cinema) => {
            let room = cinema.rooms.find(room => room.name === roomName)
            let roomIndex = cinema.rooms.findIndex(room => room.name === roomName)
            const paths = []
            if (room.sessions.length !== 0) {
                room.sessions.forEach(session => {
                    paths.push(urlSessionsDb + session)
                })
                httpGetParallelRequest(paths, (err, sessionsToDelete) => {
                    if (err) return cb(err)
                    if (sessionsToDelete.length > 0) {
                        deleteAllSessions(sessionsToDelete, (err) => {
                            if (err) return cb(err)
                            deleteRoomAndUpdateCinema(roomIndex, cinema, (err, cinema) => {
                                if (err) return cb(err)
                                return cb(null, room)
                            })
                        })
                    }
                    else {
                        deleteRoomAndUpdateCinema(roomIndex, cinema, (err, cinema) => {
                            if (err) return cb(err)
                            return cb(null, room)
                        })
                    }
                })
            } else {
                deleteRoomAndUpdateCinema(roomIndex, cinema, (err, cinema) => {
                    if (err) return cb(err)
                    return cb(null, room)
                })
            }
        })
    }

    function deleteRoomAndUpdateCinema(roomIndex, cinema, cb) {
        cinema.rooms.splice(roomIndex, 1)
        req(utils.optionsBuilder(urlCinemasDb + cinema.name, 'PUT', cinema), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({
                message: 'Something broke!',
                status: res.statusCode
            })
            cb(null, cinema)
        })
    }

    function deleteAllSessions(sessionToDelete, cb) {
        let count = 1
        sessionToDelete.forEach(session => {
            req(utils.optionsBuilder(urlSessionsDb + session._id + '?rev=' + session._rev, 'DELETE', session), (err, res, body) => {
                if (err) return cb(err)
                if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                checkIfMovieStillInExhibithion(session, (err) => {
                    if (err) return cb(err)
                    if (count === sessionToDelete.length)
                        cb(null)
                    else count++
                })
            })
        })
    }

    function checkIfMovieStillInExhibithion(deletedSession, cb) {
        req(utils.optionsBuilder(urlSessionsDb + '_all_docs?include_docs=true'), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400)
                return cb({message: 'Something broke!', status: res.statusCode})
            if (body.rows.find(session => session.doc.movieId === deletedSession.movieId))
                return cb()
            else {
                req(utils.optionsBuilder(urlMoviesDb + deletedSession.movieId), (err, res, movie) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400)
                        return cb({message: 'Something broke!', status: res.statusCode})
                    req(utils.optionsBuilder(urlMoviesDb + deletedSession.movieId + '?rev=' + movie._rev, 'DELETE', movie), (err, res, body) => {
                        if (err) return cb(err)
                        if (res.statusCode > 400)
                            return cb({message: 'Something broke!', status: res.statusCode})
                        cb()
                    })
                })
            }
        })
    }

    function deleteCinema(cinemaName, cb) {
        req(utils.optionsBuilder(urlCinemasDb + cinemaName), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            if (body.rooms.length !== 0) {
                body.rooms.forEach(room => deleteRoom(cinemaName, room.name, (err) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                }))
                removeCinemaAux(body, (err, cinema) => {
                    if (err) return cb(err)
                    cb(null, cinema)
                })
            } else {
                removeCinemaAux(body, (err, cinema) => {
                    if (err) return cb(err)
                    cb(null, cinema)
                })
            }
        })
    }

    function removeCinemaAux(cinema, cb) {
        req(utils.optionsBuilder(urlCinemasDb + cinema.name), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            req(utils.optionsBuilder(urlCinemasDb + body.name + '?rev=' + body._rev, 'DELETE'), (err, res, body) => {
                if (err) return cb(err)
                if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                return cb(null, cinema)
            })
        })
    }

    function httpGetParallelRequest(paths, cb) {
        let count = 0, arr = []
        let errorReturned = false
        const options = {
            method: 'GET'
        }
        paths.forEach((path, i) => {
            req(path, options, (err, res, body) => {
                if (err && !errorReturned) {
                    errorReturned = true
                    return cb(err)
                }
                arr[i] = JSON.parse(body)
                if (++count === paths.length) {
                    cb(null, arr)
                }
            })
        })
    }
}

module.exports = init
