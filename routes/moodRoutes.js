const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");

// Create a new mood
router.post("/", async (req, res) => {
  try {
    const mood = new Mood(req.body);
    const saved = await mood.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Get all moods
router.get("/", async (req, res) => {
  try {
    const moods = await Mood.find().sort({ createdAt: -1 }); 
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single mood by ID
router.get("/:id", async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);
    if (!mood) return res.status(404).json({ error: "Mood not found" });
    res.json(mood);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update mood
router.put("/:id", async (req, res) => {
  try {
    const updated = await Mood.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Mood not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE mood
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Mood.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Mood not found" });
    res.json({ message: "Mood deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
