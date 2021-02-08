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
      maxAge: 24 * 60 * 60 * 1000 // 24hours
    }),
  }),
};
