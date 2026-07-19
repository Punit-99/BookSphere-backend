import dotenv from "dotenv";
dotenv.config();

import { initApp } from "./api/init";
import app from "./app";

const PORT = process.env.PORT || 4000;

const start = async (): Promise<void> => {
  await initApp(app);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();
