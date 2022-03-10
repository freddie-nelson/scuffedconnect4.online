import { io } from "socket.io-client";

const SERVER_URL = process.env.NODE_ENV === "production" ? "" : `http://${window.location.hostname}:3000`;

export default class Socket {
  socket = io(SERVER_URL);
  isConnected = false;

  constructor() {
    this.socket.on("connect", () => (this.isConnected = true));
    this.socket.on("disconnect", () => (this.isConnected = false));
  }
}
