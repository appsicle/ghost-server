const TextMsgModel = require("../models/textMsgs.schema");

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
      const retrievedTextMsg = await TextMsgModel.findOne({ userId: id });
      return { retrievedTextMsg };
    } catch (err) {
      console.log(err);
      return { err };
    }
  },
  review: async (reviewDTO) => {
    // TODO: send email via sendgrid
    const { textMsgId, reviewerId, reviewText } = reviewDTO;

    // attach review to current textMsg object
    try {
      const confirmedTextMsg = await TextMsgModel.updateOne(
        { _id: textMsgId },
        {
          $push: { reviews: { reviewerId: reviewerId, review: reviewText } },
          $set: { status: "reviewed" },
        }
      );
      return { confirmedTextMsg };
    } catch (err) {
      console.log(err);
      return { err };
    }

    
  },
};
