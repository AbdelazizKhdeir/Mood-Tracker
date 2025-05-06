const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  (timestamps = true)
);

module.exports = mongoose.model("Mood", moodSchema);
