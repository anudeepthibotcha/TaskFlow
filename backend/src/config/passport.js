
import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import User from "../models/User.js";

const COOKIE_NAME = "taskflow_token";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from the .env file");
}

// Extract the JWT from the HTTP-only cookie.
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies[COOKIE_NAME] || null;
  }

  return null;
};

// Strategy 1: Verify the email and password during login.
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          email: email.trim().toLowerCase(),
        }).select("+password");

        if (!user) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        const passwordMatches = await user.comparePassword(password);

        if (!passwordMatches) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Strategy 2: Verify JWTs on protected routes.
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
      algorithms: ["HS256"],
    },
    async (payload, done) => {
      try {
        if (!payload.sub) {
          return done(null, false);
        }

        const user = await User.findById(payload.sub);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
