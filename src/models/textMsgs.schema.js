const mongoose = require("mongoose")

const textMsgSchema = new mongoose.Schema({
    userId: String,
    firstName: String,
    email: String,
    additionalInfo: String,
    imageURLs: [String]
});

const textMsgModel = mongoose.model('textMsg', textMsgSchema);

module.exports = textMsgModel;