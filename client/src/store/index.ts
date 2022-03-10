import { defineStore } from "pinia";
import { ref, watch } from "vue";
import Socket from "@/api/socket";
import Game from "@shared/game";

export interface Toast {
  text: string;
  duration?: number;
}

export interface State {
  toastQueue: Toast[];
  theme: string;
  game?: Game;
  socket?: Socket;
}

export const useStore = defineStore("main", () => {
  const toastQueue = ref<Toast[]>([]);
  const addToast = (toast: Toast) => {
    toastQueue.value.push(toast);
  };
  const removeToast = () => {
    toastQueue.value.shift();
  };

  const theme = ref("");
  const setTheme = (t: string) => {
    theme.value = t;
    localStorage.setItem("theme", t);
  };

  const game = ref<Game | undefined>();
  const resetGame = () => {
    game.value = new Game();
  };

  const socket = ref<Socket | undefined>();
  const createSocket = () => {
    socket.value = new Socket();
  };

  return {
    toastQueue,
    addToast,
    removeToast,

    theme,
    setTheme,

    game,
    resetGame,

    socket,
    createSocket,
  };
});
