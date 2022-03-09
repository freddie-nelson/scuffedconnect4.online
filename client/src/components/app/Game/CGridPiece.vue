<script lang="ts">
import { computed, defineComponent, watch } from "vue";
import { Slot } from "@shared/game";
import { hex } from "@shared/colors";

export default defineComponent({
  name: "CGridPiece",
  components: {},
  props: {
    gridSlot: {
      type: Object as () => Slot,
      required: true,
    },
  },
  setup(props) {
    // const store = useStore();
    // const game = computed(() => store.state.game as Game);

    // const rows = computed(() => game.value.getrows());
    // const cols = computed(() => game.value.getcols());

    // const row = computed(() => props.gridslot.row);
    // const col = computed(() => props.gridslot.col);

    const hexColor = computed(() => {
      return props.gridSlot.color !== null ? hex.get(props.gridSlot.color) : "";
    });

    const win = computed(() => props.gridSlot.win);
    watch(win, () => {
      console.log(win.value);
    });

    return {
      hexColor,
      win,
    };
  },
});
</script>

<template>
  <div class="w-full h-full flex justify-center items-center relative">
    <div
      class="absolute w-[85%] h-[85%] rounded-full overflow-hidden"
      :style="{ backgroundColor: hexColor }"
    >
      <div
        v-if="win"
        class="absolute w-full h-full bg-white bg-opacity-50 animate-pulse"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>