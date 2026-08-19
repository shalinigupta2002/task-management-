import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS, MESSAGES } from "../constants/index.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const isDev = process.env.NODE_ENV === "development";
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL;
  const isOperational = err.isOperational === true;
  const message = isDev || isOperational
    ? (err.message || MESSAGES.INTERNAL_ERROR)
    : MESSAGES.INTERNAL_ERROR;

  if (isDev) {
    console.error("[Error]", err);
  } else if (!isOperational) {
    console.error("[Error]", err.name || "Error", statusCode);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: isOperational ? (err.errors || undefined) : undefined,
    ...(isDev && { stack: err.stack }),
  });
}

export function notFoundHandler(_req, _res, next) {
  next(ApiError.notFound("API route not found"));
}

export default errorHandler;
