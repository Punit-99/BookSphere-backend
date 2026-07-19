import dotenv from "dotenv";
dotenv.config();

import app from "../app";
import { initApp } from "./init";
import { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await initApp(app);

  return (app as any)(req, res);
}
