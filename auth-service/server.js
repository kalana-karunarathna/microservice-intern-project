import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🧩 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/taskmanager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// 🧩 2. Register Route
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: "User registered successfully" });
});

// 🧩 3. Login Route
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ userId: user._id }, "secret123", { expiresIn: "1h" });
  res.json({ token });
});

// 🧩 4. Start Server
app.listen(4001, () => console.log("✅ Auth Service running on port 4001"));
