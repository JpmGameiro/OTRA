'use strict'

const express = require('express')
const router = express.Router()
const passport = require('passport')
const userService = require('../services/userService')


router.get('/register', (req, res, next) => {
    const obj = {}
    const message = req.flash('registerError')
    if (message) obj.registerError = {message: message}
    res.render('register', obj)
})

router.post('/register', (req, res, next) => {
    if (!req.body.username || !req.body.password || !req.body.email) {
        req.flash('registerError', 'Need to fill all the inputs!')
        return res.redirect('/auth/register')
    }
    userService.createUser(req.body, (err, user, messageInfo) => {
        if (err) return next(err)
        if (messageInfo) {
            req.flash('registerError', messageInfo)
            return res.redirect('/auth/register')
        }
        req.login(user, (err) => {
            if (err) return next(err)
            return res.redirect('/home')
        })
    })
})

router.get('/login', (req, res, next) => {
    const obj = {}
    const message = req.flash('loginError')
    if (message) obj.loginError = {message: message}
    res.render('login', obj)
})

router.post('/login', (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        req.flash('loginError', 'Need to fill all the inputs!')
        res.redirect('/auth/login')
    }

    userService.getUser(req.body.username, req.body.password, (err, user, messageInfo) => {
        if (err) return next(err)
        if (messageInfo) {
            req.flash('loginError', messageInfo)
            return res.redirect('/auth/login')
        }

        req.login(user, (err) => {
            if (err) return next(err)
            return res.redirect(`/home`)
        })
    })
})

router.get('/logout', (req, res, next) => {
    req.logout()
    return res.redirect('/home')
})

passport.serializeUser(function (user, cb) {
    cb(null, user.username)
})

passport.deserializeUser(function (username, cb) {
    userService.findUser(username, cb)
})

module.exports = router

