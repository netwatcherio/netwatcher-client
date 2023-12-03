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

type Node = {
  id: string;
  label: string;
  hopNumber: number;
};

type Link = {
  source: string;
  target: string;
  latency: number;
  packetLoss: number;
};

function createNetworkMap(mtrResults: MtrResult[], graphElement: HTMLElement) {
  graphElement.style.height = '600px';
  // Set the dimensions and margins of the graph
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = graphElement.clientWidth - margin.left - margin.right;
  const height = graphElement.clientHeight - margin.top - margin.bottom;
  const nodeRadius = 18;
  const linkColor = '#999';
  const unreachableColor = 'gray';
  const textSize = 8;

  const nodes = [] as Node[];
  const links = [] as Link[];

  // Create a map to aggregate packetLoss and latency values for each source
  const aggregationMap = new Map();

  mtrResults.forEach((mtrResult) => {
    mtrResult.report.hops.forEach((hop, hopIndex) => {
      if (hop.hosts.length > 0) {
        hop.hosts.forEach((host) => {
          const nodeId = host.hostname ? `${host.hostname} (${host.ip})` : 'Unreachable #' + (hopIndex + 1);
          if (!nodes.some(n => n.id === nodeId)) {
            nodes.push({
              id: nodeId,
              label: `Hop ${hopIndex + 1}: ${nodeId}`,
              hopNumber: hopIndex + 1,
            });
          }

          if (hopIndex < mtrResult.report.hops.length - 1) {
            const nextHopHosts = mtrResult.report.hops[hopIndex + 1].hosts;
            if (nextHopHosts.length > 0) {
              const nextHop = nextHopHosts[0];
              const nextNodeId = nextHop.hostname ? `${nextHop.hostname} (${nextHop.ip})` : 'Unreachable #' + (hopIndex + 1);

              // Calculate the average packetLoss and latency for this link
              const sourceNodeId = nodeId;
              const targetNodeId = nextNodeId;
              const packetLoss = parseFloat(hop.loss_pct);
              const latency = parseFloat(hop.avg);

              if (!aggregationMap.has(sourceNodeId)) {
                aggregationMap.set(sourceNodeId, {
                  packetLossSum: packetLoss,
                  latencySum: latency,
                  count: 1,
                });
              } else {
                const existingData = aggregationMap.get(sourceNodeId);
                existingData.packetLossSum += packetLoss;
                existingData.latencySum += latency;
                existingData.count++;
              }

              links.push({
                source: sourceNodeId,
                target: targetNodeId,
              });
            } else {
              const nextNodeId = 'Unreachable #' + (hopIndex + 2);
              links.push({
                source: nodeId,
                target: nextNodeId,
              });
            }
          }
        });
      } else {
        const nodeId = 'Unreachable #' + (hopIndex + 1);
        if (!nodes.some(n => n.id === nodeId)) {
          nodes.push({
            id: nodeId,
            label: `Hop ${hopIndex + 1}: ${nodeId}`,
            hopNumber: hopIndex + 1,
          });
        }

        if (hopIndex < mtrResult.report.hops.length - 1) {
          const nextHopHosts = mtrResult.report.hops[hopIndex + 1].hosts;
          if (nextHopHosts.length > 0) {
            const nextHop = nextHopHosts[0];
            const nextNodeId = nextHop.hostname ? `${nextHop.hostname} (${nextHop.ip})` : 'Unreachable #' + (hopIndex + 1);

            // Calculate the average packetLoss and latency for this link
            const sourceNodeId = nodeId;
            const targetNodeId = nextNodeId;
            const packetLoss = parseFloat(hop.loss_pct);
            const latency = parseFloat(hop.avg);

            if (!aggregationMap.has(sourceNodeId)) {
              aggregationMap.set(sourceNodeId, {
                packetLossSum: packetLoss,
                latencySum: latency,
                count: 1,
              });
            } else {
              const existingData = aggregationMap.get(sourceNodeId);
              existingData.packetLossSum += packetLoss;
              existingData.latencySum += latency;
              existingData.count++;
            }

            links.push({
              source: sourceNodeId,
              target: targetNodeId,
            });
          } else {
            const nextNodeId = 'Unreachable #' + (hopIndex + 1);
            links.push({
              source: nodeId,
              target: nextNodeId,
            });
          }
        }
      }
    });
  });

  // Calculate the average packetLoss and latency for each source
  aggregationMap.forEach((data, sourceNodeId) => {
    const averagePacketLoss = data.packetLossSum / data.count;
    const averageLatency = data.latencySum / data.count;

    // Find the link corresponding to the sourceNodeId
    const link = links.find(link => link.source === sourceNodeId);

    if (link) {
      link.packetLoss = averagePacketLoss;
      link.latency = averageLatency;
    }
  });

  // Clear any existing SVG
  d3.select(graphElement).selectAll('svg').remove();

  // Create the outer SVG element
  const svg = d3.select(graphElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`); // Translate to include margins

  // Define the zoom behavior
  const zoom = d3.zoom()
      .scaleExtent([0.5, 4])
      .translateExtent([
        [-100, -100], // Limit the panning to 100px outside the SVG on each side
        [width + margin.right + 100, height + margin.bottom + 100]
      ])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });

  // Apply the zoom behavior to the SVG element
  svg.call(zoom);

  // Create the links (lines)
  const link = svg.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .style('stroke-width', 2)
      .style('stroke', linkColor);

  // Create the nodes (circles)
  const node = svg.selectAll('.node')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', nodeRadius)
      .style('fill', d => d.id.startsWith('Unreachable') ? unreachableColor : getNodeColor(d.id));

  // Create labels for the nodes
  const label = svg.selectAll('.label')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'label')
      .text(d => d.label)
      .style('font-family', 'Arial')
      .style('font-size', textSize)
      .attr('dx', '1em') // Offset the label horizontally
      .attr('dy', '.35em'); // Offset the label vertically

  // Define the simulation
  const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2));

  // Update positions on each tick
  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node.attr('cx', d => d.x)
        .attr('cy', d => d.y);

    label.attr('x', d => d.x)
        .attr('y', d => d.y);
  });

  // Drag behavior for nodes
  node.call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));

  function getNodeColor(sourceNodeId) {
    let link = links.find(link => link.source == sourceNodeId);

    if (link === undefined) {
      return '#FB5561'; // Default color for undefined link, using the last color in the provided palette
    } else {
      // Define thresholds
      const packetLossThreshold = 10; // Adjust as needed
      const latencyThreshold = 100;   // Adjust as needed

      if (link.packetLoss == undefined || link.latency == undefined) {
        return '#FB5561'; // Default color for undefined link, using the last color in the provided palette
      }

      // Calculate a score based on packet loss and latency
      const score = (link.packetLoss / packetLossThreshold) + (link.latency / latencyThreshold);

      // Normalize the score to the range of [0, 1] for color interpolation
      const normalizedScore = Math.min(Math.max(score, 0), 1);

      let color = interpolateColor(normalizedScore);

      if (color == undefined) {
        return '#FB5561';
      }

      // Interpolate color based on normalized score
      return color;
    }
  }

  function interpolateColor(fraction) {
    // Define the color palette from the provided image
    const palette = [
      '#4E8A7D', // Color 1
      '#83DCA1', // Color 2
      '#E8E598', // Color 3
      '#ED937B', // Color 4
      '#FB5561'  // Color 5
    ];

    // Determine the section width in the palette
    const sectionWidth = 1 / (palette.length - 1);
    let sectionIndex = Math.floor(fraction / sectionWidth);

    // Cap sectionIndex to the second to last item to avoid going out of bounds
    sectionIndex = Math.min(sectionIndex, palette.length - 2);

    // Calculate the local fraction (how far along the section the score is)
    const localFraction = (fraction - sectionWidth * sectionIndex) / sectionWidth;

    let color2Max = sectionIndex + 1 < palette.length ? palette[sectionIndex + 1] : palette[sectionIndex]

    // Interpolate between the two closest colors in the palette
    return interpolateHexColor(palette[sectionIndex], color2Max, localFraction);
  }

  function interpolateHexColor(color1, color2, fraction) {
    // Convert hex to RGB
    const color1Rgb = hexToRgb(color1);
    const color2Rgb = hexToRgb(color2);

    // Calculate interpolated color in RGB
    const resultRgb = {
      r: interpolateValue(color1Rgb.r, color2Rgb.r, fraction),
      g: interpolateValue(color1Rgb.g, color2Rgb.g, fraction),
      b: interpolateValue(color1Rgb.b, color2Rgb.b, fraction)
    };

    // Convert back to hex and return
    return rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b);
  }

  function hexToRgb(hex) {
    // Strip the hash if present and convert 3-digit hex to 6-digit hex
    hex = hex.replace(/^#/, '');
    hex = hex.length === 3 ? hex.split('').map(char => char + char).join('') : hex;

    // Parse the hexadecimal color
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    console.log(hex)

    return { r, g, b };
  }

  function rgbToHex(r, g, b) {
    // Convert each color component to a hexadecimal string
    const toHex = c => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function interpolateValue(value1, value2, fraction) {
    // Linear interpolation
    return Math.round(value1 + (value2 - value1) * fraction);
  }

}

</script>

<style scoped>
.network-map {
  /* Add your styles here */
}
</style>
