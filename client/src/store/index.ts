import { defineStore } from "pinia";
import { ref } from "vue";
import Socket from "@/api/socket";
import Game from "@shared/game";
import { ChatMessage } from "@shared/chat";

export interface Toast {
  text: string;
  duration?: number;
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

  const chat = ref<ChatMessage[]>([]);
  const addChatMessage = (msg: ChatMessage) => {
    chat.value = [...chat.value, msg];
  };
  const resetChat = () => {
    chat.value = [];
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

    chat,
    addChatMessage,
    resetChat,
  };
});
