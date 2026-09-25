import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/index.js";

export function signAccessToken(payload) {
  return jwt.sign(
    { ...payload, typ: "access" },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      jwtid: crypto.randomUUID(),
    }
  );
}

export function signRefreshToken(payload) {
  return jwt.sign(
    { userId: payload.userId, typ: "refresh", tv: payload.tv ?? 0 },
    config.jwt.secret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      jwtid: crypto.randomUUID(),
    }
  );
}

/** @deprecated use signAccessToken */
export function signToken(payload) {
  return signAccessToken(payload);
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, config.jwt.secret);
  if (decoded.typ && decoded.typ !== "access") {
    throw new Error("Invalid access token type");
  }
  return decoded;
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, config.jwt.secret);
  if (decoded.typ !== "refresh") {
    throw new Error("Invalid refresh token type");
  }
  return decoded;
}

export default {
  signToken,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
};
