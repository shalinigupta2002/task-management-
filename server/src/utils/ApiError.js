import { HTTP_STATUS } from "../constants/index.js";

export default class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static unprocessable(message, errors) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE, message, errors);
  }

  static internal(message = "Internal server error") {
    return new ApiError(HTTP_STATUS.INTERNAL, message);
  }
}
