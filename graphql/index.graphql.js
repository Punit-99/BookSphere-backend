// src/graphql/index.js

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
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

        try {
          if (accessToken) {
            const decoded = jwt.verify(
              accessToken,
              process.env.JWT_ACCESS_SECRET,
            );

            return { user: decoded, req, res };
          }

          if (refreshToken) {
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
              { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
            );

            res.cookie("accessToken", newAccessToken, {
              httpOnly: true,
              secure: process.env.COOKIE_SECURE === "true",
              sameSite: "lax",
            });

            return { user: decoded, req, res };
          }

          return { user: null, req, res };
        } catch (err) {
          console.log("AUTH ERROR:", err.message);
          return { user: null, req, res };
        }
      },
    }),
  );
};

export default createApolloServer;
