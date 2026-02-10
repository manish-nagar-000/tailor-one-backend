import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

import User from "../model/User.js";
import { sendOtp } from "../utils/sendOtp.js";

const router = express.Router();

// ===== Helper Functions =====
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");
const compareHashedOtp = (hashedOtpFromDb, plainOtp) => hashOtp(plainOtp) === hashedOtpFromDb;
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "YOUR_SECRET_KEY",
    { expiresIn: process.env.JWT_EXPIRES || "1d" }
  );

// ===== Security RateLimit for OTP =====
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests. Try again later." },
});

// ============================================
// 🔥 REGISTER (Phone Removed)
// ============================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // phone removed

    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, password required" });

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Role Setup
    let finalRole = "customer";
    if (email === process.env.ADMIN_EMAIL) finalRole = "admin";
    else if (role) finalRole = role;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================= VERIFY OTP =============================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email + OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.otp || !user.otpExpires)
      return res.status(400).json({ error: "OTP not requested" });
    if (user.otpExpires < new Date())
      return res.status(400).json({ error: "OTP expired" });
    if (!compareHashedOtp(user.otp, otp))
      return res.status(400).json({ error: "Invalid OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Account verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ============================= LOGIN =============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email + password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ error: "Email not verified" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    const token = signToken(user);
    res.json({ success: true, message: "Login success", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================== FORGET PASSWORD ==========================
router.post("/forget-password", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (user) {
      const otp = generateOtp();
      user.otp = hashOtp(otp);
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOtp(email, otp);
    }
    res.json({ message: "If account exist, OTP sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================== RESET PASSWORD ==========================
// =========================== RESET PASSWORD ==========================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body; // OTP removed
    if (!email || !newPassword)
      return res.status(400).json({ error: "Email & New Password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "User not found" });

    // Save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
