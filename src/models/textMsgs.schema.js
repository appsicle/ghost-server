const mongoose = require("mongoose");

const textMsgSchema = new mongoose.Schema({
  revieweeObj: {
    userId: String,
    name: String,
    email: String,
    age: Number,
    ethnicity: String,
    location: String
  },
  additionalInfo: String,
  imageURLs: [String],
  status: String,
  reviews: {
    type: [
      {
        reviewerObj: {
          userId: String,
          name: String,
          profilePic: String,
        },
        reviewContent: [{ question: String, answer: String }],
      },
    ],
    default: [],
  },
  seenBy: { type: [String], default: [] }
});

const textMsgModel = mongoose.model("textMsg", textMsgSchema);

module.exports = textMsgModel;
