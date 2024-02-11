const express = require("express");
const app = express();
const connectMongoDb = require("./database/database");
const port = process.env.PORT || 5000;
const cors = require("cors");

const authRoute = require("./routes/authRoutes");
const bookRoute = require("./routes/bookRoutes");
app.use(cors());
app.use(express.json());

app.use("/", authRoute);
app.use("/books", bookRoute);
app.use("/uploads", express.static("uploads"));

app.listen(port, async () => {
  console.log(`app is running on port ${port}`);
  await connectMongoDb();
});
