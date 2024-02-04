const mongoose = require("mongoose");

const authSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["CREATOR", "VIEW_ALL"], default: "VIEW_ALL" },
});

const authModel = mongoose.model("newUser", authSchema);

module.exports = authModel;
