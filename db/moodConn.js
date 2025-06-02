import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (adjust this if .env is elsewhere)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let moodConnection;

try {
  if (!process.env.MOOD_DB_URI) {
    throw new Error("MOOD_DB_URI not defined in .env");
  }

  moodConnection = mongoose.createConnection(process.env.MOOD_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  moodConnection.once("open", () => {
    console.log("✅ Connected to Mood DB");
  });

  moodConnection.on("error", (err) => {
    console.error("❌ Mood DB connection error:", err);
  });
} catch (error) {
  console.error("❌ Failed to initialize Mood DB connection:", error.message);
}

export default moodConnection;
