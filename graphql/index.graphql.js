import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import redisClient from "../config/redis.js";
import typeDefs from "./typeDefs/index.typeDef.js";
import resolvers from "./resolvers/index.resolver.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const createApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        let user = null;

        try {
          if (accessToken) {
            const decoded = jwt.verify(
              accessToken,
              process.env.JWT_ACCESS_SECRET,
            );

            // 🔥 ALWAYS FETCH USER FROM DB
            user = await User.findById(decoded.id).select("id role email name");
          } else if (refreshToken) {
            const decoded = jwt.verify(
              refreshToken,
              process.env.JWT_REFRESH_SECRET,
            );

            const dbUser = await User.findById(decoded.id);

            if (!dbUser) throw new Error("User not found");

            const newAccessToken = jwt.sign(
              {
                id: dbUser._id,
                role: dbUser.role,
                email: dbUser.email,
              },
              process.env.JWT_ACCESS_SECRET,
              { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
            );

            res.cookie("accessToken", newAccessToken, {
              httpOnly: true,
              secure: process.env.COOKIE_SECURE === "true",
              sameSite: "none",
            });

            user = {
              id: dbUser._id,
              role: dbUser.role,
              email: dbUser.email,
            };
          }
        } catch (err) {
          console.log("AUTH ERROR:", err.message);
          user = null;
        }

        return {
          user,
          req,
          res,
          redis: redisClient,
        };
      },
    }),
  );
};

export default createApolloServer;
