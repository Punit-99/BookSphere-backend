import { Application, Request, Response } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import redisClient from "../config/redis.js";
import typeDefs from "./typeDefs/index.typeDef.js";
import resolvers from "./resolvers/index.resolver.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export interface GraphQLContext {
  user: any;
  req: Request;
  res: Response;
  redis: typeof redisClient;
}

const createApolloServer = async (app: Application): Promise<void> => {
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<GraphQLContext> => {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        let user: any = null;

        try {
          if (accessToken) {
            const decoded = jwt.verify(
              accessToken,
              process.env.JWT_ACCESS_SECRET as string,
            ) as any;

            user = await User.findById(decoded.id).select("id role email name");
          } else if (refreshToken) {
            const decoded = jwt.verify(
              refreshToken,
              process.env.JWT_REFRESH_SECRET as string,
            ) as any;

            const dbUser = await User.findById(decoded.id);

            if (!dbUser) throw new Error("User not found");

            const newAccessToken = jwt.sign(
              {
                id: dbUser._id,
                role: dbUser.role,
                email: dbUser.email,
              },
              process.env.JWT_ACCESS_SECRET as string,
              { expiresIn: Math.floor(Number(process.env.ACCESS_TOKEN_EXPIRE || 900000) / 1000) }
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
        } catch (err: any) {
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
