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
import RperfGraph from "@/components/RperfGraph.vue";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Reactive state to hold parsed groups and UI data
const state = reactive({
  site: {} as Site,
  agent: {} as Agent,
  similarProbes: [] as Probe[],
  // Parsed ProbeData by type
  pingData: [] as ProbeData[],
  probe: {} as Probe[],
  mtrData: [] as ProbeData[],
  rperfData: [] as ProbeData[],
  trafficSimData: [] as ProbeData[],
  probeData: [] as ProbeData[],
  // Additional sections from AgentProbe
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
  ready: false,
  probeAgent: {} as Agent,
  table: {} as string,
  pingGraph: {} as any,
  target: {} as string,
  checks: [] as Probe[],
});

const router = core.router();

function transformPingDataMulti(dataArray: any[]): PingResult[] {
  return dataArray.map(data => {
    const findValueByKey = (key: string) => data.data.find((d: any) => d.Key === key)?.Value;

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

function camelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function transformToTrafficSimResult(dataArray: ProbeData[]): TrafficSimResult[] {
  return dataArray.map(data => {
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
    const result: RPerfResults = {
      startTimestamp: new Date(),
      stopTimestamp: new Date(),
      config: {
        additional: {ipVersion: 0, omitSeconds: 0, reverse: false},
        common: {family: '', length: 0, streams: 0},
        download: {},
        upload: {bandwidth: 0, duration: 0, sendInterval: 0}
      },
      streams: [],
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
      }
    });

    return result;
  });
}

function transformMtrDataMulti(dataArray: ProbeData[]): MtrResult[] {
  return dataArray.map(data => transformMtrData(data.data));
}

function transformMtrData(data: any[]): MtrResult {
  const result: MtrResult = {
    startTimestamp: new Date(),
    stopTimestamp: new Date(),
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
              hop[hopItem.Key] = hopItem.Value;
            }
          });
          return hop;
        });
      }
    });
  }

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

  const seenIPs = new Map();

  mtrCalculate.report.hops.forEach((hop, hopIndex) => {
    if (hop.hosts.length === 0) {
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
        let prefix = '    ';

        if (seenIPs.has(host.ip)) {
          const occurrences = seenIPs.get(host.ip);
          prefix = '|   ';
          hopDisplay = "+-> " + hopDisplay;
          seenIPs.set(host.ip, occurrences + 1);
        } else {
          seenIPs.set(host.ip, 1);
        }

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

// Helper function to add probe data without duplicates
function addProbeDataUnique(targetArray: ProbeData[], newData: ProbeData) {
  const exists = targetArray.some(item => item.id === newData.id);
  if (!exists) {
    targetArray.push(newData);
  } else {
    console.log(`Duplicate probe data detected and skipped: ${newData.id}`);
  }
}

// Enhanced reload using grouped API response (from AgentProbe)
function reloadData(checkId: string) {
  state.pingData = [];
  state.mtrData = [];
  state.rperfData = [];
  state.trafficSimData = [];
  state.probeData = [];
  state.similarProbes = [];

  probeService.getProbe(checkId).then(res => {
    state.probe = res.data as Probe[];

    console.log(state.probe[0].config.target[0].agent);
    if (state.probe[0].config.target[0].agent != "0000000000000000" && !state.probe[0].config.target[0].target) {
      agentService.getAgent(state.probe[0].config.target[0].agent).then(res => {
        state.probeAgent = res.data as Agent;
        state.title = state.probeAgent.name;
      });
    } else if(state.probe[0].config.target[0].target) {
      state.title = state.probe[0].config.target[0].target;
      let split = state.probe[0].config.target[0].target.split(":");
      if (split.length >= 2) {
        state.title = split[0];
      }
    }

    agentService.getAgent(state.probe[0].agent).then(res => {
      state.agent = res.data as Agent;

      siteService.getSite(state.agent.site).then(res => {
        state.site = res.data as Site;
        
        // Try to get grouped data first (AgentProbe approach)
        probeService.getProbeData(checkId, {
          recent: false,
          limit: 5000,
          startTimestamp: state.timeRange[0],
          endTimestamp: state.timeRange[1]
        } as ProbeDataRequest)
        .then(res => {
          if (res.data.groups) {
            // Use grouped approach from AgentProbe
            const { groups, availableTargets, summary } = res.data;

            state.availableTargets = availableTargets || [];
            state.summary = summary || state.summary;

            Object.values(groups).forEach(agentGroup => {
              Object.entries(agentGroup).forEach(([agentId, typeMap]) => {
                Object.entries(typeMap as Record<string, ProbeData[]>).forEach(([type, entries]) => {
                  entries.forEach(entry => {
                    addProbeDataUnique(state.probeData, entry);
                    switch (type) {
                      case 'PING':
                        addProbeDataUnique(state.pingData, entry);
                        break;
                      case 'MTR':
                        addProbeDataUnique(state.mtrData, entry);
                        break;
                      case 'TRAFFICSIM':
                        addProbeDataUnique(state.trafficSimData, entry);
                        break;
                      case 'RPERF':
                        addProbeDataUnique(state.rperfData, entry);
                        break;
                    }
                  });
                });
              });
            });

            state.ready = true;
            console.log(`Loaded ${state.mtrData.length} unique MTR entries`);
            
            // Also get similar probes for compatibility
            probeService.getSimilarProbes(checkId).then(res => {
              state.similarProbes = res.data as Probe[];
            }).catch(() => {});
          } else {
            // Fallback to original Probe.vue approach
            handleLegacyDataLoading(checkId);
          }
        })
        .catch(() => {
          // Fallback to original approach if grouped API fails
          handleLegacyDataLoading(checkId);
        });
      });
    });
  });
}

// Original Probe.vue data loading approach as fallback
function handleLegacyDataLoading(checkId: string) {
  state.ready = true;
  
  probeService.getSimilarProbes(checkId).then(res => {
    state.similarProbes = res.data as Probe[];
    let loadPromises: Promise<any>[] = [];
    
    for (let p of state.similarProbes) {
      console.log(p);
      const promise = probeService.getProbeData(p.id, {
        recent: false,
        limit: 5000,
        startTimestamp: state.timeRange[0],
        endTimestamp: state.timeRange[1]
      } as ProbeDataRequest).then(res => {
        for (let d of res.data as ProbeData[]) {
          addProbeDataUnique(state.probeData, d);

          let pprober = getProbe(d.probe) as Probe;

          if (pprober.type == "PING") {
            addProbeDataUnique(state.pingData, d);
          }
          if (pprober.type == "MTR") {
            addProbeDataUnique(state.mtrData, d);
          }
          if (pprober.type == "RPERF" && !pprober.config.server) {
            addProbeDataUnique(state.rperfData, d);
          }
          if (pprober.type == "TRAFFICSIM") {
            addProbeDataUnique(state.trafficSimData, d);
          }
        }
      });
      loadPromises.push(promise);
    }
    
    // Log when all data is loaded
    Promise.all(loadPromises).then(() => {
      console.log(`Legacy load complete: ${state.mtrData.length} unique MTR entries`);
    });
  });
}

function getProbe(probeId: string) {
  let foundProbe = state.similarProbes.find(probe => probe.id === probeId);
  return foundProbe ? foundProbe : null;
}

function containsProbeType(type: ProbeType): boolean {
  // Check in similar probes first
  for (const probe of state.similarProbes) {
    if (probe.type === type) {
      return true;
    }
  }
  
  // Also check in summary if available
  if (state.summary.probeTypes && state.summary.probeTypes.includes(type)) {
    return true;
  }
  
  // Check actual data
  switch(type) {
    case 'PING':
      return state.pingData.length > 0;
    case 'MTR':
      return state.mtrData.length > 0;
    case 'RPERF':
      return state.rperfData.length > 0;
    case 'TRAFFICSIM':
      return state.trafficSimData.length > 0;
    default:
      return false;
  }
}

// Preserved from original Probe.vue
function onCreate(response: any) {
  router.push("/workspaces");
}

function onError(response: any) {
  alert(response);
}

function submit() {
  // Implementation if needed
}

// Initialize on mount
onMounted(() => {
  const checkId = router.currentRoute.value.params['idParam'] as string;
  if (!checkId) return;

  // default to last 3 hours
  state.timeRange = [new Date(Date.now() - 3*60*60*1000), new Date()];

  // fetch site and agent metadata
  Promise.all([
    probeService.getProbe(checkId),
    agentService.getAgent(checkId)
  ]).catch(() => {});

  reloadData(checkId);
});

// Watch for timeRange changes
watch(() => state.timeRange, (newRange) => {
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
        <VueDatePicker v-model="state.timeRange" :partial-range="false" range/>
      </div>
    </Title>

    <!-- Summary Card (from AgentProbe) -->
    <div class="card mb-3" v-if="state.summary.totalDataPoints > 0">
      <div class="card-body">
        <h5 class="card-title">Summary</h5>
        <p>Total Data Points: {{ state.summary.totalDataPoints }}</p>
        <p>Reporting Agents: {{ state.summary.reportingAgents.join(', ') }}</p>
        <p>Target Agents: {{ state.summary.targetAgents.join(', ') }}</p>
        <p>Probe Types: {{ state.summary.probeTypes.join(', ') }}</p>
        <p>Counts: <span v-for="(count, type) in state.summary.dataCountByType" :key="type">{{ type }}: {{ count }}, </span></p>
      </div>
    </div>

    <!-- Available Targets (from AgentProbe) -->
    <div class="card mb-3" v-if="state.availableTargets.length > 0">
      <div class="card-body">
        <h5 class="card-title">Available Targets</h5>
        <ul>
          <li v-for="t in state.availableTargets" :key="t.agent + '-' + t.group">
            Agent: {{ t.agent }}, Group: {{ t.group }}
          </li>
        </ul>
      </div>
    </div>

    <div class="row">
      <!-- Ping/Latency Graph -->
      <div class="col-sm-12" v-if="containsProbeType('PING')">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Latency</h5>
            <p class="card-text">displays the stats associated with latency</p>
            <div v-if="state.pingData.length <= 0">
              <div class="error-body text-center">
                <h1 class="error-title text-warning">Loading...</h1>
                <h3 class="text-error-subtitle">please wait for data to load</h3>
              </div>
            </div>
            <div v-else>
              <LatencyGraph :pingResults="transformPingDataMulti(state.pingData)" />
            </div>
          </div>
        </div>
      </div>

      <!-- TrafficSim Graph -->
      <div class="col-sm-12" v-if="containsProbeType('TRAFFICSIM')">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Simulated Traffic</h5>
            <p class="card-text">displays the stats for simulated traffic</p>
            <div v-if="state.trafficSimData.length <= 0">
              <div class="error-body text-center">
                <h1 class="error-title text-warning">Loading...</h1>
                <h3 class="text-error-subtitle">please wait for data to load</h3>
              </div>
            </div>
            <div v-else>
              <TrafficSimGraph :traffic-results="transformToTrafficSimResult(state.trafficSimData)" />
            </div>
          </div>
        </div>
      </div>

      <!-- RPerf Graph (commented out in original) -->
      <!--<div class="col-sm-12" v-if="containsProbeType('RPERF')">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">RPerf Traffic</h5>
            <p class="card-text">displays the stats for rperf traffic</p>
            <div v-if="state.rperfData.length <= 0">
              <div class="error-body text-center">
                <h1 class="error-title text-warning">Loading...</h1>
                <h3 class="text-error-subtitle">please wait for data to load</h3>
              </div>
            </div>
            <div v-else>
              <RperfGraph :rperfResults="transformToRPerfResults(state.rperfData)"/>
            </div>
          </div>
        </div>
      </div>-->

      <!-- MTR Map and Table -->
      <div class="col-sm-12" v-if="containsProbeType('MTR')">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Traceroutes</h5>
            <p class="card-text">view the recent trace routes for the selected period of time</p>
            <div v-if="state.mtrData.length <= 0">
              <div class="error-body text-center">
                <h1 class="error-title text-warning">Loading...</h1>
                <h3 class="text-error-subtitle">please wait for data to load</h3>
              </div>
            </div>
            <div v-else>
              <NetworkMap :mtrResults="transformMtrDataMulti(state.mtrData)" />
              <div id="mtrAccordion" class="accordion">
                <div v-for="(mtr, index) in state.mtrData" :key="`${mtr.id}-${index}`">
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
                         data-bs-parent="#mtrAccordion">
                      <div class="accordion-body">
                        <pre style="text-align: center">{{ generateTable(mtr as ProbeData) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container-fluid { 
  padding: 1rem; 
}
.mb-3 { 
  margin-bottom: 1rem; 
}
.check-grid {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(12, minmax(8rem, 1fr));
  grid-gap: 0.5rem;
}
</style>