const sendGridAPI = require("@sendgrid/mail");
const { eventNames } = require("../models/textMsgs.schema");

module.exports = {
  sendEmail: (
    email,
    additionalInfo,
    textMsgPics,
    reviewerPics,
    reviewContent
  ) => {
    console.log(
      email,
      additionalInfo,
      textMsgPics,
      reviewerPics,
      reviewContent
    );

    sendGridAPI.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email, // Change to your recipient
      from: process.env.SENDGRID_EMAIL, // Change to your verified sender
      subject: "Your results are in!",
      text: "Coool",
      html: `<html lang="en">
      <head>
        <meta charset="utf-8" />
      </head>
    
      <body>
        <div style="display: flex; flex-flow: column; align-items: center;">
          <a href=${
            process.env.EMAIL_FEEDBACK_FORM
          }><h1>Pre-Alpha testing: Please take this survey after you have read your results.</h1></a>
        </div>
        <hr />
        <div style="display: flex; flex-flow: column; align-items: center;">
          <h1>Your Reviewer</h1>
          <img
            height="400px"
            src=${reviewerPics[0]}
          />
          <h2>Anonymous Cheeseburger</h2>
          <p>
            Meet your reviewer! She has given you feedback but chose to remain anonymous. 
          </p>
        </div>
        <hr />
        <div style="display: flex; flex-flow: column; align-items: center;">
          <h1>Your Submission</h1>
          <div
            style="
              display: flex;
              flex-flow: row wrap;
              justify-content: space-evenly;
            "
          >
          ${textMsgPics.map(
            (pic) =>
              `<img
            style="padding: 16px"
            height="400px"
            src=${pic}
          />`
          ).join('')}
          </div>
          ${
            additionalInfo
              ? `<h2>Additional Information</h2>
            <p>${additionalInfo}</p>`
              : ""
          }
        </div>
        <hr />
        <div style="display: flex; flex-flow: column; align-items: center;">
          <h1>Feedback from the reviewer</h1>
          <ol>
            ${reviewContent.map(
              (qna) => `<li>
                <h3>
                    ${qna.question}
                </h3>
                <p>
                    ${qna.answer}
                </p>
              </li>`
            ).join('')}
          </ol>
        </div>
      </body>
    </html>`,
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
