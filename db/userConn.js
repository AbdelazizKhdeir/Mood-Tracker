import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const userConnection = mongoose.createConnection(process.env.USER_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

userConnection.on("connected", () => {
  console.log("✅ User DB connected");
});

userConnection.on("error", (err) => {
  console.error("❌ User DB connection error:", err);
});

export default userConnection;