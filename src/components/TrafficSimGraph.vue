<template>
  <div id="trafficGraph" ref="trafficGraph"></div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import ApexCharts from 'apexcharts'
import type { TrafficSimResult } from '@/types';

export default {
  name: 'TrafficGraph',
  props: {
    trafficResults: Array as () => TrafficSimResult[],
  },
  setup(props: { trafficResults: TrafficSimResult[]; }) {
    const trafficGraph = ref(null);
    let chart: ApexCharts | undefined = undefined;

    const drawGraph = () => {
      if (!trafficGraph.value || !props.trafficResults || props.trafficResults.length === 0) {
        return;
      }
      createTrafficGraph(props.trafficResults, trafficGraph.value);
    };

    const resizeListener = () => {
      if (chart) {
        chart.updateOptions({ chart: { width: trafficGraph.value.clientWidth } });
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

    watch(() => props.trafficResults, drawGraph, { deep: true });

    return { trafficGraph };
  },
};

const maxAllowedGap = 1000 * 90; // 90 seconds

function createTrafficGraph(data: TrafficSimResult[], graphElement: HTMLElement) {
  const sortedData = data.sort((a, b) => new Date(a.lastReportTime).getTime() - new Date(b.lastReportTime).getTime());

  var chart = undefined;

  const series = [
    {
      name: 'Average RTT',
      type: 'line',
      data: sortedData.map(d => ({ x: new Date(d.lastReportTime).getTime(), y: d.averageRTT }))
    },
    {
      name: 'Max RTT',
      type: 'line',
      data: sortedData.map(d => ({ x: new Date(d.lastReportTime).getTime(), y: d.maxRTT }))
    },
    {
      name: 'Min RTT',
      type: 'line',
      data: sortedData.map(d => ({ x: new Date(d.lastReportTime).getTime(), y: d.minRTT }))
    },
    {
      name: 'Packet Loss %',
      type: 'column',
      data: sortedData.map(d => ({ x: new Date(d.lastReportTime).getTime(), y: (d.lostPackets / d.sentPackets) * 100 }))
    },
    {
      name: 'Out of Sequence',
      type: 'line',
      data: sortedData.map(d => ({ x: new Date(d.lastReportTime).getTime(), y: d.outOfSequence }))
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
      const gap = new Date(current.lastReportTime).getTime() - new Date(prev.lastReportTime).getTime();
      if (gap > maxAllowedGap) {
        annotations.xaxis.push({
          x: new Date(prev.lastReportTime).getTime(),
          x2: new Date(current.lastReportTime).getTime(),
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
    const packetLoss = (d.lostPackets / d.sentPackets) * 100;
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
        currentLossStart = new Date(d.lastReportTime).getTime();
        currentLossColor = color;
        currentLossText = text;
      } else if (color !== currentLossColor) {
        // End the previous annotation and start a new one
        annotations.xaxis.push({
          x: currentLossStart,
          x2: new Date(d.lastReportTime).getTime(),
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
        currentLossStart = new Date(d.lastReportTime).getTime();
        currentLossColor = color;
        currentLossText = text;
      }
    } else if (currentLossStart) {
      // End the previous annotation
      annotations.xaxis.push({
        x: currentLossStart,
        x2: new Date(d.lastReportTime).getTime(),
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
        x2: new Date(d.lastReportTime).getTime(),
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
    colors: ['#00E396', '#3e5672', '#42aaee', '#FF4560', '#775DD0'],
    stroke: {
      width: [3, 3, 3, 0, 3],
      curve: 'straight'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    },
    fill: {
      opacity: [1, 1, 1, 0.5, 1],
    },
    labels: sortedData.map(d => new Date(d.lastReportTime).getTime()),
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: function(value, timestamp) {
          return new Date(timestamp).toLocaleString();
        }
      },
    },
    yaxis: [
      {
        title: {
          text: 'RTT (ms)',
        },
        min: 0,
        max: sortedData.map(d => d.maxRTT > 500 ? 250 : d.maxRTT).reduce((a, b) => Math.max(a, b)),
        labels: {
          formatter: (val) => val.toFixed(1)
        }
      },
      {
        opposite: true,
        title: {
          text: 'Packet Loss % / Out of Sequence'
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
            } else if (seriesIndex === 3) {
              return y.toFixed(1) + "%";
            } else {
              return y.toFixed(0);
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