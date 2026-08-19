import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source === "body" ? "validated" : `validated${source.charAt(0).toUpperCase()}${source.slice(1)}`] = parsed;
      if (source === "query") req.validatedQuery = parsed;
      if (source === "params") req.validatedParams = parsed;
      if (source === "body") req.validatedBody = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        next(ApiError.unprocessable("Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
}

export default validate;
