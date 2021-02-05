const TextMsgModel = require('../models/textMsgs.schema')

module.exports = {
    save: async (id, textMsgsDTO) => {
        const { firstName, email, additionalInfo, imageURLs } = textMsgsDTO

        const textMsgInstance = new TextMsgModel({
            userId: id,
            firstName: firstName,
            email: email,
            additionalInfo: additionalInfo,
            imageURLs: imageURLs,
            status: "Not Reviewed"
        })

        try {
            const confirmedTextMsg = await textMsgInstance.save();
            return { confirmedTextMsg };
        } catch (err) {
            console.log(err)
            return { err };
        }

    },
    retrieve: async (id) => {

        try {
            const retrievedTextMsg = await TextMsgModel.findOne({ userId: id });
            return { retrievedTextMsg };
        } catch (err) {
            console.log(err)
            return { err };
        }
    }
}