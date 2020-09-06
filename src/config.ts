// Loads environment variables
// Used only in development
require('dotenv').config({silent: true});

export = {
  EA_PORT: process.env.EA_PORT || 8080,
  AUTH: {
    rbl: {
      url: process.env.RBL_URL,
      auth: process.env.RBL_AUTH,
      callback_key: process.env.RBL_KEY,
    }
  }
}
