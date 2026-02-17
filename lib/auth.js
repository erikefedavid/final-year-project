import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

if(!JWT_SECRET) {
    throw new Error("please define JWT_TOKEN in env.local");
}

export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}