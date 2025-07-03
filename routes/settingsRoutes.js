//routes/settings.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Middleware to ensure the user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.cookies.username) return next();
  res.redirect("/login");
};

router.get("/", isAuthenticated, (req, res) => {
  res.render("settings", {
    username: req.cookies.username,
    error: null,
    success: null,
  });
});

router.post("/", isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate inputs
  if (!currentPassword || !newPassword) {
    return res.render("settings", {
      username: req.cookies.username,
      error: "Please fill out both fields.",
      success: null,
    });
  }
  if (newPassword.length < 6) {
    return res.render("settings", {
      username: req.cookies.username,
      error: "New password must be at least 6 characters.",
      success: null,
    });
  }

  try {
    // 1) Find the user by their cookie-backed username
    const user = await User.findOne({ username: req.cookies.username });
    if (!user) {
      return res.render("settings", {
        username: req.cookies.username,
        error: "User not found.",
        success: null,
      });
    }

    // 2) Check current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.render("settings", {
        username: req.cookies.username,
        error: "Current password is incorrect.",
        success: null,
      });
    }

    // 3) Hash & save the new password
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    return res.render("settings", {
      username: req.cookies.username,
      error: null,
      success: "Password updated successfully!",
    });
  } catch (err) {
    console.error("Settings POST error:", err);
    return res.render("settings", {
      username: req.cookies.username,
      error: "Failed to save settings. Try again later.",
      success: null,
    });
  }
});

module.exports = router;
