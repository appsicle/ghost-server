const mongoose = require('mongoose');

// TODO: flag_context
const STATUS_OPTIONS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
};

const textMsgSchema = new mongoose.Schema(
  {
    revieweeObj: {
      userId: String,
      name: String,
      email: String,
      age: Number,
      ethnicity: String,
      location: String,
    },
    title: String,
    type: String,
    additionalInfo: String,
    imageURLs: [String],
    status: { type: String, default: STATUS_OPTIONS.PENDING },
    reviews: {
      type: [
        {
          reviewerObj: {
            userId: String,
            name: String,
            profilePic: String,
          },
          reviewContent: String,
          createdAt: Date,
        },
      ],
      default: [],
    },
    seenBy: { type: [String], default: [] },
    inappropriateFlag: [String],
    needsMoreContextFlag: [String],
    skippedFlag: [String],
  },
  { timestamps: true },
);

const textMsgModel = mongoose.model('textMsg', textMsgSchema);

module.exports = textMsgModel;
module.exports.STATUS_OPTIONS = STATUS_OPTIONS;
