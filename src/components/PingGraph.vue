<template>
  <div id="latencyGraph" ref="latencyGraph"></div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import ApexCharts from 'apexcharts'
import type { PingResult } from '@/types';

export default {
  name: 'LatencyGraph',
  props: {
    pingResults: Array as () => PingResult[],
  },
  setup(props: { pingResults: PingResult[]; }) {
    const latencyGraph = ref(null);
    let chart: ApexCharts | undefined = undefined;

    const drawGraph = () => {
      if (!latencyGraph.value || !props.pingResults || props.pingResults.length === 0) {
        return;
      }
      createLatencyGraph(props.pingResults, latencyGraph.value);
    };

    const resizeListener = () => {
      if (chart) {
        chart.updateOptions({ chart: { width: latencyGraph.value.clientWidth } });
      }
    };

    onMounted(() => {
      drawGraph();
      window.addEventListener('resize', resizeListener);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', resizeListener);
      if (chart) {
        chart.destroy();
      }
    });

    watch(() => props.pingResults, drawGraph, { deep: true });

    return { latencyGraph };
  },
};

const maxAllowedGap = 1000 * 90; // 90 seconds

function createLatencyGraph(data: PingResult[], graphElement: HTMLElement) {
  const sortedData = data.sort((a, b) => a.stopTimestamp.getTime() - b.stopTimestamp.getTime());

  var chart = undefined

  const series = [
    {
      name: 'Max RTT',
      type: 'line',
      data: sortedData.map(d => ({ x: d.stopTimestamp.getTime(), y: d.maxRtt / 1e6 }))
    },
    {
      name: 'Avg RTT',
      type: 'line',
      data: sortedData.map(d => ({ x: d.stopTimestamp.getTime(), y: d.avgRtt / 1e6 }))
    },
    {
      name: 'Std Dev RTT',
      type: 'line',
      data: sortedData.map(d => ({ x: d.stopTimestamp.getTime(), y: d.stdDevRtt / 1e6 }))
    },
    {
      name: 'Packet Loss %',
      type: 'column',
      data: sortedData.map(d => ({ x: d.stopTimestamp.getTime(), y: d.packetLoss }))
    }
  ];

  const annotations: ApexAnnotations = {
    xaxis: [],
    yaxis: []
  };

  // Gap annotations
  sortedData.forEach((current, index, array) => {
    if (index > 0) {
      const prev = array[index - 1];
      const gap = current.stopTimestamp.getTime() - prev.stopTimestamp.getTime();
      if (gap > maxAllowedGap) {
        annotations.xaxis.push({
          x: prev.stopTimestamp.getTime(),
          x2: current.stopTimestamp.getTime(),
          borderColor: '#B3B3B3',
          strokeDashArray: 5,
          fillColor: '#B3B3B3',
          opacity: 0.4,
          label: {
            borderColor: '#B3B3B3',
            style: {
              fontSize: '10px',
              color: '#fff',
              background: '#B3B3B3',
            },
            text: 'Gap',
          }
        });
      }
    }
  });

  // Packet loss annotations
  let currentLossStart: number | null = null;
  let currentLossColor = '';
  let currentLossText = '';

  sortedData.forEach((d, index) => {
    const packetLoss = d.packetLoss;
    let color = '';
    let text = '';

    if (packetLoss >= 5 && packetLoss < 10) {
      color = '#FFD700'; // Yellow
      text = 'Moderate Loss';
    } else if (packetLoss >= 10 && packetLoss < 25) {
      color = '#FFA500'; // Orange
      text = 'High Loss';
    } else if (packetLoss >= 25) {
      color = '#FF0000'; // Red
      text = 'Severe Loss';
    }

    if (color) {
      if (!currentLossStart) {
        currentLossStart = d.stopTimestamp.getTime();
        currentLossColor = color;
        currentLossText = text;
      } else if (color !== currentLossColor) {
        // End the previous annotation and start a new one
        annotations.xaxis.push({
          x: currentLossStart,
          x2: d.stopTimestamp.getTime(),
          borderColor: currentLossColor,
          fillColor: currentLossColor,
          opacity: 0.1,
          label: {
            borderColor: currentLossColor,
            style: {
              fontSize: '10px',
              color: '#fff',
              background: currentLossColor,
            },
            text: currentLossText,
          }
        });
        currentLossStart = d.stopTimestamp.getTime();
        currentLossColor = color;
        currentLossText = text;
      }
    } else if (currentLossStart) {
      // End the previous annotation
      annotations.xaxis.push({
        x: currentLossStart,
        x2: d.stopTimestamp.getTime(),
        borderColor: currentLossColor,
        fillColor: currentLossColor,
        opacity: 0.1,
        label: {
          borderColor: currentLossColor,
          style: {
            fontSize: '10px',
            color: '#fff',
            background: currentLossColor,
          },
          text: currentLossText,
        }
      });
      currentLossStart = null;
    }

    // Handle the last data point
    if (index === sortedData.length - 1 && currentLossStart) {
      annotations.xaxis.push({
        x: currentLossStart,
        x2: d.stopTimestamp.getTime(),
        borderColor: currentLossColor,
        fillColor: currentLossColor,
        opacity: 0.1,
        label: {
          borderColor: currentLossColor,
          style: {
            fontSize: '10px',
            color: '#fff',
            background: currentLossColor,
          },
          text: currentLossText,
        }
      });
    }
  });

  const options: ApexCharts.ApexOptions = {
    series,
    chart: {
      height: 350,
      type: 'line',
      stacked: false,
      animations: {
        enabled: false
      },
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: 'zoom'
      }
    },
    colors: ['#3e5672', '#00E396', '#42aaee', '#FF4560'],
    stroke: {
      width: [3, 3, 3, 0],
      curve: 'straight'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    },
    fill: {
      opacity: [1, 1, 1, 0.5],
    },
    labels: sortedData.map(d => d.stopTimestamp.getTime()),
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: [
      {
        title: {
          text: 'RTT (ms)',
        },
        min: 0,
        max: Math.max(
            ...sortedData.map(d => Math.max(d.maxRtt, d.avgRtt, d.stdDevRtt) / 1e6)
        ) * 1.1, // Add 10% headroom
        labels: {
          formatter: (val) => val.toFixed(1)
        }
      },
      {
        opposite: true,
        title: {
          text: 'Packet Loss %'
        },
        min: 0,
        max: 100,
        labels: {
          formatter: (val) => val.toFixed(1)
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        formatter: function(val: number) {
          return new Date(val).toLocaleString();
        }
      },
      y: {
        formatter: function (y, { seriesIndex }) {
          if (typeof y !== "undefined") {
            if (seriesIndex <= 2) {
              return y.toFixed(1) + " ms";
            } else {
              return y.toFixed(1) + "%";
            }
          }
          return y;
        }
      }
    },
    annotations: annotations
  };

  chart = new ApexCharts(graphElement, options);
  chart.render();
}
</script>