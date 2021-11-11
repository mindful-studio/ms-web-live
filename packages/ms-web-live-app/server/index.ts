import { createServer, ServerResponse } from "http";
import next from "next";
import * as socketio from "socket.io";
import { Guest } from "@mindfulstudio/ms-web-live-types";

export interface LiveServerResponse extends ServerResponse {
  guests?: Guest[];
}

const port = parseInt(process.env.PORT || "5020", 10);
const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const handle = nextApp.getRequestHandler();

const io = new socketio.Server();

let sockets: socketio.Socket[] = [];

io.on("connection", (socket) => {
  sockets.push(socket);
  io.emit(
    "update",
    sockets.map((s) => ({ id: s.id }))
  );
  socket.on("disconnect", () => {
    sockets = sockets.filter((g) => g.id !== socket.id);
    io.emit(
      "update",
      sockets.map((s) => ({ id: s.id }))
    );
  });
});

nextApp.prepare().then(async () => {
  const server = createServer((req, res: LiveServerResponse) => {
    res.guests = sockets.map((s) => ({ id: s.id }));
    handle(req, res);
  }).listen(port);
  io.attach(server);
  console.log(`> Ready on http://localhost:${port}`);
});
