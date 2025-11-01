import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🧩 Connect to the same MongoDB
mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/taskmanager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// 🧩 Task Schema
const taskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  completed: Boolean,
});

const Task = mongoose.model("Task", taskSchema);

// 🧩 JWT Verification Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, "secret123", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
};

// 🧩 Routes

// Get all tasks for this user
app.get("/api/tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});

// Add new task
app.post("/api/tasks", authMiddleware, async (req, res) => {
  const task = new Task({
    userId: req.userId,
    title: req.body.title,
    completed: false,
  });
  await task.save();
  res.json(task);
});

// Update task (mark complete/incomplete)
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  const { completed } = req.body;
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { completed },
    { new: true }
  );
  res.json(task);
});

// Delete task
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

app.listen(4002, () => console.log("✅ Task Service running on port 4002"));
