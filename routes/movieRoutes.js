'use strict'

const express = require('express')
const router = express.Router()

const movieService = require('../services/movieService')()
const tmdbService = require('../services/tmdbService')()
const reserveService = require('../services/reserveService')()
const userRestriction = require('./userRestriction')


router.get('/', (req, res, next) => {
    movieService.getExhibitionMovies((err, movies) => {
        res.format({
            html: () => {
                if (err) return next(err)
                res.render('exhibitionMovies', movies)
            },
            json: () => {
                if (err) return res.json(err)
                res.json(movies)
            }
        })
    })
})

router.get('/search', (req, res, next) => {
    tmdbService.getMovieByName(req.query.name, (err, movies) => {
        if (err) return next(err)
        res.render('searchedMovies', {movies: movies})
    })
})

router.get('/:movieId/details', (req, res, next) => {
    movieService.showMovieDetails(req.params.movieId, (err, movieDetails) => {
        if (err) return next(err)
        res.render('movieDetails', {
            movie: movieDetails.movie,
            sessions: movieDetails.sessions,
            rooms: movieDetails.rooms
        })
    })
})

router.get('/:movieId/createSession', userRestriction, (req, res) => {
    res.render('createSession', {movieId: req.params.movieId})
})

router.get('/:movieId/updateSession/:id', userRestriction, (req, res) => {
    res.render('updateSession', {movieId: req.params.movieId, sessionId: req.params.id})
})

router.get('/exhibitionMovies', (req, res, next) => {
    movieService.getExhibitionMovies((err, movies) => {
        if (err) return next(err)
        res.render('exhibitionMovies', {movies: movies})
    })
})

router.post('/:movieId/createSession', userRestriction, (req, res, next) => {
    const movieId = req.params.movieId
    movieService.createSession(movieId, req.body, (err, session) => {
            if (err) return next(err)
            res.redirect(`/movies/${movieId}/details`)
        }
    )
})

router.put('/:movieId/updateSession/:id', userRestriction, (req, res, next) => {
    movieService.updateSession(req.params.id, req.body, (err, session) => {
        if (err) {
            if (err.status === 404) return res.status(404).send(err.message)
            return next(err)
        }
        res.statusCode = 200
        res.send(session)
    })
})

router.get('/:movieId/:cinemaName/:roomName/session/:sessionId', (req, res, next) => {
    movieService.getSpecificMovieSession(req.params.sessionId, (err, movieSession) => {
        if (err) return next(err)
        res.render('buyTicketPage', {movieSession: movieSession})
    })
})

router.post('/buyTicket/:ticketId/:sessionId', (req, res, next) => {
    reserveService.reservePlace(req.params.ticketId, req.params.sessionId, (err, session) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(session)
    })
})

router.delete('/:cinemaName/:roomName/deleteSession/:sessionId', userRestriction, (req, res, next) => {
    movieService.deleteSession(req.params.cinemaName, req.params.roomName, req.params.sessionId, (err, session) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(session)
    })
})

module.exports = router
