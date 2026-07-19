import { Application } from "express";
import { connectDB } from "../config/db";
import createApolloServer from "../graphql/index.graphql";

let initialized = false;

export const initApp = async (app: Application): Promise<void> => {
  if (initialized) return;

  console.log("Connecting DB...");
  await connectDB();

  console.log("Starting Apollo...");
  await createApolloServer(app);

  initialized = true;
};
