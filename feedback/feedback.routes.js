// feedback.routes.js
const express = require("express");
const router = express.Router();

// This will reference the MongoDB collections
let database;
let feedbackCollection;

// Initialize the database and collections
const initializeDatabase = (db) => {
  database = db;
  feedbackCollection = database.collection("feedback"); // Update collection name if needed
};

// POST route to save feedback
router.post("/", async (req, res) => {
  try {
    const feedback = req.body;

    // Validate input
    if (!feedback.name || !feedback.email || !feedback.feedback) {
      return res.status(400).send({ error: "All fields are required." });
    }

    // Insert feedback into MongoDB
    await feedbackCollection.insertOne(feedback);

    res.status(201).send({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res
      .status(500)
      .send({ error: "An error occurred while submitting feedback." });
  }
});

module.exports = { router, initializeDatabase };
