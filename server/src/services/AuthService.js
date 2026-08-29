import { z } from "zod";
import UserRepository from "../repositories/UserRepository.js";
import { comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { sanitizeUser } from "../utils/sanitize.js";
import ApiError from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

class AuthService {
  async login(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await UserRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) throw ApiError.unauthorized("Invalid email or password");

    const valid = await comparePassword(password, user.password);
    if (!valid) throw ApiError.unauthorized("Invalid email or password");

    if (user.status !== "ACTIVE") {
      throw ApiError.forbidden("Account is not active");
    }

    await UserRepository.updateLastLogin(user.id);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      companyId: user.companyId,
      companyCode: user.company?.companyCode || null,
    });

    const result = {
      accessToken: token,
      user: sanitizeUser(user),
    };

    // Log login activity
    await logAudit(
      { companyId: user.companyId, userId: user.id, role: user.role.name },
      "LOGIN",
      "User",
      user.id,
      { email: user.email }
    );

    return result;
  }
}

export default new AuthService();
