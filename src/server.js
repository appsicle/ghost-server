const express = require('express')
const dotenv = require('dotenv')
const mongoose = require("mongoose")
const s3UploadRouter = require('./routes/s3Upload.router')
const textMsgsRouter = require('./routes/textMsgs.router')
const sanityCheckRouter = require('./routes/sanityCheck.router')


dotenv.config();

var app = express()

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/', sanityCheckRouter);
app.use('/api', s3UploadRouter);
app.use('/api/textMsgs', textMsgsRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});