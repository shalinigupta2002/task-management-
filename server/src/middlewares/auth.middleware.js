import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

  if (!token) {
    return next(ApiError.unauthorized("Access token required"));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;

    if (decoded && decoded.role !== "SUPER_ADMIN") {
      const userCompanyId = decoded.companyId;
      const userCompanyCode = decoded.companyCode;

      const checkAndVerify = (obj) => {
        if (!obj) return;
        if (obj.companyId && obj.companyId !== userCompanyId) {
          throw ApiError.forbidden("Tenant companyId mismatch");
        }
        if (obj.companyCode && obj.companyCode !== userCompanyCode) {
          throw ApiError.forbidden("Tenant companyCode mismatch");
        }
      };

      try {
        checkAndVerify(req.query);
        checkAndVerify(req.body);
        checkAndVerify(req.params);
        checkAndVerify(req.validatedQuery);
        checkAndVerify(req.validatedBody);
        checkAndVerify(req.validatedParams);
      } catch (err) {
        return next(err);
      }
    }

    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions for this action"));
    }
    next();
  };
}

export default { authenticate, authorize };
