<template>
  <div ref="graphContainer"></div>
</template>

<script lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import type { PingResult } from '@/types'; // Import your PingResult type

export default {
  name: 'LatencyGraph',
  props: {
    pingResults: Array as () => PingResult[],
  },
  setup(props: { pingResults: PingResult[]; }) {
    const graphContainer = ref(null);

    onMounted(() => {
      setTimeout(() => {
        if (props.pingResults && props.pingResults.length > 0 && graphContainer.value) {
          createLatencyGraph(props.pingResults, graphContainer.value);
        }
      }, 300); // Adjust the delay as needed
    });

    watch(() => props.pingResults, (newPingResults) => {
      if (newPingResults && newPingResults.length > 0 && graphContainer.value) {
        createLatencyGraph(newPingResults, graphContainer.value);
      }
    }, { immediate: true });
    return { graphContainer };
  },
};

function createLatencyGraph(data: PingResult[], graphElement: HTMLElement) {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  if(graphElement.clientHeight > 0) return;
  const width = graphElement.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select(graphElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // Define scales
  const xScale = d3.scaleTime()
      .domain(d3.extent(data, (d: { stopTimestamp: any; }) => d.stopTimestamp))
      .range([0, width]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { maxRtt: number; }) => d.maxRtt / 1000000)])
      .range([height, 0]);

  // Add X axis
  svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

  // Add Y axis
  svg.append('g')
      .call(d3.axisLeft(yScale));

  // Line generator for avgRtt
  const minLine = d3.line<PingResult>()
      .x((d: { stopTimestamp: any; }) => xScale(d.stopTimestamp))
      .y((d: { minRtt: number; }) => yScale(d.minRtt / 1000000));
  const maxLine = d3.line<PingResult>()
      .x((d: { stopTimestamp: any; }) => xScale(d.stopTimestamp))
      .y((d: { maxRtt: number; }) => yScale(d.maxRtt / 1000000));
  const avgLine = d3.line<PingResult>()
      .x((d: { stopTimestamp: any; }) => xScale(d.stopTimestamp))
      .y((d: { avgRtt: number; }) => yScale(d.avgRtt / 1000000));
  const lossLine = d3.line<PingResult>()
      .x((d: { stopTimestamp: any; }) => xScale(d.stopTimestamp))
      .y((d: { packetLoss: number; }) => yScale(d.packetLoss));

  // Add the line
  svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', minLine);
  svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr('d', maxLine);
  svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 1.5)
      .attr('d', avgLine);
  svg.append('path')
      .datum(data)
      .attr('fill', 'red')
      .attr('stroke', 'darkred')
      .attr('stroke-width', 1.5)
      .attr('d', lossLine);
}
</script>
