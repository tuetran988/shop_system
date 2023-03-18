const StatusCode = {
  FORBIDDEN: 403,
  CONFLICT: 409,
};
const ReasonStatusCode = {
  FORBIDDEN: 'bad request',
  CONFLICT: 'conflict error',
};

const ReasonPhrases = require("../utils/reasonPhrases")
const StatusCodes = require("../utils/statusCodes")



class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
    super(message, statusCode);
  }
}
class BadRequestError extends ErrorResponse {
  constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED) {
     super(message, statusCode); 
  }
}
class NotFoundError extends ErrorResponse {
  constructor(message = ReasonPhrases.NOT_FOUND  || '', statusCode = StatusCodes.NOT_FOUND || '') {
     super(message, statusCode); 
  }
}



module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
};