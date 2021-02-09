const { StatusCodeError } = require("../errors");
const TextMsgModel = require("../models/textMsgs.schema");
const sendGridService = require("../services/sendGrid.service");

module.exports = {
  save: async (id, textMsgsDTO) => {
    const { firstName, email, additionalInfo, imageURLs } = textMsgsDTO;

    const textMsgInstance = new TextMsgModel({
      userId: id,
      firstName: firstName,
      email: email,
      additionalInfo: additionalInfo,
      imageURLs: imageURLs,
      status: "Not Reviewed", // TODO: formalize possible statuses
    });

    const confirmedTextMsg = await textMsgInstance.save();
    return confirmedTextMsg;
  },
  retrieve: async (id) => {
    const retrievedTextMsg = await TextMsgModel.findOne({ _id: id });
    return retrievedTextMsg;
  },
  review: async (reviewDTO) => {
    const { textMsgId, reviewContent, imageURLs } = reviewDTO;

    // attach review to current textMsg object

    // TODO: use reviewerId to check for dups in the future
    const findDup = await TextMsgModel.find({
      _id: textMsgId,
      reviews: {
        $elemMatch: {
          reviewContent: { $elemMatch: { answer: reviewContent[0].answer } },
        },
      },
    });

    if (findDup.length) {
      console.log("Found duplicate, blocking this request", findDup);
      throw new StatusCodeError(409, "Duplicate entry")
    }

    const confirmedTextMsg = await TextMsgModel.findOneAndUpdate(
      { _id: textMsgId },
      {
        $push: {
          reviews: { reviewerId: "whateverfornow", reviewContent, reviewerPics: imageURLs },
        },
        $set: { status: "reviewed" },
      },
      { new: true }
    );

    // TODO: deprecate usage
    // TODO: should probably in the router instead of nested in here
    // sendGridService.sendEmail(confirmedTextMsg.email, confirmedTextMsg.additionalInfo, confirmedTextMsg.imageURLs, imageURLs, reviewContent);

    return { confirmedTextMsg };
  },
  retrieveNext: async (reviewerUserId, lastRetrievedTextMsgId) => {
    console.log(reviewerUserId, lastRetrievedTextMsgId)

    // Fetch a text message that the reviewer hasn't seen before
    let retrievedTextMsg;
    if (lastRetrievedTextMsgId) { // pagination speed up if available
      retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
        { _id: { $gt: lastRetrievedTextMsgId }, seenBy: { $ne: reviewerUserId }, "reviews.reviewerId": { $ne: reviewerUserId } },
        {
          $push: {
            seenBy: reviewerUserId,
          },
        },
        { new: true }
      );
    } else {
      retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
        { seenBy: { $ne: reviewerUserId }, "reviews.reviewerId": { $ne: reviewerUserId } },
        {
          $push: {
            seenBy: reviewerUserId,
          },
        },
        { new: true }
      );
    }

    // TODO: project only relevant fields

    return retrievedTextMsg;
  }
};
