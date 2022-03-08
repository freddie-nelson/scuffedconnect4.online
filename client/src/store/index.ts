import Game from "@shared/game";
import { createStore, useStore as vuexUseStore } from "vuex";

export interface Toast {
  text: string;
  duration?: number;
}

export interface State {
  toastQueue: Toast[];
  theme: string;
  game?: Game;
}

export default createStore<State>({
  state: {
    toastQueue: [],
    theme: "",
  },
  mutations: {
    ADD_TOAST(state, toast: Toast) {
      state.toastQueue.push(toast);
    },
    REMOVE_TOAST(state) {
      state.toastQueue.shift();
    },

    SET_THEME(state, theme: string) {
      state.theme = theme;
      localStorage.setItem("theme", theme);
    },

    RESET_GAME(state) {
      state.game = new Game();
    },
  },
  actions: {},
  modules: {},
});

export const useStore = () => {
  return vuexUseStore<State>();
};
