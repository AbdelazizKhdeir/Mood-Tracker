const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

// ✅ Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.cookies && req.cookies.username) return next();
  return res.redirect("/login");
};

// ✅ GET: Register Page
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// ✅ POST: Register User
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register", { error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    // 🔁 Redirect to login page after registration
    res.redirect("/login");
  } catch (err) {
    console.error("Register Error:", err);
    res.render("register", { error: "Registration failed" });
  }
});

// ✅ GET: Login Page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// ✅ POST: Login User
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login", { error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid username or password" });
    }

    // ✅ Set cookie and redirect to home
    res.cookie("username", user.username, { httpOnly: true });
    res.redirect("/home");
  } catch (err) {
    console.error("Login Error:", err);
    res.render("login", { error: "Login failed" });
  }
});

// ✅ GET: Logout
router.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/login");
});

module.exports = router;
