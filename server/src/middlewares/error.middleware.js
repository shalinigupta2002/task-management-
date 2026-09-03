import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS, MESSAGES } from "../constants/index.js";
import { sanitizeForLog } from "../utils/sanitize.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const isDev = process.env.NODE_ENV === "development";
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL;
  const isOperational = err.isOperational === true;

  // Always log detailed error information on the server with credentials redacted
  console.error(`[ServerError] ${err.name || "Error"} (${statusCode}): ${sanitizeForLog(err.message || MESSAGES.INTERNAL_ERROR)}`);
  if (err.stack) {
    console.error(sanitizeForLog(err.stack));
  }

  const message = isDev || isOperational
    ? (err.message || MESSAGES.INTERNAL_ERROR)
    : MESSAGES.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    message,
    errors: isOperational ? (err.errors || undefined) : undefined,
    ...(isDev && { stack: err.stack }),
  });
}

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`API route not found: ${req.method} ${req.originalUrl}`));
}

export default errorHandler;
