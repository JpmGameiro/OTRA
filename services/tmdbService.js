'use strict'

const fs = require('fs')
const apiKey = fs.readFileSync('apikey.txt').toString()
const debug = require('debug')('OTRA:tmdbService')

const memoize = require('../cache/memoize')
const utils = require('../utils/utilFunctions')
const global = require('../global')
const mapper = require('../domain/mapper')

const urlTmdb = global.tmdb_url

function init(dataSource) {
    const req = dataSource ? dataSource : require('request')

    return {
        'getMovieDetails':memoize(getMovieDetails),
        getMovieByName
    }

    function getMovieDetails(movieId, cb) {
        const pathMovieDetails = urlTmdb + `movie/${movieId}?api_key=${apiKey}`
        req(utils.optionsBuilder(pathMovieDetails), (err, res, body) => {
            debug(`Accessing TMDb API to Get Details of the Movie with Id:${movieId}`)
            if (err) return cb(err)
            if (res.statusCode !== 200) return cb({message: 'Something Broke!', code: res.statusCode})
            const movie = mapper.mapToMovie(body)
            cb(null, movie)
        })
    }

    function getMovieByName(name, cb) {
        const pathMovieByName = urlTmdb + `search/movie?api_key=${apiKey}&language=en-US&page=1&include_adult=false&query=${name}`
        req(utils.optionsBuilder(pathMovieByName), (err, res, body) => {
            debug(`Accessing TMDb API to Get Movies with name:${name}`)
            if (err) return cb(err)
            if (res.statusCode !== 200) return cb({message: 'Something Broke!', code: res.statusCode})
            let searchResults = []
            body.results.forEach(element =>
                searchResults.push(mapper.mapToMovie(element))
            )
            return cb(null, searchResults)
        })
    }
}


module.exports = init