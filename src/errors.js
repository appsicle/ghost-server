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

class NoAccessError extends StatusCodeError {
    constructor(message) {
        super(message, 403);
    }
}

module.exports = {
    StatusCodeError,
    BadInputError,
    NoAccessError
}