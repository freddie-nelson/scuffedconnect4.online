import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import setupSocket from "./socket";

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://scuffed4inarow.online", "https://scuffedconnect4.netlify.app"]
        : "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", setupSocket);

const port = 3000;

http.listen(port, () => {
  console.log("Server listening on port " + port);
});
