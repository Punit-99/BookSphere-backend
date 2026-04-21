import { initApp } from "./api/init.js";
import app from "./app.js";

const PORT = 4000;

const start = async () => {
  await initApp(app);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();
