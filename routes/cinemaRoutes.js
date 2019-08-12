'use strict'

const express = require('express')
const router = express.Router()

const cinemaService = require('../services/cinemaService')()
const userRestriction = require('./userRestriction')

router.get('/', (req, res, next) => {
    cinemaService.getAllCinemas((err, cinemas) => {
        res.format({
            html: () => {
                if (err) return next (err)
                res.render('cinemasList', {cinemas: cinemas})
            },
            json: () => {
                if(err) return res.json(err)
                res.json(cinemas)
            }
        })
    })
})

router.get('/createCinema', userRestriction, (req, res) => {
        res.render('createCinema')
    }
)

router.get('/:cinemaName', (req, res, next) => {
    cinemaService.getCinemaDetails(req.params.cinemaName, (err, details) => {
        if (err) return next(err)
        res.render('cinemaDetails', {name: details.name, movies: details.movies, rooms: details.rooms})
    })
})

router.get('/:cinemaName/createRoom', userRestriction, (req, res) => {
    res.render('createRoom', {cinemaName: req.params.cinemaName})
})

router.put('/:cinemaName/updateCinema', userRestriction, (req, res, next) => {
    cinemaService.updateCinema(req.params.cinemaName, req.body, (err, cinema) => {
        if (err) {
            if (err.status === 409) return res.status(409).send(err.message)
            return next(err)
        }
        res.statusCode = 200
        res.send(cinema)
    })
})

router.put('/:cinemaName/updateRoom/:roomName', userRestriction, (req, res, next) => {
    cinemaService.updateRoom(req.params.cinemaName, req.params.roomName, req.body, (err, room) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(room)
    })
})

router.post('/:cinemaName/createRoom', userRestriction, (req, res, next) => {
    cinemaService.createRoom(req.body.name, req.params.cinemaName, req.body.rows, req.body.seatsPerRow, [], (err, room) => {
        if (err) return next(err)
        return res.redirect(`/cinemas/${req.params.cinemaName}`)
    })
})

router.post('/createCinema', userRestriction, (req, res, next) => {
    cinemaService.createCinema(req.body.cinemaName, req.body.city, [], (err) => {
        if (err) return next(err)
        return res.redirect('/cinemas')
    })
})

router.delete('/deleteCinema/:cinemaName', userRestriction, (req, res, next) => {
    cinemaService.deleteCinema(req.params.cinemaName, (err, cinema) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(cinema)
    })
})

router.delete('/:cinemaName/deleteRoom/:roomName', userRestriction, (req, res, next) => {
    cinemaService.deleteRoom(req.params.cinemaName, req.params.roomName, (err, room) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(room)
    })
})

module.exports = router