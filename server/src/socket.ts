import { Socket } from "socket.io";
import { RateLimiter } from "limiter";

import Filter from "bad-words";
import Room from "./Room";
import Player from "@shared/player";
import { ChatMessage } from "@shared/chat";
import { PublicRoom } from "@shared/publicRoom";
const filter = new Filter();

const rooms: { [index: string]: Room } = {};

const publicRooms: PublicRoom[] = [];
const refreshPublicRooms = () => {
  const roomsArr = Object.values(rooms);
  publicRooms.length = 0;

  for (const room of roomsArr) {
    if (!room.isPublic || room.hasStarted()) continue;

    publicRooms.push({
      host: room.players.find((p) => p.socketId === room.owner.id)?.username || room.owner.id.substr(0, 8),
      code: room.code,
      players: room.getPlayerCount(),
    });
  }
};
setInterval(refreshPublicRooms, 3000);

export default function (socket: Socket) {
  const store: {
    room?: Room;
  } = {
    room: undefined,
  };

  const joinRoom = (code: string) => {
    if (store.room || typeof code !== "string") return;

    const room = rooms[code];
    if (!room || room.hasStarted() || room.getPlayerCount() >= 8) {
      socket.emit("room:notfound");
      return;
    }

    store.room = room;
    socket.emit("room:joined", room.code);

    room.chat.forEach((msg) => {
      socket.emit("room:message", msg.message, msg.username, msg.time, msg.socketId);
    });

    room.addSocket(socket);
  };

  const leaveRoom = () => {
    const room = store.room;
    if (!room) return;

    store.room = undefined;
    room.removeSocket(socket);

    socket.emit("room:left");

    if (room.getSocketCount() === 0 || (room.getPlayerCount() < 2 && room.hasStarted())) {
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

  const messageLimiter = new RateLimiter({ tokensPerInterval: 30, interval: "minute" });

  socket.on("room:sendmessage", async (message: string, username: string) => {
    if (!store.room || !message || !username || typeof message !== "string" || typeof username !== "string")
      return;

    if (message.length > 500) message = message.substr(0, 500);
    if (username.length > 25) username = username.substr(0, 25);

    try {
      const remainingMessages = await messageLimiter.removeTokens(1);
    } catch {
      return;
    }

    const msg: ChatMessage = {
      message: filter.clean(message),
      username: filter.clean(username),
      time: Date.now(),
      socketId: socket.id,
    };

    store.room.addChatMessage(msg);
    store.room.emitAll("room:message", msg.message, msg.username, msg.time, msg.socketId);
  });

  socket.on("room:ispublic", (isPublic: boolean) => {
    if (
      !store.room ||
      typeof isPublic !== "boolean" ||
      socket !== store.room.owner ||
      store.room.isPublic === isPublic
    )
      return;

    store.room.isPublic = isPublic;
  });

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
    if (!store.room || typeof p !== "object") return;

    const player = { ...p, socketId: socket.id };
    if (store.room.addPlayer(player)) store.room.emitAll("game:addplayer", player);
  });

  socket.on("game:removeplayer", (p: Player) => {
    if (!store.room || typeof p !== "object") return;

    if (p.socketId === socket.id || store.room.getHost()?.socketId === socket.id) {
      if (store.room.removePlayer(p)) store.room.emitAll("game:removeplayer", p);
    }
  });

  socket.on("game:droppiece", (p: Player, col: number) => {
    if (
      !store.room ||
      store.room.findPlayerById(p)?.socketId !== socket.id ||
      typeof p !== "object" ||
      typeof col !== "number"
    )
      return;

    if (store.room.dropPiece(p, col)) {
      store.room.emitAll("game:droppiece", p, col);
    }
  });

  socket.on("game:gridsize", (rows: number, cols: number) => {
    if (!store.room || typeof rows !== "number" || typeof cols !== "number") return;

    if (store.room.setGridSize(rows, cols)) store.room.emitAll("game:gridsize", rows, cols);
  });

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

  socket.on("global:publicrooms", (cb: (rooms: PublicRoom[]) => void) => {
    cb(publicRooms);
  });
}
