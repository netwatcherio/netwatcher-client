<script lang="ts" setup>
import { onMounted, reactive, watch } from "vue";
import core from "@/core";
import siteService from "@/services/siteService";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";
import type {
  Agent,
  MtrHop,
  MtrResult,
  PingResult,
  Probe,
  ProbeData,
  ProbeDataRequest,
  ProbeType,
  RPerfResults,
  Site,
  TrafficSimResult
} from "@/types";
import Title from "@/components/Title.vue";
import { AsciiTable3 } from "@/lib/ascii-table3/ascii-table3";
import LatencyGraph from "@/components/PingGraph.vue";
import TrafficSimGraph from "@/components/TrafficSimGraph.vue";
import NetworkMap from "@/components/NetworkMap.vue";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Reactive state to hold parsed groups and UI data
const state = reactive({
  site: {} as Site,
  agent: {} as Agent,
  similarProbes: [] as any[],
  // Parsed ProbeData by type
  pingData: [] as ProbeData[],
  probe: {} as Probe[],
  mtrData: [] as ProbeData[],
  rperfData: [] as ProbeData[],
  trafficSimData: [] as ProbeData[],
  // Additional sections
  availableTargets: [] as Array<{agent:string,group:string}>,
  summary: {
    totalDataPoints: 0,
    reportingAgents: [] as string[],
    targetAgents: [] as string[],
    probeTypes: [] as string[],
    dataCountByType: {} as Record<string,number>
  },
  timeRange: [] as [Date, Date],
  title: "",
  ready: false
});

function transformPingDataMulti(dataArray: any[]): PingResult[] {
  return dataArray.map(data => {
    const findValueByKey = (key: string) => data.data.find((d: any) => d.Key === key)?.Value;

    //console.log(new Date(findValueByKey("stop_timestamp")))
    return {
      startTimestamp: new Date(findValueByKey("start_timestamp")),
      stopTimestamp: new Date(findValueByKey("stop_timestamp")),
      packetsRecv: parseInt(findValueByKey("packets_recv")),
      packetsSent: parseInt(findValueByKey("packets_sent")),
      packetsRecvDuplicates: parseInt(findValueByKey("packets_recv_duplicates")),
      packetLoss: parseInt(findValueByKey("packet_loss")),
      addr: findValueByKey("addr"),
      minRtt: parseInt(findValueByKey("min_rtt")),
      maxRtt: parseInt(findValueByKey("max_rtt")),
      avgRtt: parseInt(findValueByKey("avg_rtt")),
      stdDevRtt: parseInt(findValueByKey("std_dev_rtt")),
    };
  });
}

function transformToTrafficSimResult(dataArray: ProbeData[]): TrafficSimResult[] {
  return dataArray.map(data => {
    // Initialize the TrafficSimResult structure
    const result: TrafficSimResult = {
      averageRTT: 0,
      duplicatePackets: 0,
      lostPackets: 0,
      maxRTT: 0,
      minRTT: 0,
      outOfSequence: 0,
      stdDevRTT: 0,
      totalPackets: 0,
      reportTime: new Date()
    };

    // Extract and transform the data
    data.data.forEach((item: { Key: string; Value: any }) => {
      switch (item.Key) {
        case 'averageRTT':
          result.averageRTT = item.Value;
          break;
        case 'duplicatePackets':
          result.duplicatePackets = item.Value;
          break;
        case 'lostPackets':
          result.lostPackets = item.Value;
          break;
        case 'maxRTT':
          result.maxRTT = item.Value;
          break;
        case 'minRTT':
          result.minRTT = item.Value;
          break;
        case 'outOfSequence':
          result.outOfSequence = item.Value;
          break;
        case 'stdDevRTT':
          result.stdDevRTT = item.Value;
          break;
        case 'totalPackets':
          result.totalPackets = item.Value;
          break;
        case 'reportTime':
          result.reportTime = new Date(item.Value);
          break;
      }
    });

    return result;
  });
}

