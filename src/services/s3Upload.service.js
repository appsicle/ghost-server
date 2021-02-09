const aws = require("aws-sdk");

module.exports = {
  getSignedURL: async (getSignedURLDTO) => {
    const { contentType, bucket } = getSignedURLDTO;
    const fileExtension = contentType.split(/\//)[1];

    // obfuscated allowlist
    const bucketMap = {
      "reviewerProfilePic": "profilePic",
      "textMsgs": "textMsgs",
    };

    if (!bucketMap[bucket]) {
      console.log(
        `Include bucket, inputed: ${bucket}, expected ${Object.keys(bucketMap).join(
          ","
        )}`
      );
      return {
        err: `Include bucket, inputed: ${bucket}, expected ${Object.keys(bucketMap).join(
          ","
        )}`,
      };
    }

    aws.config.setPromisesDependency();
    aws.config.update({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: process.env.REGION,
    });

    const s3 = new aws.S3();
    const URL_EXPIRATION_SECONDS = 300;
    const randomID = parseInt(Math.random() * 10000000);
    const key = `${randomID}.${fileExtension}`;

    // Get signed URL from S3
    const s3Params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${bucketMap[bucket]}/${key}`,
      Expires: URL_EXPIRATION_SECONDS,
      ContentType: `${contentType}`, //TODO: dynamically accept png and jpeg
      ACL: "public-read",
    };

    try {
      const uploadURL = s3.getSignedUrl("putObject", s3Params);
      return { uploadURL, key: `${bucketMap[bucket]}/${key}` };
    } catch (err) {
      console.log(err);
      return { err };
    }
  },
};
