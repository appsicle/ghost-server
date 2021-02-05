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
};
