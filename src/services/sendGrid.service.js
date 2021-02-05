const sendGridAPI = require("@sendgrid/mail");

module.exports = {
  sendEmail: (email, reviewerPic, reviewTexts) => {
    sendGridAPI.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email, // Change to your recipient
      from: process.env.SENDGRID_EMAIL, // Change to your verified sender
      subject: "You're results are in!",
      text: "Coool",
      html: `<strong><img src=${reviewerPic}></strong><hr>${reviewTexts.map(
        (review) => `<p>${review}</p>`
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
