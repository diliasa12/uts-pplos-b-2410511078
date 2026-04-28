import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (generateAccessToken, RefreshToken, profile, done) => {
      try {
        const provider_id = profile.clientID;
        const name = profile.displayName;
        const email = profile.emails?.[0]?.value;
        const avatar_url = profile.photos?.[0]?.value;
        const verified_email = profile.emails?.[0]?.verified_email;

        if (!email) {
          return done(new Error("Email not found"), null);
        }
        if (!verified_email) {
          return done(new Error("Email is not verified"), null);
        }
        let user = await User.findByOauthProviderId(
          "google",
          String(provider_id),
        );
        if (!user) {
          user = await User.findByEmail(email);
          if (user) {
            await User.updateOauth(user.id, {
              oauth_provider: "google",
              oauth_provider_id: String(provider_id),
              profile_photo_url: avatar_url,
            });
            user = await User.findById(user.id);
          } else {
            await User.createOAuth({
              name,
              email,
              oauth_provider: "google",
              oauth_provider_id: String(provider_id),
              profile_photo_url: avatar_url,
            });
            user = await User.findByEmail(email);
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);
export default passport;
