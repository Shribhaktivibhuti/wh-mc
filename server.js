// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");
const feedbackRoutes = require("./feedback/feedback.routes");
const blogRoutes = require("./blogs/blogs.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB Connection
const uri =
  process.env.MONGO_URI ||
  "mongodb+srv://mongodb:mongodb123@cluster0.hpz0m.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    database = client.db("women_helpline"); // Use your database name

    // Pass the 'database' object to the routes
    feedbackRoutes.initializeDatabase(database);
    blogRoutes.initializeDatabase(database); // Initialize blog routes with the database
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}
connectToDatabase();

// Routes
app.use("/api/feedback", feedbackRoutes.router); // Use the feedback routes
app.use("/api/blogs", blogRoutes.router); // Use the blog routes

// PHQ-9 Test Results Route
app.post("/api/saveTestResult", async (req, res) => {
  const { name, email, score, severity } = req.body;

  if (!name || !email || score === undefined || !severity) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const testResultsCollection = database.collection("testResults");
    const newTestResult = {
      name,
      email,
      score,
      severity,
      date: new Date(),
    };
    await testResultsCollection.insertOne(newTestResult);
    res.status(201).json({ message: "Test result saved successfully." });
  } catch (error) {
    console.error("Error saving test result:", error);
    res.status(500).json({ error: "Failed to save test result." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
