import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import config from "../config";
import models from "../models";
import jwtHelper from "../utilities/jsonwebtoken";

const { generateToken } = jwtHelper;

passport.use(
  new Strategy(
    {
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: config.CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await models.Users.findOne({ where: { email: profile.emails?.[0].value } });
      if (user) {
        const { id, email } = user;
        const token = await generateToken({ id, email });
        user.active = true;
        const userDetails = {
          id,
          email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role,
          phone: user.phone,
          photo: user.photo,
          location: user.location,
          balance: user.balance,
          dob: user.dob,
          active: user.active,
          verified: user.verified
        };
        return done(null, userDetails, token);
      }
      if (!user) {
        const newUser = await models.Users.create({
          googleId: profile.id,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          email: profile.emails?.[0].value,
          username: profile.emails?.[0].value.substring(0, profile.emails?.[0].value.lastIndexOf("@")),
          photo: profile.photos?.[0].value,
          active: true,
          verified: true,
        });
        const { id, email } = newUser;
        const token = await generateToken({ id, email });
        console.log(token);
        if (newUser) {
          done(null, newUser, token);
        }
      } else {
        done(null, user);
      }
    }
  )
);
