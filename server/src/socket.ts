import { Socket } from "socket.io";
import { RateLimiter } from "limiter";

import Filter from "bad-words";
import Room from "./Room";
import Player from "@shared/player";
const filter = new Filter();

const rooms: { [index: string]: Room } = {};
const publicRooms: { host: string; code: string; maxPlayers: number; playerCount: number }[] = [];

export default function (socket: Socket) {
  const store: {
    room?: Room;
  } = {
    room: undefined,
  };

  const joinRoom = (code: string) => {
    if (store.room) return;

    const room = rooms[code];
    if (!room || room.hasStarted() || room.getPlayerCount() >= 8) {
      socket.emit("room:notfound");
      return;
    }

    store.room = room;
    socket.emit("room:joined", room.code);

    room.addSocket(socket);
  };

  const leaveRoom = () => {
    const room = store.room;
    if (!room) return;

    store.room = undefined;
    room.removeSocket(socket);

    socket.emit("room:left");

    if (room.getSocketCount() === 0) {
      delete rooms[room.code];
    }
  };

  const createRoom = () => {
    if (store.room) return;

    const room = new Room(socket);
    rooms[room.code] = room;

    socket.emit("room:created", room.code);

    joinRoom(room.code);
  };

  socket.on("disconnect", leaveRoom);

  socket.on("room:create", createRoom);

  socket.on("room:join", joinRoom);

  socket.on("room:leave", leaveRoom);

  // game events
  socket.on("game:start", () => {
    if (!store.room || socket !== store.room.owner) return;

    if (store.room.start()) store.room.emitAll("game:start", store.room.getPlaying());
  });

  socket.on("game:restart", () => {
    if (!store.room || socket !== store.room.owner) return;

    if (store.room.restart()) store.room.emitAll("game:restart", store.room.getPlaying());
  });

  socket.on("game:addplayer", (p: Player) => {
    if (!store.room) return;

    const player = { ...p, socketId: socket.id };
    if (store.room.addPlayer(player)) store.room.emitAll("game:addplayer", player);
  });

  socket.on("game:removeplayer", (p: Player) => {
    if (!store.room) return;

    if (p.socketId === socket.id || store.room.getHost()?.socketId === socket.id) {
      if (store.room.removePlayer(p)) store.room.emitAll("game:removeplayer", p);
    }
  });

  socket.on("game:droppiece", (p: Player, col: number) => {
    if (!store.room || store.room.findPlayerById(p)?.socketId !== socket.id) return;

    if (store.room.dropPiece(p, col)) {
      store.room.emitAll("game:droppiece", p, col);
    }
  });

  socket.on("game:gridsize", (rows: number, cols: number) => {
    if (!store.room) return;

    if (store.room.setGridSize(rows, cols)) store.room.emitAll("game:gridsize", rows, cols);
  });

  const messageLimiter = new RateLimiter({ tokensPerInterval: 30, interval: "minute" });

  // socket.on("room-send-message", async (m: ChatMessage) => {
  //   if (m.text.length === 0 || m.text.length > 300) return;
  //   if (m.username.length < 2 || m.username.length > 11) return;
  //   if (m.time < 0 || m.time > Date.now() + 60000) return;

  //   try {
  //     const remainingMessages = await messageLimiter.removeTokens(1);
  //   } catch {
  //     return;
  //   }

  //   m.text = filter.clean(m.text);

  //   const room = rooms[player.roomId];
  //   room.chat.push(m);
  //   room.broadcastState();
  // });

  socket.on("get-public-rooms", () => {
    socket.emit("recieve-public-rooms", publicRooms);
  });
}
