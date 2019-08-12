'use strict'

const fs = require('fs')
const Session = require('../domain/model/Session')
const Movie = require('../domain/model/Movie')
const Cinema = require('../domain/model/Cinema')
const Room = require('../domain/model/Room')

const endpoints = {
    'https://api.themoviedb.org/3/movie/294?api_key=4b6a555b752a208b4829150d5ee35767':
        fs.readFileSync('./test/files/movie294.json').toString(),
    'https://api.themoviedb.org/3/search/movie?api_key=4b6a555b752a208b4829150d5ee35767&query=furious':
        fs.readFileSync('./test/files/movieNameFurious.json').toString()
}

const repo = require('./../repo/volatileMemory')()
const movieService = require('./../services/movieService')(repo, reqToFile)

function reqToFile(path, cb) {
    const data = endpoints[path]
    if (!data) return cb(new Error('No mock file for path ' + path))
    cb(null, {statusCode: 200}, data)
}

module.exports = {
    testGetMovie,
    testGetMovieByName,
    createSessionTest,
    updateSessionTest
}

function testGetMovieByName(test) {
    movieService.getMovieByName('furious', (err, movies) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(movies[0].title, 'Furious 7')
        }
        test.done()
    })
}

function testGetMovie(test) {
    movieService.getMovieDetails(294, (err, movie) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(movie.title, 'Desert Hearts')
            test.equal(movie.releaseDate, '1985-10-01')
        }
        test.done()
    })
}


function createSessionTest(test) {
    const cinema = new Cinema('cinemacity', 'orient', [])
    repo.saveCinema(cinema)
    const room = new Room('Sala 1', cinema.name, 50, 50, [])
    repo.saveRoom(room, cinema.name)
    const movie = new Movie(294, 'Desert Hearts','1985-10-01', 96, '/vlQBjV04m8Xb6G1LuDYjtm0IB9p.jpg')
    const date = new Date(2018, 4, 22, 23, 0)
    const session = new Session(1,movie,date,cinema.name,room.name)
    movieService.createSession(session, (err, createdSession)=>{
        if(err) test.ifError(err)
        else{
            test.equal(createdSession.roomName, session.roomName)
        }
        repo.resetCinemas()
        test.done()
    })
}

function updateSessionTest(test) {
    const cinema = new Cinema('cinemacity', 'orient', [])
    const newCinema = new Cinema('castelo lopes', 'campo grande', [])
    repo.saveCinema(cinema)
    repo.saveCinema(newCinema)
    const newRoom = new Room('A sala', newCinema.name, 50, 50, [])
    const room = new Room('Sala 1', cinema.name, 50, 50, [])
    repo.saveRoom(newRoom, newCinema.name)
    repo.saveRoom(room, cinema.name)
    const movie = new Movie(294, 'Desert Hearts','1985-10-01', 96, '/vlQBjV04m8Xb6G1LuDYjtm0IB9p.jpg')
    const date = new Date(2018, 4, 22, 23, 0)
    const session = new Session(1,movie,date,cinema.name,room.name)
    movieService.createSession(session, (err, createdSession)=>{
        if(err) test.ifError(err)
        const newDate = new Date(2018, 4, 24, 22, 0)
        const body = { movie: movie, cinemaName: newCinema.name, roomName: newRoom.name}
        movieService.updateSession(createdSession.sessionId, body, newDate, (err, updatedSession) => {
            if(err) test.ifError(err)
            else{
                test.equal(updatedSession.cinemaName, body.cinemaName)
            }
            repo.resetCinemas()
            test.done()
        })
    })
}
