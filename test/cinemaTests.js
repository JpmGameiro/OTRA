'use strict'

const fs = require('fs')
const repo = require('./../repo/volatileMemory')()
const cinemaService = require('./../services/cinemaService')(repo)
const Cinema = require('../domain/model/Cinema')
const Room = require('../domain/model/Room')

function reqToFile(path, cb) {
    countRequest++
    const data = endpoints[path]
    if (!data) return cb(new Error('No mock file for path ' + path))
    cb(null, {statusCode: 200}, data)
}

module.exports = {
    createCinemaTest,
    createRoomTest,
    updateCinemaTest,
    updateRoomTest
}

function createCinemaTest(test) {
    const cinema = new Cinema('cinemacity', 'orient', [])
    cinemaService.createCinema(cinema, (err, createdCinema) => {
        if (err) test.ifError(err)
        else {
            test.equal(cinema.name, createdCinema.name)
        }
        repo.resetCinemas()
        test.done()
    })
}

function createRoomTest(test) {
    const cinema = new Cinema('cinemacity', 'orient', [])
    repo.saveCinema(cinema)
    const room = new Room('Sala 1', cinema.name, 50, 50, [])
    cinemaService.createRoom(room, (err, createdRoom) => {
        if (err) test.ifError(err)
        else {
            test.equal(createdRoom.name, room.name)
            test.equal(createdRoom.seatsPerRow, room.seatsPerRow)
            test.equal(createdRoom.name, room.name)
        }
        repo.resetCinemas()
        test.done()
    })
}

function updateCinemaTest(test) {
    const cinema = new Cinema('cinemacity', 'orient', [])
    cinemaService.createCinema(cinema, (err, createdCinema)=>{
        if(err) test.ifError(err)
        const body = {name: 'castelo lopes', city: 'orient', rooms: []}
        cinemaService.updateCinema(createdCinema.name, body, (err, updatedCinema)=>{
            if(err) test.ifError(err)
            else {
                test.equal(updatedCinema.name, body.name)
                test.equal(updatedCinema.city, cinema.city)
            }
        })
        repo.resetCinemas()
        test.done()
    })
}

function updateRoomTest(test) {
    const cinema = new Cinema('cinemacity', 'orient', [])
    repo.saveCinema(cinema)
    const room = new Room('Sala 1', cinema.name, 50, 50, [])
    cinemaService.createRoom(room, (err, createdRoom) => {
        if (err) test.ifError(err)
        const body = {name: 'A sala', cinemaName: cinema.name, rows: 50, seatsPerRow: 50, sessions: [] }
        cinemaService.updateRoom(cinema.name, room.name,body, (err, updatedRoom) => {
            if(err) test.ifError(err)
            else {
                test.equal(updatedRoom.name, body.name)
                test.equal(updatedRoom.cinemaName, room.cinemaName)
            }
            repo.resetCinemas()
            test.done()
        })
    })
}