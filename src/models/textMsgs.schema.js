const mongoose = require("mongoose");

const textMsgSchema = new mongoose.Schema({
  userId: String,
  firstName: String,
  email: String,
  additionalInfo: String,
  imageURLs: [String],
  status: String,
  reviews: {
    type: [
      {
        reviewerId: String,
        reviewerPic: String,
        reviewContent: [{ question: String, answer: String }],
      },
    ],
    default: [],
  },
  seenBy: { type: [String], default: [] }
});

const textMsgModel = mongoose.model("textMsg", textMsgSchema);

module.exports = textMsgModel;
