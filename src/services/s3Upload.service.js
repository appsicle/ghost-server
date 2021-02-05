const aws = require("aws-sdk")

module.exports = {
    getSignedURL: async (getSignedURLDTO) => {
        const { contentType } = getSignedURLDTO
        const fileExtension = contentType.split(/\//)[1]

        aws.config.setPromisesDependency();
        aws.config.update({
            accessKeyId: process.env.ACCESSKEYID,
            secretAccessKey: process.env.SECRETACCESSKEY,
            region: process.env.REGION
        });

        const s3 = new aws.S3();
        const URL_EXPIRATION_SECONDS = 300;
        const randomID = parseInt(Math.random() * 10000000);
        const key = `${randomID}.${fileExtension}`;

        // Get signed URL from S3
        const s3Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `textMsgs/${key}`,
            Expires: URL_EXPIRATION_SECONDS,
            ContentType: `${contentType}`,   //TODO: dynamically accept png and jpeg
            ACL:'public-read'
        };

        try {
            const uploadURL = s3.getSignedUrl('putObject', s3Params);
            return { uploadURL, key: `textMsgs/${key}` };
        } catch (err) {
            console.log(err)
            return { err };
        }
    }
}