import { useStore } from "@/store";
import Player from "@shared/player";
import { io } from "socket.io-client";
import { ref } from "vue";
import { useRouter } from "vue-router";

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://server.scuffed4inarow.online"
    : `http://${window.location.hostname}:3000`;

export default class Socket {
  socket = io(SERVER_URL);
  isConnected = ref(false);

  isRoomOwner = ref(false);
  roomCode = ref("");

  constructor() {
    const store = useStore();
    const router = useRouter();

    this.socket.on("connect", () => (this.isConnected.value = true));
    this.socket.on("disconnect", () => {
      this.isConnected.value = false;

      router.push({ name: "Home" });
      store.addToast({
        text: "Disconnected from game server!",
        duration: 2500,
      });
    });

    // room events
    this.socket.on("room:created", (code: string) => {
      this.roomCode.value = code;
      this.isRoomOwner.value = true;
    });

    this.socket.on("room:joined", (code: string) => {
      this.roomCode.value = code;

      store.resetGame();
      if (store.game) store.game.isOnline = true;
    });

    this.socket.on("room:notfound", () => {
      router.push({ name: "Home" });
      store.addToast({
        text: "That room could not be found, has started or was full.",
        duration: 2500,
      });
    });

    this.socket.on("room:left", () => {
      this.roomCode.value = "";
      this.isRoomOwner.value = false;

      router.push({ name: "Home" });
      store.addToast({
        text: "You have left the room, it either closed or you left.",
        duration: 2500,
      });
    });

    this.socket.on("room:forceleave", () => {
      this.leaveRoom();
    });

    // game events
    this.socket.on("game:start", (p) => {
      if (!store.game) return;

      store.game.start(p);
      router.push({ name: "Game" });
    });

    this.socket.on("game:restart", (p) => {
      store.game?.restart(p);

      if (!this.isRoomOwner.value)
        store.addToast({
          text: "The room owner restarted the game.",
          duration: 2500,
        });
    });

    this.socket.on("game:addplayer", (p: Player) => {
      if (!store.game) return;

      store.game.addPlayer(p);
    });

    this.socket.on("game:removeplayer", (p: Player) => {
      if (!store.game) return;

      store.game.removePlayer(p);
    });

    this.socket.on("game:droppiece", (p: Player, col: number) => {
      if (!store.game) return;

      store.game.dropPiece(p, col);
    });

    this.socket.on("game:gridsize", (rows: number, cols: number) => {
      if (!store.game) return;

      store.game.setGridSize(rows, cols);
    });
  }

  // functions must be arrow functions to work when used as a reactive variable in store

  // room functions
  createRoom = () => {
    if (!this.isConnected.value) return;

    this.socket.emit("room:create");
  };

  joinRoom = (code: string) => {
    if (!this.isConnected.value) return;

    this.socket.emit("room:join", code);
  };

  leaveRoom = () => {
    if (!this.isConnected.value) return;

    this.socket.emit("room:leave");
  };

  // game functions
  startGame = () => {
    const store = useStore();
    if (!this.isConnected.value || !this.isRoomOwner.value || !store.game) return;

    this.socket.emit("game:start");
  };

  restartGame = () => {
    const store = useStore();
    if (!this.isConnected.value || !this.isRoomOwner.value || !store.game) return;

    this.socket.emit("game:restart");
  };

  addPlayer = (p: Player) => {
    const store = useStore();
    if (!this.isConnected.value || !store.game) return;

    this.socket.emit("game:addplayer", p);
  };

  removePlayer = (p: Player) => {
    const store = useStore();
    if (!this.isConnected.value || !store.game) return;

    this.socket.emit("game:removeplayer", p);
  };

  dropPiece = (p: Player, col: number) => {
    const store = useStore();
    if (!this.isConnected.value || !store.game) return;

    this.socket.emit("game:droppiece", p, col);
  };

  setGridSize = (rows: number, cols: number) => {
    const store = useStore();
    if (!this.isConnected.value || !store.game) return;

    this.socket.emit("game:gridsize", rows, cols);
  };
}
