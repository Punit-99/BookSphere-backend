import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import redisClient from "../config/redis.js";
import typeDefs from "./typeDefs/index.typeDef.js";
import resolvers from "./resolvers/index.resolver.js";
import jwt from "jsonwebtoken";

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
            user = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
          } else if (refreshToken) {
            const decoded = jwt.verify(
              refreshToken,
              process.env.JWT_REFRESH_SECRET,
            );

            const newAccessToken = jwt.sign(
              {
                id: decoded.id,
                role: decoded.role,
                email: decoded.email,
              },
              process.env.JWT_ACCESS_SECRET,
              { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE) },
            );

            res.cookie("accessToken", newAccessToken, {
              httpOnly: true,
              secure: process.env.COOKIE_SECURE === "true",
              sameSite: process.env.COOKIE_SAME_SITE || "lax",
            });

            user = decoded;
          }
        } catch (err) {
          console.log("AUTH ERROR:", err.message);
        }

        return {
          user,
          req,
          res,
          redis: redisClient, // 🔥 ONLY PASS IT HERE
        };
      },
    }),
  );
};

export default createApolloServer;
