'use strict'

/**
 * Middleware
 * Checks if there's an admin authenticated. Redirects to login page if false
 */
module.exports = function(req,res,next){
    if(req.user === undefined || !req.user){
        return res.redirect('/auth/login')
    }
    next()
}