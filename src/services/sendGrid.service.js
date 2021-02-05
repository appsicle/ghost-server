const sendGridAPI = require("@sendgrid/mail");

module.exports = {
  sendEmail: (email, reviewerPics, reviewContent) => {
    sendGridAPI.setApiKey(process.env.SENDGRID_API_KEY);
    console.log(email, "TESTING")
    const msg = {
      to: "aalbertzhang@gmail.com", // Change to your recipient
      from: process.env.SENDGRID_EMAIL, // Change to your verified sender
      subject: "You're results are in!",
      text: "Coool",
      html: `<strong>${reviewerPics.map(pic => `<img src=${pic}>`)}</strong><hr>${reviewContent.map(
        (qna) => `<p>${qna.question}</p><p>${qna.answer}</p>`
      )}`,
    };
    sendGridAPI
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  },
};
