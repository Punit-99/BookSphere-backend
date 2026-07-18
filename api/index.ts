import dotenv from "dotenv";
dotenv.config();

import app from "../app.js";
import { initApp } from "./init.js";
import { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await initApp(app);

  return (app as any)(req, res);
}
