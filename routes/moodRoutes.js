const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.cookies.username) return next();
  return res.redirect("/login");
};

// at the top, after your other requires
const adviceMap = {
  "😊 Happy": "🎉 Share your happiness and achievements with others—joy is contagious!",
  "😢 Sad": "💬 Talk to a trusted friend or write it down—sometimes a small step lifts the weight.",
  "😠 Angry": "🧘‍♂️ Take 5 deep breaths or step away for a moment—calm helps clarity.",
  "😣 Stressed": "☕ Pause for a short break—hydrate, stretch, and reset your mind.",
  "😴 Tired": "😴 Rest is productive—consider a quick power nap or early night.",
  "😐 Neutral": "🔍 Reflect on your feelings—journaling helps uncover patterns."
};

// Create a new mood (POST from form)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { moodLevel, note } = req.body;
    if (!moodLevel || !note) {
      return res.render("daily", {
        mood: null,
        page: "daily",
        username: req.cookies.username,
        error: "Please provide both mood and note.",
        advice: null
      });
    }

    await new Mood({
      username: req.cookies.username,
      moodLevel,
      note
    }).save();

    // pick the advice
    const message = adviceMap[moodLevel] || null;
    // redirect back to GET /daily with advice in query
    return res.redirect(`/daily?message=${encodeURIComponent(message)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving mood");
  }
});

// Show the form for creating a new mood
router.get("/", isAuthenticated, (req, res) => {
  res.render("daily", {
    mood: null,
    page: "daily",
    username: req.cookies.username,
    error: null,
    advice: req.query.message || null
  });
});


// Show the form for creating a new mood
// router.get("/", isAuthenticated, (req, res) => {
//   res.render("daily", {
//     mood: null,
//     page: "daily",
//     username: req.cookies.username,
//     error: null,
//   });
// });

// Show the form for editing an existing mood
router.get("/:id/edit", isAuthenticated, async (req, res) => {
  try {
    const mood = await Mood.findOne({
      _id: req.params.id,
      username: req.cookies.username,
    });
    if (!mood) return res.status(404).send("Mood not found");
    res.render("edit", { mood, username: req.cookies.username });  // <-- render edit.ejs here
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Create a new mood
// router.post("/", isAuthenticated, async (req, res) => {
//   try {
//     const { moodLevel, note } = req.body;
//     if (!moodLevel || !note) {
//       return res.render("daily", {
//         mood: null,
//         page: "daily",
//         username: req.cookies.username,
//         error: "Please provide both mood and note.",
//       });
//     }

//     const mood = new Mood({
//       username: req.cookies.username,
//       moodLevel,
//       note,
//     });

//     await mood.save();
//     res.redirect("/calendar");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error saving mood");
//   }
// });

// Update an existing mood
router.post("/update/:id", isAuthenticated, async (req, res) => {
  try {
    const updated = await Mood.findOneAndUpdate(
      { _id: req.params.id, username: req.cookies.username },
      {
        mood: req.body.moodLevel,
        note: req.body.note,
      },
      { new: true }
    );

    if (!updated) return res.status(404).send("Mood not found");
    res.redirect("/calendar");
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
});

// Delete mood
router.post("/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const deleted = await Mood.findOneAndDelete({
      _id: req.params.id,
      username: req.cookies.username,
    });

    if (!deleted) return res.status(404).send("Mood not found");
    res.redirect("/calendar");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Calendar listing
router.get("/calendar", isAuthenticated, async (req, res) => {
  try {
    const moods = await Mood.find({ username: req.cookies.username }).sort({
      date: -1,
    });
    res.render("calendar", {
      moods,
      page: "calendar",
      username: req.cookies.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load calendar");
  }
});

// Optional: Show all moods as JSON
router.get("/all", isAuthenticated, async (req, res) => {
  try {
    const moods = await Mood.find({ username: req.cookies.username }).sort({
      createdAt: -1,
    });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: Get a specific mood by ID as JSON
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const mood = await Mood.findOne({
      _id: req.params.id,
      username: req.cookies.username,
    });

    if (!mood) return res.status(404).json({ error: "Mood not found" });
    res.json(mood);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
