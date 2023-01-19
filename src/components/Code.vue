<script setup lang="ts">
import {reactive} from "vue";

const props = defineProps<{
  code: string
}>()

const state = reactive({
  copied: false,
  reset: 0
})

function copyText() {
  state.copied = true;
  navigator.clipboard.writeText(props.code);
  setTimeout(() => {
    state.copied = false
  }, 1500)
}

</script>

<template>
<code @click="() => copyText()" class="code-copy">{{props.code}}&nbsp;<span class="copy-box"><i v-if="!state.copied" class="bi bi-clipboard" ></i><i v-else class="bi bi-clipboard-check copied"></i></span></code>
</template>

<style>

@keyframes isCopied {
  0% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
}


i.copied {
  width: inherit;
  height: inherit;
  animation: isCopied 250ms forwards ease;
}

</style>