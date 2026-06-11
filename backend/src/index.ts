import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./lib/env";
import { initSocket } from "./lib/socket";

const app = createApp();
const server = createServer(app);

initSocket(server);

server.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
  console.log(`Real-time (Socket.IO) ready`);
});
