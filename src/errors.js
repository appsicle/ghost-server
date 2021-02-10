class StatusCodeError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

class BadInputError extends StatusCodeError {
    constructor(message) {
        super(400, message);
    }
}

class NoAccessError extends StatusCodeError {
    constructor(message) {
        super(403, message);
    }
}

module.exports = {
    StatusCodeError,
    BadInputError,
    NoAccessError
}