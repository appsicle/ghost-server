var session = require("express-session");
const MongoStore = require("connect-mongo")(session);

module.exports = {
  session: session({
    secret: "uberubersecretsecretthingy",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new MongoStore({
      url: process.env.MONGODB_URI,
    }),
  }),
};
