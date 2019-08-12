'use strict'

const Movie = require('./model/Movie')
const Session = require('./model/Session')
const Room = require('./model/Room')
const Cinema = require('./model/Cinema')

module.exports = {
    mapToMovie,
    mapToSession,
    mapToRoom,
    mapToCinema
}

function mapToMovie(json) {
    return new Movie(
        json.id,
        json.title,
        json.release_date,
        json.runtime,
        json.poster_path
    )
}

function mapToRoom(roomName, cinemaName, rows, seatsPerRow, sessions) {
    return new Room(roomName, cinemaName, rows, seatsPerRow, sessions)
}

function mapToCinema(cinemaName, city, rooms) {
    return new Cinema(cinemaName, city, rooms)
}

function mapToSession(
    movieId,
    date,
    cinemaName,
    roomName,
    seatsAvailable,
    totalSeats,
    busyPlaces,
    sessionId
) {
    return new Session(
        movieId,
        date,
        cinemaName,
        roomName,
        seatsAvailable,
        totalSeats,
        busyPlaces,
        sessionId
    )
}