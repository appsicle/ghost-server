var session = require("express-session");
const MongoStore = require("connect-mongo")(session);

module.exports = {
  session: session({
    secret: "uberubersecretsecretthingy",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, domain: 'https://noghost.netlify.app' }, // add domain
    store: new MongoStore({
      url: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60 // 1 day
    }),
  }),
};
