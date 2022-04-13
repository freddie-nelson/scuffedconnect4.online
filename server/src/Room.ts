import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";

import Game from "@shared/game";

export default class Room extends Game {
  readonly code = uuidv4().substr(0, 5);

  owner: Socket;
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
      this.owner = this.sockets[Math.floor(Math.random() * this.sockets.length)];
    }

    this.players.forEach((p) => {
      if (p.socketId === socket.id) {
        this.removePlayer(p);
        this.emitAll("game:removeplayer", p);
      }
    });

    if (this.getPlayerCount() < 2) {
      this.emitAll("room:forceleave");
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
