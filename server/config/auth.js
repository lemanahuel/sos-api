'use strict';

module.exports = {

  facebookAuth: {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL
  },

  twitterAuth: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  },

  googleAuth: {
    clientID: 'your-secret-clientID-here',
    clientSecret: 'your-client-secret-here',
    callbackURL: 'https://localhost:3040/auth/google/callback'
  },

  sendgrid: {
    qa: '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',
    prod: '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'
  }

};
