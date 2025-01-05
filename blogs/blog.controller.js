//const Blog = require("./Blog");

// blog.controller.js
// blog.controller.js

// Define the function to fetch blogs
const getBlogs = async (req, res) => {
  try {
    console.log("Fetching blogs...");

    // Ensure the 'database' and 'blogsCollection' are correctly initialized
    if (!database) {
      console.error("Database is not initialized!");
      return res.status(500).json({ message: "Database is not initialized." });
    }

    const blogsCollection = database.collection("blogs"); // Access the 'blogs' collection
    console.log("Blogs collection initialized:", blogsCollection);

    const blogs = await blogsCollection.find().toArray();
    console.log("Fetched blogs:", blogs);

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found." });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch blogs", error: error.message });
  }
};

// Initialize database for blog routes (added for consistency)
const initializeDatabase = (db) => {
  database = db;
};

module.exports = { getBlogs, initializeDatabase };
