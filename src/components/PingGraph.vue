<template>
  <div ref="graphContainer"></div>
</template>

<script lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';
import type { PingResult, ProbeData } from '@/types'; // Import your PingResult type

export default {
  name: 'LatencyGraph',
  props: {
    pingResults: Array as () => PingResult[],
  },
  setup(props: { pingResults: PingResult[]; }) {
    const graphContainer = ref(null);

    const drawGraph = () => {
      if (!graphContainer.value || !props.pingResults || props.pingResults.length === 0) {
        return;
      }
      createLatencyGraph(props.pingResults, graphContainer.value);
    };

    const resizeListener = () => {
      drawGraph();
    };

    onMounted(() => {
      drawGraph();
      window.addEventListener('resize', resizeListener);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', resizeListener);
    });

    watch(() => props.pingResults, drawGraph, { immediate: true });

    return { graphContainer };
  },
};


// Define a threshold for the maximum allowed gap (in milliseconds)
const maxAllowedGap = 1000 * 60 * 1.25; // Example: 5 minutes

function isGapAcceptable(current: PingResult, previous: PingResult) {
  if (!previous) return true; // Always accept the first point
  return (current.stopTimestamp.getTime() - previous.stopTimestamp.getTime()) <= maxAllowedGap;
}

function segmentData(data: PingResult[]) {
  // First, sort the data by stopTimestamp
  data.sort((a, b) => new Date(a.stopTimestamp) - new Date(b.stopTimestamp));

  const segments = [];
  let segment = [];

  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    const next = data[i + 1];

    segment.push(current);

    if (next) {
      const currentStopTime = new Date(current.stopTimestamp).getTime();
      const nextStopTime = new Date(next.stopTimestamp).getTime();

      if (nextStopTime - currentStopTime > maxAllowedGap) {
        segments.push(segment);
        segment = [];
      }
    }
  }

  // Add the last segment if it has data
  if (segment.length) {
    segments.push(segment);
  }

  return segments;
}


// Repeat for maxLine, avgLine, and lossLine


function createLatencyGraph(data: PingResult[], graphElement: HTMLElement) {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = graphElement.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  d3.select(graphElement).selectAll('*').remove();

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

  const dataSegments = segmentData(data);

  // Line generator for avgRtt
  const maxLine = d3.line<PingResult>()
      .x((d: { stopTimestamp: any; }) => xScale(d.stopTimestamp))
      .y((d: { maxRtt: number; }) => yScale(d.maxRtt / 1000000));
  const avgLine = d3.line<PingResult>()
      .x((d: { stopTimestamp: any; }) => xScale(d.stopTimestamp))
      .y((d: { avgRtt: number; }) => yScale(d.avgRtt / 1000000));
  const lossLine = d3.line<PingResult>()
      .x((d: { stopTimestamp: any; }) => xScale(d.stopTimestamp))
      .y((d: { packetLoss: number; }) => yScale(d.packetLoss));
  // Repeat for maxLine, avgLine, and lossLine

  // Draw each segment separately
  dataSegments.forEach(segment => {
    svg.append('path')
        .datum(segment)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', 1.5)
        .attr('d', avgLine);
    // Repeat for maxLine, avgLine, and lossLine
    svg.append('path')
        .datum(segment)
        .attr('fill', 'none')
        .attr('stroke', 'darkblue')
        .attr('stroke-width', 1.5)
        .attr('d', maxLine);
    // Repeat for maxLine, avgLine, and lossLine
    svg.append('path')
        .datum(segment)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr('d', lossLine);
    // Repeat for maxLine, avgLine, and lossLine
  });
}
</script>