function transformToRPerfResults(dataArray: ProbeData[]): RPerfResults[] {
  return dataArray.map(data => {
    // Initialize the RPerfResults structure
    const result: RPerfResults = {
      startTimestamp: new Date(),
      stopTimestamp: new Date(),
      config: {
        additional: {ipVersion: 0, omitSeconds: 0, reverse: false},
        common: {family: '', length: 0, streams: 0},
        download: {},
        upload: {bandwidth: 0, duration: 0, sendInterval: 0}
      },
      streams: [], // Assuming you have a way to populate this based on your data
      success: false,
      summary: {
        bytesReceived: 0,
        bytesSent: 0,
        durationReceive: 0,
        durationSend: 0,
        framedPacketSize: 0,
        jitterAverage: 0,
        jitterPacketsConsecutive: 0,
        packetsDuplicated: 0,
        packetsLost: 0,
        packetsOutOfOrder: 0,
        packetsReceived: 0,
        packetsSent: 0
      }
    };

    // Extract and transform the data
    data.data.forEach((item: { Key: string; Value: any }) => {
      switch (item.Key) {
        case 'start_timestamp':
          result.startTimestamp = new Date(item.Value);
          break;
        case 'stop_timestamp':
          result.stopTimestamp = new Date(item.Value);
          break;
        case 'config':
          // Map the config data according to RPerfResults structure
          // Similar to the example in your previous request
          break;
        case 'success':
          result.success = item.Value;
          break;
        case 'summary':
          item.Value.forEach((summaryItem: { Key: string; Value: any }) => {
            const key = camelCase(summaryItem.Key);
            if (key in result.summary) {
              result.summary[key as keyof typeof result.summary] = summaryItem.Value;
            }
          });
          break;
          // Add other cases as needed
      }
    });

    return result;
  });
}

function transformMtrDataMulti(dataArray: ProbeData[]): MtrResult[] {
  return dataArray.map(data => transformMtrData(data.data));
}

function transformMtrData(data: any[]): MtrResult {
  //console.log(data);

  const result: MtrResult = {
    startTimestamp: new Date(),  // Default value, to be updated
    stopTimestamp: new Date(),   // Default value, to be updated
    report: {
      info: {
        target: {
          ip: '',
          hostname: ''
        }
      },
      hops: []
    }
  };

  const reportData = data.find(d => d.Key === 'report')?.Value;
  if (reportData) {
    reportData.forEach((item: any) => {
      if (item.Key === 'info') {
        const targetData = item.Value.find((val: any) => val.Key === 'target')?.Value;
        if (targetData) {
          targetData.forEach((target: any) => {
            if (target.Key === 'ip') result.report.info.target.ip = target.Value;
            if (target.Key === 'hostname') result.report.info.target.hostname = target.Value;
          });
        }
      } else if (item.Key === 'hops') {
        result.report.hops = item.Value.map((hopArray: any[]) => {
          const hop: MtrHop = {
            ttl: 0,
            hosts: [],
            extensions: [],
            loss_pct: '',
            sent: 0,
            last: '',
            recv: 0,
            avg: '',
            best: '',
            worst: '',
            stddev: ''
          };
          hopArray.forEach(hopItem => {
            if (hopItem.Key === 'ttl') hop.ttl = hopItem.Value;
            else if (hopItem.Key === 'hosts') {
              hop.hosts = hopItem.Value.map(hostArray => {
                const host = {ip: '', hostname: ''};
                hostArray.forEach(hostItem => {
                  if (hostItem.Key === 'ip') host.ip = hostItem.Value;
                  if (hostItem.Key === 'hostname') host.hostname = hostItem.Value;
                });
                return host;
              });
            } else {
              hop[hopItem.Key] = hopItem.Value;  // For other keys like extensions, lossPct, etc.
            }
          });
          return hop;
        });
      }
    });
  }

  // Assuming the start and stop timestamps are at the same level as report
  const startTimestampItem = data.find(d => d.Key === 'start_timestamp');
  if (startTimestampItem) result.startTimestamp = new Date(startTimestampItem.Value);

  const stopTimestampItem = data.find(d => d.Key === 'stop_timestamp');
  if (stopTimestampItem) result.stopTimestamp = new Date(stopTimestampItem.Value);

  return result;
}


