// Local API server used by `npm run dev` (Vite proxies /api here).
import { createServer } from "node:http";
import handler from "../api/index.js";

const port = Number(process.env.API_PORT || 3001);
createServer((req, res) => void handler(req, res)).listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
