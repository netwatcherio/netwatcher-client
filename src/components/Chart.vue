<script setup lang="ts">
import {v4 as uuidv4} from "uuid";
import {onMounted, reactive} from "vue";
import {Chart, ChartStyle} from "@/composables/chart";
import type {SimplexNoise} from "@/composables/noise";
import {mkSimplexNoise} from "@/composables/noise";

const state = reactive({
  chart: {} as Chart,
  uuid: uuidv4(),
  data: [] as number[]
})

onMounted(() => {
  let n = mkSimplexNoise(Math.random)
  for (let i = 0; i <40; i++) {
  state.data.push(n.noise2D(i,i*i))

  }
  state.chart = new Chart(getUuid(), ChartStyle.TrendLine, state.data as number[])
  state.chart.draw()
})

function getUuid(): string {
  return `chart-${state.uuid}`
}


</script>

<template>

  <div>
<canvas :id="getUuid()" class="chart-canvas"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.chart-canvas {
  height: 100%;
  width: 100%;
}
</style>