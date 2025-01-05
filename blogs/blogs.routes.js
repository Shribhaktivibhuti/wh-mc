// blogs.routes.js
const express = require("express");
const router = express.Router();
const { getBlogs, initializeDatabase } = require("./blog.controller");

// Initialize the database (this will be done in server.js)
router.get("/", getBlogs);

// Export the router so it can be used in server.js
module.exports = { router, initializeDatabase };
