const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  language: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" },
  rating: { type: Number, required: true },
  createdAt: { type: String, default: Date.now },
  image: { type: String, required: true },
});

const bookModel = mongoose.model("book", bookSchema);

module.exports = bookModel;
