import { randomUUID } from "crypto";
import { Socket } from "socket.io";

import Game from "@shared/game";

export default class Room extends Game {
  readonly code = randomUUID().substr(0, 5);

  readonly owner: Socket;
  private sockets: Socket[] = [];

  constructor(owner: Socket) {
    super();

    this.owner = owner;
  }

  addSocket(socket: Socket) {
    this.sockets.push(socket);

    this.players.forEach((p) => {
      socket.emit("game:addplayer", p);
    });
  }

  removeSocket(socket: Socket) {
    const i = this.sockets.findIndex((s) => s === socket);
    if (i === -1) return;

    this.sockets.splice(i, 1);

    if (socket === this.owner) {
      this.sockets.forEach((s) => {
        this.removeSocket(s);

        s.emit("room:left");
      });
    }
  }

  getSocketCount() {
    return this.sockets.length;
  }

  emitAll(event: string, ...args: any[]) {
    this.sockets.forEach((s) => {
      s.emit(event, ...args);
    });
  }
}
