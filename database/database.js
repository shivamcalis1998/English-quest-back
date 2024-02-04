const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

function connectMongoDb() {
  const url = process.env.MONGO_URL;
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection.on("connected", () => {
    console.log("databse has connected");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("databse has disconnected");
  });

  mongoose.connection.on("error", () => {
    console.log("databse has not connected due to some error");
  });
}

module.exports = connectMongoDb;
