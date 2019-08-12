'use strict'

const Cache = require('./cache')
const debug = require('debug')('OTRA:memoize')

/**
 * Caches the return value of the function fn in a map
 * The next time that value is provided, memoize returns the cached value instead of computing the action all over again
 * @param {function} fn - function that provides a value based on a key
 */
module.exports = function memoize(fn) {
    const cache = new Cache()
    return (key,cb)=>{
        if ( cache.has(key) ) {
            debug('Accessing cache with key ' + key)
            return cb(null, cache.get(key))
        }
        fn(key, (err, data) => {
            if(err) return cb(err)
            cache.put(key, data)
            cb(null, data)
        })
    }
}