'use strict'

const req = require('request')

const utils = require('../utils/utilFunctions')
const global = require('../global')

const urlUsersDb = global.couchdb_url + 'user_db/'

module.exports = {createUser, getUser, findUser}

function createUser(user, cb) {
    req(utils.optionsBuilder(urlUsersDb + user.username, 'PUT', user), (err, res, body) => {
        if (err) return cb(err)
        if (res.statusCode === 409) {
            return cb({message: 'User already exist!', status: res.statusCode})
        }
        return cb(null, user)
    })
}

function findUser(username, cb) {
    req(utils.optionsBuilder(urlUsersDb + username), (err, res, user) => {
        if (err) return cb(err)
        if (res.statusCode !== 200) return cb({message: `User ${username} does not exist`, status: res.statusCode})
        cb(null, user)
    })
}

function getUser(username, password, cb) {
    findUser(username, (err, user) => {
        if (err) return cb(null, null, err.message)
        if (password !== user.password) {
            return cb(null, null, 'Invalid credentials')
        }
        return cb(null, user)
    })
}