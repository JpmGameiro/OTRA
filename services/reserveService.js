'use strict'

const global = require('../global')
const utils = require('../utils/utilFunctions')
const urlSessionsDb = global.couchdb_url + 'session_db/'

function init(dataSource) {
    let req
    if (dataSource)
        req = dataSource
    else
        req = require('request')

    return {
        reservePlace
    }

    function reservePlace(ticketId, sessionId, cb) {
        const path = urlSessionsDb + sessionId
        req(utils.optionsBuilder(path), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            if (body.seatsAvailable > 0) {
                body.seatsAvailable = body.seatsAvailable - 1
                body.busyPlaces.push(ticketId)
                req(utils.optionsBuilder(path, 'PUT', body), (err, resp, body) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                    cb(null, body)
                })
            }
            else return cb('Full Session! Please reserve another session.')
        })
    }
}

module.exports = init