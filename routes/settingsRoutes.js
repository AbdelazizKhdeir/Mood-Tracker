// routes/settings.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");


// Middleware للتحقق من تسجيل الدخول
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
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.render("settings", {
        username: req.cookies.username,
        error: "كلمة المرور يجب أن تكون على الأقل 6 أحرف.",
        success: null,
      });
    }

    // تجزئة كلمة المرور
    const hash = await bcrypt.hash(password, 10);

    // ابحث عن المستخدم وحدث كلمة المرور
    const updatedUser = await User.findOneAndUpdate(
      { username: req.cookies.username },
      { password: hash },
      { new: true }
    );

    if (!updatedUser) {
      return res.render("settings", {
        username: req.cookies.username,
        error: "المستخدم غير موجود.",
        success: null,
      });
    }

    res.render("settings", {
      username: req.cookies.username,
      error: null,
      success: "تم تحديث كلمة المرور بنجاح!",
    });
  } catch (err) {
    console.error("Settings POST error:", err);
    res.render("settings", {
      username: req.cookies.username,
      error: "حدث خطأ داخلي، حاول لاحقًا.",
      success: null,
    });
  }
});

module.exports = router;
