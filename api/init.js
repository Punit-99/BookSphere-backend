import { connectDB } from "../config/db.js";
import createApolloServer from "../graphql/index.graphql.js";

let initialized = false;

export const initApp = async (app) => {
  if (initialized) return;

  console.log("Connecting DB...");
  await connectDB();

  console.log("Starting Apollo...");
  await createApolloServer(app);

  initialized = true;
};
