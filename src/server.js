const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const s3UploadRouter = require("./routes/s3Upload.router");
const textMsgsRouter = require("./routes/textMsgs.router");
const sanityCheckRouter = require("./routes/sanityCheck.router");
const userRouter = require('./routes/user.router')
const cors = require("cors");

dotenv.config();

var app = express();

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes
app.use("/", sanityCheckRouter);
app.use("/api", s3UploadRouter);
app.use("/api/textMsgs", textMsgsRouter);
app.use("/api/user", userRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