function generateTable(probeData: ProbeData) {
  let mtrCalculate = transformMtrData(probeData.data);

  let table = new AsciiTable3(mtrCalculate.report.info.target.hostname + " (" + mtrCalculate.report.info.target.ip + ")" + " - " + mtrCalculate.stopTimestamp.toISOString());
  table.setHeading('Hop', 'Host', 'Loss%', 'Snt', 'Recv', 'Avg', 'Best', 'Worst', 'StDev');

  const seenIPs = new Map(); // To track IPs and their occurrences

  mtrCalculate.report.hops.forEach((hop, hopIndex) => {
    if (hop.hosts.length === 0) {
      // Add a row for the hop itself with '*' for the values
      table.addRow(
          hopIndex.toString(),
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*'
      );
    } else {
      hop.hosts.forEach((host, hostIndex) => {
        const hostDisplay = host.hostname + " (" + host.ip + ")";
        let hopDisplay = hopIndex.toString();
        let prefix = '    '; // Default prefix with spaces

        if (seenIPs.has(host.ip)) {
          // If we have seen this IP before, we might be seeing an ECMP route
          const occurrences = seenIPs.get(host.ip);
          prefix = '|   '; // Vertical line for continuation of a seen IP
          hopDisplay = "+-> " + hopDisplay; // Indicate a branching for a new ECMP route
          seenIPs.set(host.ip, occurrences + 1); // Increment the occurrence count
        } else {
          // If this is the first time we see this IP
          seenIPs.set(host.ip, 1); // Set the occurrence count to 1
        }

        // We only apply the prefix if it's not the first host (to align with the first host of this hop)
        if (hostIndex !== 0) {
          hopDisplay = prefix + hopDisplay;
        }

        table.addRow(
            hopDisplay,
            hostDisplay,
            hop.loss_pct,
            hop.sent.toString(),
            hop.recv.toString(),
            hop.avg,
            hop.best,
            hop.worst,
            hop.stddev
        );
      });
    }
  });

  table.setStyle("unicode-single");

  return table.toString();
}
// Reload using grouped API response
function reloadData(checkId: string) {
  state.pingData = [];
  state.mtrData = [];
  state.rperfData = [];
  state.trafficSimData = [];

  probeService.getProbe(checkId).then(res => {
    state.probe = res.data as Probe[]

    // todo fix title - chances are when not using a group,
    // it won't be more than 0, lets hope someone doesn't abuse it
    console.log(state.probe[0].config.target[0].agent)
    if (state.probe[0].config.target[0].agent != "0000000000000000" && !state.probe[0].config.target[0].target){

      agentService.getAgent(state.probe[0].config.target[0].agent).then(res => {
        state.probeAgent = res.data as Agent
        state.title = state.probeAgent.name
      })

    }else if(state.probe[0].config.target[0].target) {
      state.title = state.probe[0].config.target[0].target
      let split = state.probe[0].config.target[0].target.split(":")
      if (split.length >= 2) {
        state.title = split[0]
      }
    }

  agentService.getAgent(state.probe[0].agent).then(res => {
      state.agent = res.data as Agent

      // get site
      siteService.getSite(state.agent.site).then(res => {
        state.site = res.data as Site
      });

  probeService.getProbeData(checkId, {
    recent: false,
    limit: 5000,
    startTimestamp: state.timeRange[0],
    endTimestamp: state.timeRange[1]
  } as ProbeDataRequest)
  .then(res => {
    const { groups, availableTargets, summary } = res.data;

    // store availableTargets and summary
    state.availableTargets = availableTargets;
    state.summary = summary;

    // iterate nested groups → agentID → type → entries
    Object.values(groups).forEach(agentGroup => {
      Object.entries(agentGroup).forEach(([agentId, typeMap]) => {
        Object.entries(typeMap as Record<string, ProbeData[]>).forEach(([type, entries]) => {
          entries.forEach(entry => {
            switch (type) {
              case 'PING':
                state.pingData.push(entry);
                break;
              case 'MTR':
                state.mtrData.push(entry);
                break;
              case 'TRAFFICSIM':
                state.trafficSimData.push(entry);
                break;
            }
          });
        });
      });
    });

    console.log(state.mtrData)

    state.ready = true;
  })
  .catch(err => console.error('Failed to load grouped data', err));
    });
});
}

// Initialize on mount
onMounted(() => {
  const router = core.router();
  const checkId = router.currentRoute.value.params['idParam'] as string;
  if (!checkId) return;

  // default to last 3 hours
  state.timeRange = [ new Date(Date.now() - 3*60*60*1000), new Date() ];

  // fetch site and agent metadata
  Promise.all([
    probeService.getProbe(checkId),
    agentService.getAgent(checkId)
  ]).catch(() => {});

  reloadData(checkId);
});

