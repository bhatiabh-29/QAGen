import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./app.js";
import { initDb, getDbPath } from "./db/connection.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3001;

async function start() {
  try {
    await initDb();

    const app = createApp();

    app.listen(port, () => {
      console.log(`QAgen backend running on port ${port}`);
      console.log(`SQLite database: ${getDbPath()}`);
    });
  } catch (err) {
    console.error("Failed to initialize database", err);
    process.exit(1);
  }
}

start();