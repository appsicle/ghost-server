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
        if (req.session?.user?.role != role) {
            throw new NoAccessError(`Expected ${role} but found ${req.session?.user?.role}`)
        }
        next()
    }
}

module.exports = {
    isLoggedIn,
    hasRole
}