const express = require("express");
const bookModel = require("../model/bookModel.js");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
// const path = require("../uploads/");
dotenv.config();

const jwt = require("jsonwebtoken");
const bookRoute = express.Router();

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const authenticated = (req, res, next) => {
  const token = req.headers.authentication;

  if (!token) {
    return res.status(401).json({ error: "unathenticated user" });
  }

  const decode = jwt.verify(token, process.env.SECRET_KEY);

  req.user = decode.user;

  next();
};

const roleCheck = (req, res, next) => {
  if (req.user.role != "CREATOR") {
    return res.status(401).json({ error: "unathenticated" });
  }
  next();
};

bookRoute.post(
  "/",
  authenticated,
  roleCheck,
  upload.single("image"), // multer middleware to handle single file upload with field name 'image'
  async (req, res) => {
    try {
      const { title, author, createdAt, language, rating } = req.body;

      // Access uploaded image file and its path using req.file
      const image = req.file;

      // Convert image buffer to Base64 string
      const imageBase64 = image.buffer.toString("base64");

      const newBook = {
        title,
        author,
        createdAt,
        language,
        rating,
        userId: req.user._id,
        image: imageBase64, // Save image as Base64 string
      };

      // Create a new book instance with image data included
      const book = new bookModel(newBook);

      // Save the new book to the database
      await book.save();

      // Response without including image data
      res.status(201).json({
        message: "books created successfully",
        book: { ...book._doc },
      });
    } catch (error) {
      res.status(500).json({ error: "something is wrong" });
    }
  }
);

bookRoute.get("/", authenticated, async (req, res) => {
  try {
    let query = {};
    const { language, sort, old, New, sortD, page, limit, userId, search } =
      req.query;
    const skip = (page - 1) * limit;
    if (language) {
      query.language = language;
    }
    let sortOption = { createdAt: -1 };
    if (sort == "asc") {
      sortOption.createdAt = 1;
    }

    let sortDate = { rating: -1 };

    if (sortD == "asc") {
      sortDate.rating = 1;
    }

    if (userId && userId === req.user._id) {
      query.userId = userId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    if (New) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      query.createdAt = { $gte: tenMinutesAgo };
    } else if (old) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      query.createdAt = { $lt: tenMinutesAgo };
    }

    const books = await bookModel
      .find(query)
      .sort(sortOption)
      .sort(sortD)
      .skip(skip)
      .limit(limit);
    res.status(200).json({ books });
  } catch (error) {
    res.status(404).json({ error: "koi data koni dhar marao" });
  }
});

bookRoute.put("/:id", authenticated, roleCheck, async (req, res) => {
  try {
    const { title, author, language, rating } = req.body;
    const { id } = req.params;

    const updatedBook = await bookModel.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, author, language, rating },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res
      .status(200)
      .json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

bookRoute.delete("/:id", authenticated, roleCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBook = await bookModel.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deletedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res
      .status(200)
      .json({ message: "Book deleted successfully", book: deletedBook });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = bookRoute;
