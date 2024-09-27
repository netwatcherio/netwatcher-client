<template>
  <div ref="mtrGraph" class="network-map"></div>
</template>

<script lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';
import type { MtrResult } from '@/types'; // Import your MtrResult and MtrHop types

export default {
  name: 'NetworkMap',
  props: {
    mtrResults: {
      type: Array as () => MtrResult[],
      required: true,
    },
  },
  setup(props) {
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

type Node = {
  id: string;
  label: string;
  hopNumber: number;
  paths: Set<number>;
  packetLoss?: number;
  latency?: number;
  hostname?: string;
  ip?: string;
  isUnknown?: boolean;
};

type Link = {
  source: Node;
  target: Node;
  packetLoss?: number;
  latency?: number;
  paths: Set<number>;
};

function createNetworkMap(mtrResults: MtrResult[], graphElement: HTMLElement) {
  // Set up dimensions
  graphElement.style.height = '600px';
  const margin = { top: 50, right: 20, bottom: 70, left: 50 };
  const width = graphElement.clientWidth - margin.left - margin.right;
  const height = graphElement.clientHeight - margin.top - margin.bottom;
  const nodeRadius = 20; // Node size

  // Initialize data structures
  const nodesMap: Map<string, Node> = new Map();
  const links: Link[] = [];

  // Process data
  mtrResults.forEach((mtrResult, pathIndex) => {
    let previousNode: Node | null = null;

    mtrResult.report.hops.forEach((hop, hopIndex) => {
      const hopNumber = hopIndex + 1;
      let currentNodeId: string;
      let hostname: string | undefined;
      let ip: string | undefined;
      let isUnknown = false;

      if (hop.hosts.length > 0) {
        const host = hop.hosts[0];
        hostname = host.hostname;
        ip = host.ip;
        currentNodeId = hostname ? `${hostname} (${ip})` : `Hop #${hopNumber}`;
      } else {
        // Unknown host with 100% packet loss
        currentNodeId = `Hop #${hopNumber}`;
        isUnknown = true;
      }

      // If node doesn't exist, create it
      let currentNode = nodesMap.get(currentNodeId);
      if (!currentNode) {
        currentNode = {
          id: currentNodeId,
          label: isUnknown && parseFloat(hop.loss_pct) === 100 ? '?' : `${hopNumber}`,
          hopNumber: hopNumber,
          paths: new Set([pathIndex]),
          packetLoss: parseFloat(hop.loss_pct),
          latency: parseFloat(hop.avg),
          hostname: hostname,
          ip: ip,
          isUnknown: isUnknown,
        };
        nodesMap.set(currentNodeId, currentNode);
      } else {
        // If node exists, add the path index and update packet loss and latency if necessary
        currentNode.paths.add(pathIndex);
        currentNode.packetLoss = parseFloat(hop.loss_pct);
        currentNode.latency = parseFloat(hop.avg);
      }

      // Create links
      if (previousNode !== null) {
        const link: Link = {
          source: previousNode,
          target: currentNode,
          packetLoss: currentNode.packetLoss,
          latency: currentNode.latency,
          paths: new Set([pathIndex]),
        };
        links.push(link);
      }

      previousNode = currentNode;
    });
  });

  // Convert nodes map to array
  const nodes: Node[] = Array.from(nodesMap.values());

  // Clear existing SVG
  d3.select(graphElement).selectAll('*').remove();

  // Create SVG
  const svg = d3
      .select(graphElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales for positioning
  const xScale = d3
      .scaleLinear()
      .domain([1, d3.max(nodes, (d) => d.hopNumber)!])
      .range([0, width]);

  const yScale = d3
      .scaleLinear()
      .domain([0, mtrResults.length - 1])
      .range([0, height - 70]); // Adjusted for legend space

  // Initialize force simulation
  const simulation = d3
      .forceSimulation<Node>(nodes)
      .force('x', d3.forceX<Node>((d) => xScale(d.hopNumber)).strength(1))
      .force(
          'y',
          d3.forceY<Node>((d) => {
            const avgPathIndex =
                Array.from(d.paths).reduce((sum, idx) => sum + idx, 0) / d.paths.size;
            return yScale(avgPathIndex);
          }).strength(1)
      )
      .force('collision', d3.forceCollide(nodeRadius + 30)) // Increased collision radius to account for bubbles
      .force('link', d3.forceLink<Node, Link>(links).id((d) => d.id).distance(150))
      .stop();

  // Run simulation
  simulation.tick(300);

  // Define color scales
  const packetLossColorScale = d3
      .scaleLinear<string>()
      .domain([0, 100])
      .range(['#4E8A7D', '#FB5561']); // Green to Red

  const latencyColorScale = d3
      .scaleLinear<string>()
      .domain([0, 200])
      .range(['#83DCA1', '#FB5561']); // Light Green to Red

  // Draw links
  g.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
      })
      .style('stroke', (d) => getLinkColor(d))
      .style('stroke-width', 2);

  let activeNode: Node | null = null;

  // Draw nodes
  const node = g
      .selectAll<SVGGElement, Node>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .on('click', function (event, d) {
        // Stop propagation to prevent the SVG click handler from closing the bubble immediately
        event.stopPropagation();

        if (activeNode === d) {
          // Clicked the same node; close the bubble
          d3.selectAll('.info-bubble').remove();
          activeNode = null;
        } else {
          // Remove any existing info bubbles
          d3.selectAll('.info-bubble').remove();
          activeNode = d;

          const bubbleGroup = g.append('g').attr('class', 'info-bubble');

          // Calculate the position of the bubble (above the node)
          const bubbleX = d.x;
          const bubbleY = d.y - nodeRadius - 10; // Adjust as needed

          // Create text elements to measure their size
          const hostnameText = bubbleGroup
              .append('text')
              .attr('class', 'hostname')
              .attr('x', 0)
              .attr('y', 0)
              .attr('text-anchor', 'middle')
              .style('font-family', 'Arial')
              .style('font-size', '10px')
              .style('fill', '#000')
              .text(d.hostname ? d.hostname : 'Unknown');

          const ipText = bubbleGroup
              .append('text')
              .attr('class', 'ip')
              .attr('x', 0)
              .attr('y', 15)
              .attr('text-anchor', 'middle')
              .style('font-family', 'Arial')
              .style('font-size', '10px')
              .style('fill', '#000')
              .text(d.ip ? d.ip : '');

          // Measure the text widths
          const hostnameWidth = hostnameText.node()?.getBBox().width || 0;
          const ipWidth = ipText.node()?.getBBox().width || 0;
          const bubbleWidth = Math.max(hostnameWidth, ipWidth) + 20; // Add padding

          // Calculate bubble height
          const bubbleHeight = 40; // Adjust as needed

          // Draw a rounded rectangle as the bubble background
          bubbleGroup
              .insert('rect', ':first-child') // Insert before the text
              .attr('x', -bubbleWidth / 2)
              .attr('y', -20)
              .attr('width', bubbleWidth)
              .attr('height', bubbleHeight)
              .attr('rx', 10)
              .attr('ry', 10)
              .style('fill', '#f0f0f0')
              .style('stroke', '#ccc')
              .style('stroke-width', 1);

          // Position the bubble group
          bubbleGroup.attr('transform', `translate(${bubbleX},${bubbleY})`);

          // Add a line connecting the node to the info bubble
          bubbleGroup
              .append('line')
              .attr('class', 'bubble-line')
              .attr('x1', 0)
              .attr('y1', bubbleHeight - 20)
              .attr('x2', 0)
              .attr('y2', bubbleHeight - 10 + nodeRadius)
              .style('stroke', '#ccc')
              .style('stroke-width', 1);
        }
      });

  // Handle clicks on the SVG background to close info bubbles
  svg.on('click', function () {
    d3.selectAll('.info-bubble').remove();
    activeNode = null;
  });

  node
      .append('circle')
      .attr('r', nodeRadius)
      .style('fill', (d) => getNodeColor(d))
      .style('stroke', '#fff')
      .style('stroke-width', 1.5);

  // Add hop number labels inside the node
  node
      .append('text')
      .attr('class', 'hop-number')
      .attr('dy', 5) // Centered vertically within the node
      .attr('text-anchor', 'middle')
      .text((d) => d.label)
      .style('font-family', 'Arial')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#fff');

  // Add latency and packet loss below the node
  node
      .append('text')
      .attr('class', 'metrics')
      .attr('dy', nodeRadius + 15)
      .attr('text-anchor', 'middle')
      .text((d) => {
        const latency = d.latency !== undefined ? `${d.latency} ms` : 'N/A';
        const packetLoss = d.packetLoss !== undefined ? `${d.packetLoss}% loss` : 'N/A';
        return `${latency}, ${packetLoss}`;
      })
      .style('font-family', 'Arial')
      .style('font-size', '10px');

  // Add legend
  const legendData = [
    { color: '#4E8A7D', label: 'Good' },
    { color: '#83DCA1', label: 'Moderate' },
    { color: '#E8E598', label: 'Poor' },
    { color: '#ED937B', label: 'Critical' },
    { color: '#FB5561', label: 'Severe' },
    { color: '#999999', label: 'Unknown' },
  ];

  const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left},${height + margin.top})`);

  const legendItem = legend
      .selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${i * 100},0)`);

  legendItem
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', (d) => d.color);

  legendItem
      .append('text')
      .attr('x', 24)
      .attr('y', 14)
      .text((d) => d.label)
      .style('font-family', 'Arial')
      .style('font-size', '12px');

  // Add zoom functionality
  const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

  svg.call(zoom);

  // Helper functions
  function getNodeColor(node: Node): string {
    if (node.isUnknown && node.packetLoss === 100) {
      return '#999999'; // Gray color for unknown nodes with 100% packet loss
    }

    if (node.packetLoss === undefined || node.latency === undefined) {
      return '#999999'; // Gray color if data is missing
    }

    // More vibrant colors using color scales
    const packetLossColor = packetLossColorScale(node.packetLoss!);
    const latencyColor = latencyColorScale(node.latency!);

    // Interpolate between packet loss color and latency color
    return d3.interpolateRgb(packetLossColor, latencyColor)(0.5);
  }

  function getLinkColor(link: Link): string {
    if (link.packetLoss === undefined || link.latency === undefined) {
      return '#999999'; // Gray color if data is missing
    }

    // More vibrant colors using color scales
    const packetLossColor = packetLossColorScale(link.packetLoss!);
    const latencyColor = latencyColorScale(link.latency!);

    // Interpolate between packetLossColor and latencyColor
    return d3.interpolateRgb(packetLossColor, latencyColor)(0.5);
  }
}
</script>

<style scoped>
.network-map {
  position: relative;
}

.link {
  stroke: #999;
}

.node {
  cursor: pointer;
}

.hop-number {
  fill: #fff;
}

.info-bubble rect {
  fill: #f0f0f0;
  stroke: #ccc;
}

.info-bubble text {
  fill: #000;
}

.metrics {
  fill: #000;
}

.legend {
  font-family: Arial, sans-serif;
}

.legend-item rect {
  stroke: #fff;
  stroke-width: 1px;
}
</style>
