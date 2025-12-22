const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  creditHours: Number,
  imageUrl: String,
  category: String,
});

module.exports = mongoose.model("Course", courseSchema);
