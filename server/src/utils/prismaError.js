import { Prisma } from "@prisma/client";
import ApiError from "./ApiError.js";
import { sanitizeForLog } from "./sanitize.js";

function logPrismaError(error) {
  console.error("PRISMA ERROR", {
    name: error?.name,
    code: error?.code,
    message: sanitizeForLog(error?.message),
    meta: error?.meta,
    modelName: error?.meta?.modelName,
  });
}

export function handlePrismaError(error) {
  logPrismaError(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.target?.join(", ") || "field";
      throw ApiError.conflict(`Duplicate value for ${target}`);
    }
    if (error.code === "P2025") {
      throw ApiError.notFound("Record not found");
    }
    if (error.code === "P2003") {
      throw ApiError.badRequest("Invalid reference — related record not found");
    }
    if (error.code === "P2021") {
      throw ApiError.internal("Database schema is out of date — run migrations");
    }
    if (error.code === "P2022") {
      throw ApiError.internal("Database schema is out of date — run migrations");
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw ApiError.badRequest("Invalid database query");
  }

  throw ApiError.internal("A database error occurred");
}

export default handlePrismaError;
