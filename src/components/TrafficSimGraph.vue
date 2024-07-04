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

  var chart = undefined

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

  const annotations = {
    xaxis: sortedData.reduce((acc, current, index, array) => {
      if (index > 0) {
        const prev = array[index - 1];
        const gap = new Date(current.lastReportTime).getTime() - new Date(prev.lastReportTime).getTime();
        if (gap > maxAllowedGap) {
          acc.push({
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
      return acc;
    }, [] as ApexCharts.XAxisAnnotations[])
  };

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