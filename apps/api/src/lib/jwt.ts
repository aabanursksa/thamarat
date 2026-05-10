import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production";

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

export function signRefreshToken(payload: {
  userId: string;
}): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): {
  userId: string;
  role: string;
} {
  return jwt.verify(token, SECRET) as { userId: string; role: string };
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
}
