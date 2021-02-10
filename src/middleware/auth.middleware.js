const { NoAccessError } = require('../errors')

const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        throw new NoAccessError("Not logged in")
    }
    next()
}

const hasRole = (role) => {
    if (!["REVIEWER", "REVIEWEE"].includes(role)) {
        throw `Expected ["REVIEWER", "REVIEWEE"] but found ${role}`
    }
    return (req, res, next) => {
        if (!req.session.user || !req.session.user.role || req.session.user.role != role) {
            throw new NoAccessError(`Cannot find role`)
        }
        next()
    }
}

module.exports = {
    isLoggedIn,
    hasRole
}