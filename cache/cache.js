'use strict'

function Cache() {
    this.cache = new Map()
}

Cache.prototype.get = function (key) {
    return this.cache.get(key)
}

Cache.prototype.put = function(key, value) {
    this.cache.set(key, value)
}

Cache.prototype.has = function(key) {
    return !(this.cache.size === 0 || !this.cache.has(key))
}

Cache.prototype.count = function () {
    return this.cache.size
}

module.exports = Cache