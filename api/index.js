import dotenv from "dotenv";
dotenv.config();

import app from "../app.js";
import { initApp } from "./init.js";

export default async function handler(req, res) {
  await initApp(app);

  return app(req, res);
}
