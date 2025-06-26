const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");
const ensureLoggedIn = require("../middlewares/ensureLoggedIn").default;
// const bcrypt = require("bcryptjs")
const User = require("../models/User");   
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.cookies && req.cookies.username) {
    next();
  } else {
    res.redirect("/login");
  }
}


// helper to hash a plain‐text password
async function hashPassword(plain) {
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

// Home page (accessible via "/home" and "/")
router.get(["/", "/home"], isAuthenticated, (req, res) => {
  res.render("home", { username: req.cookies.username });
});

// Daily page route: fetch latest mood
router.get("/daily", isAuthenticated, async (req, res) => {
  try {
    const moods = await Mood.find({ username: req.cookies.username })
      .sort({ date: -1 })
      .limit(1);

    res.render("daily", {
      username: req.cookies.username,
      mood: moods[0] || {},
      error: null,
      advice: null // ✅ أضف هذا السطر لتجنب الخطأ في EJS
    });
  } catch (err) {
    console.error(err);
    res.render("daily", {
      username: req.cookies.username,
      mood: {},
      error: "Failed to load daily mood",
      advice: null // ✅ أضف هذا هنا أيضًا
    });
  }
});


// Save daily mood
// router.post("/daily", isAuthenticated, async (req, res) => {
//   try {
//     const { mood, note } = req.body;
//     const username = req.cookies.username;

//     await Mood.create({
//       username,
//       mood,
//       note,
//       date: new Date(),
//     });

//     res.redirect("/daily");
//   } catch (err) {
//     console.error(err);
//     res.render("daily", {
//       username: req.cookies.username,
//       mood: {},
//       error: "Failed to save mood. Please try again.",
//     });
//   }
// });

router.post("/daily", isAuthenticated, async (req, res) => {
  const { mood, note } = req.body;

  const adviceMessages = {
    Happy: "Share your happiness and achievements with others, for happiness is contagious.",
    Sad: "It’s okay to feel sad. Talk to someone or try something comforting.",
    Angry: "Take a deep breath. Try to understand the cause of your anger before reacting.",
    Stressed: "Pause and breathe. Take things one step at a time — you've got this!",
    Tired: "Rest is not a waste. Recharge and give yourself grace.",
    Neutral: "Every day won’t be intense, and that’s okay. Neutral days can be peaceful."
  };

  const moodLabel = mood.split(" ")[1]; 
  const advice = adviceMessages[moodLabel] || null;

  try {
    await Mood.create({
      username: req.cookies.username,
      mood,
      note
    });

    res.render("daily", {
      username: req.cookies.username,
      mood: { mood, note },
      error: null,
      advice  
    });
  } catch (err) {
    console.error(err);
    res.render("daily", {
      username: req.cookies.username,
      mood: { mood, note },
      error: "Something went wrong. Please try again.",
      advice: null
    });
  }
});



// Add mood (GET)
router.get("/add", isAuthenticated, (req, res) => {
  res.render("add", {
    username: req.cookies.username,
    error: null,
  });
});

// Add mood (POST)
router.post("/add", isAuthenticated, async (req, res) => {
  try {
    const { mood, note } = req.body;
    const username = req.cookies.username;

    await Mood.create({
      username,
      mood,
      note,
      date: new Date(),
    });

    res.redirect("/daily");
  } catch (err) {
    console.error(err);
    res.render("add", {
      username: req.cookies.username,
      error: "Failed to add mood",
    });
  }
});

// Calendar page
router.get("/calendar", isAuthenticated, async (req, res) => {
  try {
    const moods = await Mood.find({ username: req.cookies.username }).sort({
      date: -1,
    });

    res.render("calendar", {
      username: req.cookies.username,
      moods,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render("calendar", {
      username: req.cookies.username,
      moods: [],
      error: "Failed to load calendar data",
    });
  }
});

// Mood trend chart
router.get("/trend", isAuthenticated, async (req, res) => {
  try {
    const moods = await Mood.find({ username: req.cookies.username }).sort({
      date: 1,
    });

    const labels = moods.map((m) => new Date(m.date).toLocaleDateString());
    const data = moods.map((m) => m.mood);

    res.render("trend", {
      username: req.cookies.username,
      labels,
      data,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render("trend", {
      username: req.cookies.username,
      labels: [],
      data: [],
      error: "Failed to load mood trend",
    });
  }
});

// Update mood
router.post('/daily/:id/edit', async (req, res) => {
  const { mood, note } = req.body;
  try {
    await Mood.findByIdAndUpdate(req.params.id, { mood, note });
    res.redirect('/calendar');
  } catch (err) {
    res.status(500).send('Failed to update mood');
  }
});


// Settings page
router.get("/settings", isAuthenticated, (req, res) => {
  res.render("settings", { username: req.cookies.username ,
        error: null,
    success: null

   });
});

// router.post("/settings", isAuthenticated, async (req, res) => {
//   const { username: newUsername, password } = req.body;
//   const oldUsername = req.cookies.username;

//   try {
//     // 1) Update in DB (and hash password first in prod!)
//     await User.findOneAndUpdate(
//       { username: oldUsername },
//       { username: newUsername, password: await bcrypt.hash(password, 12) }
//     );

//     // 2) Reset the cookie so future auth checks use new username
//     res.cookie("username", newUsername, {
//       httpOnly: true,
//       // ...any other options you need
//     });

//     // 3) Render success
//     res.render("settings", {
//       username: newUsername,
//       success: "Your username and password have been updated!",
//       error: null,
//     });
//   } catch (err) {
//     console.error("Settings update error:", err);
//     res.render("settings", {
//       username: oldUsername,
//       success: null,
//       error: "Could not update settings. Try a different username?",
//     });
//   }
// });


router.post('/settings', isAuthenticated, async (req, res) => {
  try {
    const oldUsername = req.cookies.username;
    const {  password, username: newUsername } = req.body;

    // 1) Update the user record
    const user = await User.findOne({ username: oldUsername });
    if (!user) throw new Error('User not found');
    user.username = newUsername;
    if (password) {
      user.password = await hashPassword(password);
    }
    await user.save();

    // 2) Update the session / cookie
    res.cookie('username', newUsername, { /* your options */ });

    // 3) Propagate the username change to all Mood docs
    await Mood.updateMany(
      { username: oldUsername },
      { $set: { username: newUsername } }
    );

    return res.render('settings', {
      username: newUsername,
      success: 'Settings saved!',
      error: null
    });
  } catch (err) {
    console.error(err);
    return res.render('settings', {
      username: req.cookies.username,
      success: null,
      error: 'Failed to save settings'
    });
  }
});

module.exports = router;
