const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');

const sessionMiddleware = require('./middleware/session.middleware');

const s3UploadRouter = require('./routes/s3Upload.router');
const textMsgsRouter = require('./routes/textMsgs.router');
const sanityCheckRouter = require('./routes/sanityCheck.router');
const userRouter = require('./routes/user.router');
const authRouter = require('./routes/auth.router');
const cors = require('cors');
const bodyParser = require('body-parser');
const { errorHandler } = require('./middleware/errorHandler.middleware')

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
app.use(
  cors({
    origin: 'localhost:3000',
    credentials: true,
    exposedHeaders: ['set-cookie'],
  }),
);
app.use(bodyParser.json());
app.use(sessionMiddleware.session);

// routes
app.use('/', sanityCheckRouter);
app.use('/api', s3UploadRouter);
app.use('/api/auth', authRouter);
app.use('/api/textMsgs', textMsgsRouter);
app.use('/api/user', userRouter);

// error handler
app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
