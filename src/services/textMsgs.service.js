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
      status: "Not Reviewed",
    });

    try {
      const confirmedTextMsg = await textMsgInstance.save();
      return { confirmedTextMsg };
    } catch (err) {
      console.log(err);
      return { err };
    }
  },
  retrieve: async (id) => {
    try {
      const retrievedTextMsg = await TextMsgModel.findOne({ _id: id });
      return { retrievedTextMsg };
    } catch (err) {
      console.log(err);
      return { err };
    }
  },
  review: async (reviewDTO) => {
    const { textMsgId, reviewContent, imageURLs } = reviewDTO;

    // attach review to current textMsg object
    try {
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
        return {
          err: {
            severity: 3,
            msg: "Potential duplicate, request blocked",
          },
        };
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

      sendGridService.sendEmail(confirmedTextMsg.email, confirmedTextMsg.additionalInfo, confirmedTextMsg.imageURLs, imageURLs, reviewContent);

      return { confirmedTextMsg };
    } catch (err) {
      console.log(err);
      return { err };
    }
  },
  retrieveNext: async (reviewerUserId, lastRetrievedTextMsgId) => {
    console.log(reviewerUserId, lastRetrievedTextMsgId)
    try {

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
    } catch (err) {
      console.log(err)
      throw `error: ${err}`
    }
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
