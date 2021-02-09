const aws = require("aws-sdk");
const { v4: uuid } = require("uuid");
const { BadInputError } = require('../errors')

// obfuscated allowlist
const bucketMap = {
  "reviewerProfilePic": "profilePic",
  "textMsgs": "textMsgs",
};

module.exports = {
  getSignedURL: async (getSignedURLDTO) => {
    const { contentType, bucket } = getSignedURLDTO;
    const fileExtension = contentType?.split(/\//)[1];

    if (!fileExtension) {
      throw new BadInputError(`Recieved unexpected content-type: ${fileExtension}`);
    }

    if (!bucketMap[bucket]) {
      throw new BadInputError(`Include bucket, inputed: ${bucket}, expected ${Object.keys(bucketMap).join(",")}`);
    }

    aws.config.setPromisesDependency();
    aws.config.update({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: process.env.REGION,
    });

    const s3 = new aws.S3();
    const URL_EXPIRATION_SECONDS = 300;
    const fileExtention = `${bucketMap[bucket]}/${uuid()}.${fileExtension}`;

    const s3Params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileExtention,
      Expires: URL_EXPIRATION_SECONDS,
      ContentType: `${contentType}`,
      ACL: "public-read",
    };

    const uploadURL = s3.getSignedUrl("putObject", s3Params);
    return { uploadURL, key: fileExtention };
  },
};
