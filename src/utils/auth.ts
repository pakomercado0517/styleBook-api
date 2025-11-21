import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30m",
  });
}

export function generateRefreshToken(payload: any): string {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET || "default_secret");
}

export function verifyRefreshToken(token: string): any {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret"
  );
}
