/** Strip sensitive fields from user objects */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export default sanitizeUser;
