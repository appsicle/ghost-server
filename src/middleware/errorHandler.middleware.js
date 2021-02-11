const { StatusCodeError } = require('../errors')

// Standard error msg format
const errorHandler = (error, req, res, next) => {
    if (error instanceof StatusCodeError) {
        console.error(error)
        res.status(error.statusCode).json({ errors: [{ msg: error.message }] })
    } else {
        next(error)
    }
}

/* 
 * Make sure to `.catch()` any errors and pass them along to the `next()`
 * middleware in the chain, in this case the error handler.
 */
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
}

module.exports = {
    errorHandler,
    wrapAsync
}