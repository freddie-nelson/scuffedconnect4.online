<script lang="ts">
import { computed, defineComponent, watch } from "vue";
import Game, { Slot } from "@shared/game";
import { useStore } from "@/store";
import { Colors, hex } from "@shared/colors";

export default defineComponent({
  name: "CGridSlot",
  components: {},
  props: {
    gridSlot: {
      type: Object as () => Slot,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const game = computed(() => store.state.game as Game);

    const rows = computed(() => game.value.getRows());
    const cols = computed(() => game.value.getCols());

    const row = computed(() => props.gridSlot.row);
    const col = computed(() => props.gridSlot.col);

    const hexColor = computed(() => {
      return props.gridSlot.color !== null ? hex.get(props.gridSlot.color) : "";
    });

    const win = computed(() => props.gridSlot.win);
    watch(win, () => {
      console.log(win.value);
    });

    return {
      game,

      rows,
      cols,
      row,
      col,

      hexColor,
      win,
    };
  },
});
</script>

<template>
  <div
    class="w-full h-full bg-bg-dark flex justify-center items-center relative"
    :style="{
      borderTopLeftRadius: col === 0 && row === rows - 1 ? '0.5rem' : '',
      borderTopRightRadius:
        col === cols - 1 && row === rows - 1 ? '0.5rem' : '',
      borderBottomLeftRadius: col === 0 && row === 0 ? '0.5rem' : '',
      borderBottomRightRadius: col === cols - 1 && row === 0 ? '0.5rem' : '',
    }"
  >
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

<style lang="scss" scoped>
</style>