import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

const signToken = (userId, rememberMe = false) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: rememberMe ? "30d" : "1d",
  });

const setAuthCookie = (res, token, rememberMe = false) => {
  res.cookie("token", token, {
    ...COOKIE_OPTIONS,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
};

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  level: user.level,
  totalXp: user.totalXp,
});

export const registerUser = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const username = (req.body.username || "").trim();
    const password = req.body.password || "";
    const rememberMe = Boolean(req.body.rememberMe);

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
    });

    const token = signToken(user.id, rememberMe);
    setAuthCookie(res, token, rememberMe);

    res.status(201).json({
      message: "Account created successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const rememberMe = Boolean(req.body.rememberMe);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user.id, rememberMe);
    setAuthCookie(res, token, rememberMe);

    res.json({
      message: "Logged in successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};
