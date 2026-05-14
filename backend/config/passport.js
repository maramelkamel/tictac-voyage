const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { upsertGoogleClient } = require('../models/authModel');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email     = profile.emails?.[0]?.value;
        const photo     = profile.photos?.[0]?.value;
        const firstName = profile.name?.givenName  || profile.displayName || '';
        const lastName  = profile.name?.familyName || '';

        if (!email) return done(new Error('Email Google non disponible'), null);

        const client = await upsertGoogleClient({
          google_id:  profile.id,
          email,
          first_name: firstName,
          last_name:  lastName,
          avatar_url: photo || null,
        });

        return done(null, client);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;