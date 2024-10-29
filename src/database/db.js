const mongoose = require("mongoose");
const mongodb_url = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
function connectDB() {
  mongoose
    .connect(mongodb_url)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("Error connecting to MongoDB Atlas", err));
}

module.exports = connectDB;
