
<script setup lang="ts">
const props = defineProps<{
  inverse?: boolean
}>()
</script>


<template>
  <span class="loader" :class="`${props.inverse?'loader-dark':''}`"></span>
</template>


<style>


</style>