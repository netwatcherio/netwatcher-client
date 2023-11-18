<template>
  <div ref="mtrGraph" class="network-map"></div>
</template>

<script lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';
import type { MtrResult } from '@/types'; // Import your MtrResult type

export default {
  name: 'NetworkMap',
  props: {
    mtrResults: Array as () => MtrResult[],
  },
  setup(props: { mtrResults: MtrResult[]; }) {
    const mtrGraph = ref<HTMLElement | null>(null);

    const drawGraph = () => {
      if (mtrGraph.value && props.mtrResults.length > 0) {
        createNetworkMap(props.mtrResults, mtrGraph.value);
      }
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

    watch(() => props.mtrResults, drawGraph, { immediate: true });

    return { mtrGraph };
  },
};

function createNetworkMap(mtrData: MtrResult[], element: HTMLElement) {
  const margin = { top: 10, right: 30, bottom: 30, left: 40 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  console.log(mtrData)

  // Remove any existing SVG to start fresh
  d3.select(element).selectAll('svg').remove();

  // Append the SVG object to the body of the page
  const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // Process the data here
  const linksData = mtrData.map(d => d.report.hubs.map((hub, i, arr) => {
    return i < arr.length - 1 ? { source: hub.host, target: arr[i + 1].host, loss: hub['Loss%'] } : null;
  }).filter(d => d != null)).reduce((acc, val) => acc.concat(val), []);

  const nodesData = Array.from(new Set(
      linksData.reduce((acc, val) => acc.concat(val.source, val.target), [])
  ));

  const nodeElements = svg.selectAll('circle')
      .data(nodesData)
      .enter()
      .append('circle')
      .attr('r', 5)
      .style('fill', 'green');

  const linkElements = svg.selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .style('stroke', d => d.loss > 0 ? 'red' : 'green')
      .style('opacity', d => d.loss > 0 ? 0.6 : 1);

  const simulation = d3.forceSimulation(nodesData as any)
      .force('link', d3.forceLink(linksData as any).id((d: any) => d.host))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

  simulation.on('tick', () => {
    nodeElements
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

    linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
  });

  const dragDrop = d3.drag().on('start', (event: any) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }).on('drag', (event: any) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }).on('end', (event: any) => {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    event.subject.fx = null;
    event.subject.fy = null;
  });

  nodeElements.call(dragDrop as any);
}
</script>

<style scoped>
.network-map {
  /* Add your styles here */
}
</style>
