const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const hbs = require('hbs')
const favicon = require('serve-favicon')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')

const viewService = require('./services/viewService')

/*
    Load Routes
*/
const home = require('./routes/homeRoute')
const movieRoutes = require('./routes/movieRoutes')
const cinemaRoutes = require('./routes/cinemaRoutes')
const auth = require('./routes/auth')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
viewService(hbs)

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    if( req.user )
        res.locals.user = req.user
    next()
})

app.use('/', home)
app.use('/cinemas', cinemaRoutes)
app.use('/movies', movieRoutes)
app.use('/auth', auth)

app.use(function (req, res, next) {
    next(createError(404))
})

app.use(function (err, req, res, next) {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
