// Loads environment variables
// Used only in development
require('dotenv').config({silent: true});

const getBasicAuth = (user, pass) => {
  let base64 = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${base64}`;
};

export default {
  EA_PORT: process.env.EA_PORT || 8080,     // Port this server will listen on
  PAY_TIMEOUT_MINS: 10,                     // Collect requests timeout/expire
  BANK: {
    rbl: {
      url: process.env.RBL_URL,
      username: process.env.RBL_USERNAME,
      password: process.env.RBL_PASSWORD,
      auth: process.env.RBL_AUTH,
      callback_key: process.env.RBL_KEY,
      bcagent: "Rki2160863",
      mrchOrgId: "rkicks",
      aggrOrgId: "rkicks",
    },
    cashfree: {
      appid: process.env.CF_APP_ID,
      secret: process.env.CF_KEY,
      url: process.env.CF_CHECKOUT_URL,
      verify_url: process.env.CF_URL,
      callback_url: "https://bank.unipeer.exchange/api/v1/callback/cashfree"
    }
  },
  NODE_URL: process.env.NODE_URL,
  NODE_AUTH: process.env.NODE_AUTH,
  NODE_AUTH_OUT: process.env.NODE_AUTH_OUT,
}
