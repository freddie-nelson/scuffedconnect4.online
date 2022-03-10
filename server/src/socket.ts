import { Socket } from "socket.io";
import { RateLimiter } from "limiter";

import Filter from "bad-words";
import Room from "./Room";
const filter = new Filter();

const rooms: { [index: string]: Room } = {};
const publicRooms: { host: string; code: string; maxPlayers: number; playerCount: number }[] = [];

export default function (socket: Socket) {
  const createRoom = () => {};
  const joinRoom = () => {};
  const leaveRoom = () => {};

  socket.on("disconnect", leaveRoom);

  socket.on("create-room", createRoom);

  socket.on("join-room", joinRoom);

  socket.on("leave-room", leaveRoom);

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
