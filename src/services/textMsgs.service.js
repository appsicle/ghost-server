const { StatusCodeError, BadInputError } = require("../errors");
const TextMsgModel = require("../models/textMsgs.schema");

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
      status: 'Not Reviewed', // TODO: formalize possible statuses or deprecate
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

    const findDup = await TextMsgModel.find({ _id: textMsgId, 'reviews.reviewerObj.userId': userId });
    if (findDup.length) {
      console.log('Found duplicate, blocking this request', findDup);
      throw new StatusCodeError(409, 'Duplicate entry');
    }

    const confirmedTextMsg = await TextMsgModel.findOneAndUpdate(
      { _id: textMsgId },
      {
        $push: {
          reviews: {
            reviewerObj: { userId, name, profilePic },
            reviewContent,
          },
        },
        $set: { status: 'reviewed' },
      },
      { new: true },
    );

    return { confirmedTextMsg };
  },
  retrieveNext: async (reviewerUserId, lastRetrievedTextMsgId) => {
    console.log(reviewerUserId, lastRetrievedTextMsgId);

    // Fetch a text message that the reviewer hasn't seen before
    let retrievedTextMsg;
    if (lastRetrievedTextMsgId) {
      // pagination speed up if available
      retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
        {
          _id: { $gt: lastRetrievedTextMsgId },
          seenBy: { $ne: reviewerUserId },
          'reviews.reviewerId': { $ne: reviewerUserId },
        },
        { $push: { seenBy: reviewerUserId } },
        { new: true },
      );
      // wrap around search
      if (retrievedTextMsg.length === 0) {
        retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
          {
            seenBy: { $ne: reviewerUserId },
            'reviews.reviewerId': { $ne: reviewerUserId },
          },
          { $push: { seenBy: reviewerUserId } },
          { new: true },
        );
      }
    } else {
      retrievedTextMsg = await TextMsgModel.findOneAndUpdate(
        {
          seenBy: { $ne: reviewerUserId },
          'reviews.reviewerId': { $ne: reviewerUserId },
        },
        { $push: { seenBy: reviewerUserId } },
        { new: true },
      );
    }

    // TODO: project only relevant fields

    return retrievedTextMsg;
  },
  flag: async (reviewerUserId, textMsgId, category) => {

    let confirmedTextMsg = null;
    switch (category) {
      case "needs more context":
        confirmedTextMsg = await TextMsgModel.findOneAndUpdate(
          { _id: textMsgId },
          { $push: { needsMoreContextFlag: reviewerUserId } },
          { new: true }
        );
        break;
      case "skip":
        confirmedTextMsg = await TextMsgModel.findOneAndUpdate(
          { _id: textMsgId },
          { $push: { skippedFlag: reviewerUserId } },
          { new: true }
        );
        break;
      case "inappropriate":
        confirmedTextMsg = await TextMsgModel.findOneAndUpdate(
          { _id: textMsgId },
          { $push: { inappropriateFlag: reviewerUserId } },
          { new: true }
        );
        break;
      default:
        throw new BadInputError(`Unexpected category: ${category}`)
    }

    return confirmedTextMsg;
  },
  retrieveSubmissionsForUser: async (revieweeUserId) => {
    return TextMsgModel.find({"revieweeObj.userId": revieweeUserId});
  },
  _clearReviewerFromAll: async (reviewerUserId, seenArray = false, reviewArray = false, inappropriateFlag = false, needsMoreContextFlag = false, skippedFlag = false) => {
    console.log(reviewerUserId, seenArray, reviewArray, inappropriateFlag, needsMoreContextFlag, skippedFlag)
    try {
      let retrievedTextMsg;
      if (seenArray) {
        retrievedTextMsg = await TextMsgModel.updateMany(
          {},
          { $pull: { seenBy: reviewerUserId } },
        );
      }

      let retrievedTextMsg2;
      if (reviewArray) {
        retrievedTextMsg2 = await TextMsgModel.updateMany(
          {},
          { $pull: { reviews: { 'reviewerObj.userId': reviewerUserId } } },
        );
      }

      let retrievedInappropriateFlag;
      if (inappropriateFlag) {
        retrievedInappropriateFlag = await TextMsgModel.updateMany(
          {},
          { $pull: { inappropriateFlag: reviewerUserId } }
        );
      }

      let retrievedNeedsMoreContextFlag;
      if (needsMoreContextFlag) {
        retrievedNeedsMoreContextFlag = await TextMsgModel.updateMany(
          {},
          { $pull: { needsMoreContextFlag: reviewerUserId } }
        );
      }

      let retrievedSkippedFlag;
      if (skippedFlag) {
        retrievedSkippedFlag = await TextMsgModel.updateMany(
          {},
          { $pull: { skippedFlag: reviewerUserId } }
        );
      }

      return { retrievedTextMsg, retrievedTextMsg2, retrievedInappropriateFlag, retrievedNeedsMoreContextFlag, retrievedSkippedFlag};
    } catch (err) {
      console.log(err);
      throw `error: ${err}`;
    }
  },
};
