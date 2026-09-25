import { z } from "zod";
import UserRepository from "../repositories/UserRepository.js";
import { comparePassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { sanitizeUser } from "../utils/sanitize.js";
import ApiError from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function buildClaims(user, roleName) {
  return {
    userId: user.id,
    email: user.email,
    role: roleName,
    companyId: user.companyId || null,
    companyCode: user.company?.companyCode || null,
    // Bumped on logout; refresh rejects mismatched versions.
    tv: user.tokenVersion ?? 0,
  };
}

class AuthService {
  async login(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await UserRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) throw ApiError.unauthorized("Invalid email or password");

    if (!user.password) throw ApiError.unauthorized("Invalid email or password");

    const valid = await comparePassword(password, user.password);
    if (!valid) throw ApiError.unauthorized("Invalid email or password");

    if (user.status !== "ACTIVE") {
      throw ApiError.forbidden("Account is not active");
    }

    const roleName = user.role?.name;
    if (!roleName) {
      throw ApiError.unauthorized("User has no assigned role");
    }

    await UserRepository.updateLastLogin(user.id);

    const claims = buildClaims(user, roleName);
    const accessToken = signAccessToken(claims);
    const refreshToken = signRefreshToken({ userId: user.id, tv: user.tokenVersion ?? 0 });

    await logAudit(
      { companyId: user.companyId || null, userId: user.id, role: roleName },
      "LOGIN",
      "User",
      user.id,
      { email: user.email }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      user: sanitizeUser(user),
    };
  }

  async refresh(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user || user.deletedAt || user.status !== "ACTIVE") {
      throw ApiError.unauthorized("User is not active");
    }

    const currentTv = user.tokenVersion ?? 0;
    if (decoded.tv !== undefined && Number(decoded.tv) !== Number(currentTv)) {
      throw ApiError.unauthorized("Refresh token has been revoked");
    }

    const roleName = user.role?.name;
    if (!roleName) throw ApiError.unauthorized("User has no assigned role");

    const claims = buildClaims(user, roleName);

    return {
      accessToken: signAccessToken(claims),
      refreshToken: signRefreshToken({ userId: user.id, tv: currentTv }),
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      user: sanitizeUser(user),
    };
  }

  async logout(userId, meta = {}) {
    if (userId) {
      try {
        await UserRepository.incrementTokenVersion(userId);
      } catch {
        /* non-blocking — client still clears tokens */
      }
      try {
        await logAudit(
          { companyId: meta.companyId || null, userId, role: meta.role || null },
          "LOGOUT",
          "User",
          userId,
          {}
        );
      } catch {
        /* non-blocking */
      }
    }
    return { success: true };
  }
}

export default new AuthService();
