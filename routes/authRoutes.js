const express = require("express");
const UserModel = require("../model/authModel");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");

const authRoute = express.Router();

authRoute.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(500).json({ error: "user already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword };

    if (email.includes("creator")) {
      newUser.role = "CREATOR";
    }

    const user = new UserModel(newUser);
    await user.save();
    res.status(201).json({ message: "signup successfully done", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something is wrong" });
  }
});

authRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ error: "user doesn't exist" });
    }

    const hashedPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!hashedPassword) {
      return res.status(401).json({ error: "invalid credential" });
    }

    const token = await jwt.sign(
      { user: existingUser },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message: "login succesfully", token, role: existingUser.role });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

module.exports = authRoute;
