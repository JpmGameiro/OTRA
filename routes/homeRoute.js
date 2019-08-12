const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.redirect('/home')
})

/**
 * Shows homepage with a search bar
 */
router.get('/home', function (req, res) {
    res.render('homePageView')
})

module.exports = router