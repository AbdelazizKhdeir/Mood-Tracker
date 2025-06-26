const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();

// Routes
const moodRoutes = require("./routes/moodRoutes");
const userRoutes = require("./routes/userRoutes");
const viewsRoutes = require("./routes/viewsRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.redirect("/register");
});

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Route usage
app.use("/", viewsRoutes); // Pages
app.use("/", userRoutes); // Auth routes
app.use("/moods", moodRoutes); // Mood APIs
app.use("/daily", moodRoutes);
app.use('/settings', settingsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
