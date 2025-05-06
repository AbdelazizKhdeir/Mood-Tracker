const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const exist = await User.findOne({ username });
    if (exist) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Login User
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get One User By ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//Update User
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };

    // Hash password if it’s being changed
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Find, update, and return the new user document
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password before sending response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json(userObj);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//Delete User
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Deleted = await User.findByIdAndDelete(id);
    if (!Deleted) {
      res.status(404).json({ error: "User Not Found" });
    }
    res.json({ message: "User Deleted !!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
