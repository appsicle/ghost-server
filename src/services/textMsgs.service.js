const { StatusCodeError } = require("../errors");
const TextMsgModel = require("../models/textMsgs.schema");
const sendGridService = require("../services/sendGrid.service");

module.exports = {
  save: async (userObj, additionalInfo, imageURLs) => {
    const { userId, name, email, age, ethnicity, location } = userObj;

    const textMsgInstance = new TextMsgModel({
      revieweeObj: {
        userId: userId,
        name: name,
        email: email,
        age: age,
        ethnicity: ethnicity,
        location: location,
      },
      additionalInfo: additionalInfo,
      imageURLs: imageURLs,
      status: "Not Reviewed", // TODO: formalize possible statuses or deprecate
    });

    const confirmedTextMsg = await textMsgInstance.save();
    return confirmedTextMsg;
  },
  retrieve: async (id) => {
    const retrievedTextMsg = await TextMsgModel.findOne({ _id: id });
    return retrievedTextMsg;
  },
  review: async (reviewerObj, textMsgId, reviewContent) => {
    const { userId, name, profilePic } = reviewerObj;

    const findDup = await TextMsgModel.find({ _id: textMsgId });
    if (findDup.length) {
      console.log("Found duplicate, blocking this request", findDup);
      throw new StatusCodeError(409, "Duplicate entry")
    }

    const confirmedTextMsg = await TextMsgModel.findOneAndUpdate(
      { _id: textMsgId },
      {
        $push: {
          reviews: {
            reviewerObj: { userId, name, profilePic },
            reviewContent
          }
        },
        $set: { status: "reviewed" },
      },
      { new: true }
    );

    return { confirmedTextMsg };
  },
  retrieveNext: async (reviewerUserId, lastRetrievedTextMsgId) => {
    console.log(reviewerUserId, lastRetrievedTextMsgId)

    // Fetch a text message that the reviewer hasn't seen before
    let retrievedTextMsg;
    if (lastRetrievedTextMsgId) { // pagination speed up if available
      retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
        { _id: { $gt: lastRetrievedTextMsgId }, seenBy: { $ne: reviewerUserId }, "reviews.reviewerId": { $ne: reviewerUserId } },
        { $push: { seenBy: reviewerUserId } },
        { new: true }
      );
      // wrap around search
      if (retrievedTextMsg.length === 0) {
        retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
          { seenBy: { $ne: reviewerUserId }, "reviews.reviewerId": { $ne: reviewerUserId } },
          { $push: { seenBy: reviewerUserId } },
          { new: true }
        );
      }
    } else {
      retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
        { seenBy: { $ne: reviewerUserId }, "reviews.reviewerId": { $ne: reviewerUserId } },
        { $push: { seenBy: reviewerUserId } },
        { new: true }
      );
    }

    // TODO: project only relevant fields

    return retrievedTextMsg;
  },
  _clearReviewerFromAll: async (reviewerUserId, seenArray = false, reviewArray = false) => {
    console.log(reviewerUserId, seenArray, reviewArray)
    try {

      let retrievedTextMsg;
      if (seenArray) {
        retrievedTextMsg = await TextMsgModel.updateMany(
          {},
          { $pull: { seenBy: reviewerUserId } }
        );
      }

      let retrievedTextMsg2;
      if (reviewArray) {
        retrievedTextMsg2 = await TextMsgModel.updateMany(
          {},
          { $pull: { reviews: { reviewId: reviewerUserId } } }
        );
      }

      console.log(retrievedTextMsg, retrievedTextMsg2)


      return { retrievedTextMsg, retrievedTextMsg2 };
    } catch (err) {
      console.log(err)
      throw `error: ${err}`
    }
  }
};
