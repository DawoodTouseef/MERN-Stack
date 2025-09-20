import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "admin123";
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set JWT as an HTTP-Only Cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // SameSite for cross-site cookies
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;