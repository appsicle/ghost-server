class StatusCodeError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

class BadInputError extends StatusCodeError {
    constructor(message) {
        super(message, 400);
    }
}

module.exports = {
    StatusCodeError,
    BadInputError
}