// Watch for timeRange changes
watch(() => state.timeRange, (newRange) => {
  const router = core.router();
  const checkId = router.currentRoute.value.params['idParam'] as string;
  if (checkId) reloadData(checkId);
}, { deep: true });
</script>

<template>
  <div v-if="state.ready" class="container-fluid">
    <Title
        :history="[{title: 'workspaces', link: '/workspaces'}, {title: state.site.name, link: `/workspace/${state.site.id}`}, {title: state.agent.name, link: `/agent/${state.agent.id}`}]"
        :title="state.title"
        subtitle="information about this target">
      <div v-if="state.ready" class="d-flex gap-1">
        <!--        <router-link :to="`/agent/${state.agent.id}/checks`" active-class="active" class="btn btn-outline-primary"><i
                    class="fa-regular fa-pen-to-square"></i>&nbsp;edit checks
                </router-link>
                <router-link :to="`/agents/${state.agent.id}/probes/new`" active-class="active" class="btn btn-primary"><i
                    class="fa-solid fa-plus"></i>&nbsp;add check
                </router-link>-->
        <VueDatePicker v-model="state.timeRange" :partial-range="false" range/>
      </div>
    </Title>

    <!-- Summary Card -->
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Summary</h5>
        <p>Total Data Points: {{ state.summary.totalDataPoints }}</p>
        <p>Reporting Agents: {{ state.summary.reportingAgents.join(', ') }}</p>
        <p>Target Agents: {{ state.summary.targetAgents.join(', ') }}</p>
        <p>Probe Types: {{ state.summary.probeTypes.join(', ') }}</p>
        <p>Counts: {{ state.summary.dataCountByType }}</p>
      </div>
    </div>

    <!-- Available Targets -->
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Available Targets</h5>
        <ul>
          <li v-for="t in state.availableTargets" :key="t.agent + '-' + t.group">
            Agent: {{ t.agent }}, Group: {{ t.group }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Ping Graph -->
    <div class="card mb-3" v-if="state.pingData.length">
      <div class="card-body">
        <h5 class="card-title">Latency</h5>
        <LatencyGraph :pingResults="transformPingDataMulti(state.pingData)" />
      </div>
    </div>

    <!-- TrafficSim Graph -->
    <div class="card mb-3" v-if="state.trafficSimData.length">
      <div class="card-body">
        <h5 class="card-title">Simulated Traffic</h5>
        <TrafficSimGraph :traffic-results="transformToTrafficSimResult(state.trafficSimData)" />
      </div>
    </div>

    <!-- MTR Map and Table -->
    <div class="card mb-3" v-if="state.mtrData.length">
      <div class="card-body">
        <h5 class="card-title">Traceroutes</h5>
        <NetworkMap :mtrResults="transformMtrDataMulti(state.mtrData)" />
        <div id="mtrAccordion" class="accordion">

              <div v-for="mtr in state.mtrData" :key="mtr.id">

                <div class="accordion-item">
                  <h2 :id="'heading' + mtr.id" class="accordion-header">
                    <button :aria-controls="'collapse' + mtr.id" :aria-expanded="false"
                            :data-bs-target="'#collapse' + mtr.id"
                            class="accordion-button collapsed" data-bs-toggle="collapse" type="button">
                      {{ transformMtrData((mtr as ProbeData).data).stopTimestamp }}
                      <span v-if="(mtr as ProbeData).triggered" class="badge bg-dark">TRIGGERED</span>
                    </button>

                  </h2>
                  <div :id="'collapse' + mtr.id" :aria-labelledby="'heading' + mtr.id"
                       class="accordion-collapse collapse"
                       data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                      <pre style="text-align: center">{{ generateTable(mtr as ProbeData) }}</pre>
                    </div>
                  </div>
                </div>

              </div>
              </div>
      </div>
    </div>

    <!-- RPerf Graph -->
    <div class="card mb-3" v-if="state.rperfData.length">
      <div class="card-body">
        <h5 class="card-title">RPerf Results</h5>
        <RperfGraph :rperfResults="transformToRPerfResults(state.rperfData)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-fluid { padding: 1rem; }
.mb-3 { margin-bottom: 1rem; }
</style>
