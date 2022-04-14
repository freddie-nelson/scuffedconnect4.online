<script lang="ts">
import { useStore } from "@/store";
import { storeToRefs } from "pinia";
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import CButton from "../shared/Button/CButton.vue";
import CInputText from "../shared/Input/CInputText.vue";
import CModal from "../shared/Modal/CModal.vue";

export default defineComponent({
  name: "CChat",
  components: { CModal, CInputText, CButton },
  setup() {
    const store = useStore();
    const { game, socket, chat } = storeToRefs(store);

    const message = ref("");
    const username = computed(() => {
      if (!game.value || !socket.value) return "";

      const me = game.value.players.filter(
        (p) => p.socketId === socket.value?.socket.id
      );
      if (me.length > 0) return me[0].username;

      return socket.value.socket.id.substr(0, 6);
    });

    const sendMessage = () => {
      socket.value?.sendMessage(message.value, username.value);
      message.value = "";
    };

    // auto scroll with messages
    const chatContainer = ref(document.createElement("div"));
    watch(chat, () => {
      requestAnimationFrame(() => {
        if (
          chatContainer.value.scrollTop >
          chatContainer.value.scrollHeight - 900
        ) {
          chatContainer.value.scrollTo({
            top: chatContainer.value.scrollHeight,
          });
        }
      });
    });

    onMounted(() => {
      chatContainer.value.scrollTo({ top: chatContainer.value.scrollHeight });
    });

    return {
      socketId: computed(() => socket.value?.socket.id || ""),
      chat,
      message,
      sendMessage,

      chatContainer,
    };
  },
});
</script>

<template>
  <c-modal
    closeable
    class="w-full max-w-2xl h-full max-h-[38rem] flex flex-col gap-3"
  >
    <div
      ref="chatContainer"
      class="w-full flex-grow overflow-y-scroll flex flex-col gap-2.5"
    >
      <div
        v-for="(m, i) in chat"
        :key="i"
        class="first:mt-auto text-bg-light w-max flex flex-col gap-0.5"
        :class="{ 'ml-auto': m.socketId === socketId }"
      >
        <p
          class="p-3 rounded-md max-w-xs w-max"
          :class="{
            'bg-primary-600': m.socketId !== socketId,
            'ml-auto bg-accent-600': m.socketId === socketId,
          }"
        >
          {{ m.message }}
        </p>

        <p
          class="opacity-50 text-xs font-medium"
          :class="{ 'ml-auto': m.socketId !== socketId }"
        >
          {{ m.username }},
          {{ new Date(m.time).toTimeString().substr(0, 5) }}
        </p>
      </div>
    </div>

    <form class="flex gap-3 w-full" @submit.prevent="sendMessage">
      <c-input-text
        classes="flex-grow"
        v-model="message"
        dark
        name="message"
        placeholder="Type your message..."
        required
        maxlength="500"
        autocomplete="false"
      />
      <c-button type="submit">Send</c-button>
    </form>
  </c-modal>
</template>

<style lang="scss" scoped>
*::-webkit-scrollbar {
  display: none;
}
</style>