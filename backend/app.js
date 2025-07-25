import express from "express";
import axios from "axios";
import cors from "cors";
import mongoose from "mongoose";
import { survey } from './models/serverResponse-model.js';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://fayazkhanxid411:9a2RotpFMaCBxCji@cluster0.45kxbus.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/sjintern")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// GEMINI Setup
const GEMINI_API_KEY = "AIzaSyDHjrtT_1te5kCjmUTC0YVo1b1zcZrqnY0";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ✳️ Route: /api/ask (generates questions using Gemini)
app.post("/api/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const output = response.data.candidates[0].content.parts[0].text;
    res.json({ reply: output });
  } catch (err) {
    console.error("❌ Error in /api/ask:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong", detail: err.message });
  }
});

// ✅ Route: /survey (saves generated questions to MongoDB)
app.post('/survey', async (req, res) => {
  try {
    const data = req.body;
    const saved = await survey.insertMany(data);
    res.json({ message: "✅ Survey questions saved", saved });
  } catch (err) {
    console.error("❌ Error saving survey:", err);
    res.status(500).json({ error: "Failed to save survey", detail: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
