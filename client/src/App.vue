<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useStore } from "./store";
import themes from "@/utils/themes";

import CThemeSelector from "./components/shared/CThemeSelector.vue";
import CToastController from "./components/shared/Toast/CToastController.vue";

export default defineComponent({
  name: "App",
  components: { CToastController, CThemeSelector },
  setup() {
    const store = useStore();
    const saContainer = ref();

    onMounted(() => {
      const html = document.querySelector("html");
      const theme = localStorage.getItem("theme") || "light";
      html?.classList.add(theme);

      store.setTheme(theme);

      // setup simple analytics
      if (process.env.NODE_ENV === "production") {
        const script = document.createElement("script");
        script.async = true;
        script.defer = true;
        script.src = "https://scripts.simpleanalyticscdn.com/latest.js";
        script.setAttribute("data-hostname", "scuffed4inarow.online");

        saContainer.value?.appendChild(script);
      }
    });

    return {
      saContainer,
    };
  },
});
</script>

<template>
  <c-toast-controller />

  <c-theme-selector />

  <router-view class="bg-bg-light w-full min-h-screen" />

  <div id="modals"></div>

  <!-- force tailwind to compile classes -->
  <span
    class="
      text-xs
      text-sm
      text-base
      text-lg
      text-xl
      text-2xl
      text-3xl
      text-4xl
      text-5xl
      text-6xl
      text-7xl
      text-8xl
      text-9xl
      bg-gradient-to-r bg-gradient-to-l bg-gradient-to-t bg-gradient-to-b
    "
  ></span>

  <!-- 100% privacy friendly analytics -->
  <div ref="saContainer"></div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
#app {
  width: 100%;
  min-height: 100vh;
}

::-webkit-scrollbar {
  display: none;
}
</style>
