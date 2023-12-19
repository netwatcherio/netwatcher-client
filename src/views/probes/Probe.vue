<script lang="ts" setup>

import {onMounted, reactive, watch} from "vue";
import siteService from "@/services/siteService";
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
  Site
} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";
import {AsciiTable3} from "@/lib/ascii-table3/ascii-table3"
import LatencyGraph from "@/components/PingGraph.vue";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import RperfGraph from "@/components/RperfGraph.vue";
import NetworkMap from "@/components/NetworkMap.vue";

const state = reactive({
  target: {} as string,
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  checks: [] as Probe[],
  table: {} as string, // may need to re-work this...
  similarProbes: [] as Probe[],
  probe: {} as Probe[],
  probeData: [] as ProbeData[],
  title: {} as string,
  pingData: [] as ProbeData[],
  pingGraph: {} as any,
  timeRange: {} as [Date, Date],
  mtrData: [] as ProbeData[],
  rperfData: [] as ProbeData[],
  probeAgent: {} as Agent
})

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

function camelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
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




// Other interfaces and transformMtrData function should be defined here as well.


function reloadData(checkId: string) {
  state.pingData = []
  state.probeData = []
  state.similarProbes = []
  state.mtrData = []
  state.rperfData = []

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

      siteService.getSite(state.agent.site).then(res => {
        state.site = res.data as Site
        state.ready = true

        probeService.getSimilarProbes(checkId).then(res => {
          state.similarProbes = res.data as Probe[]
          for (let p of state.similarProbes) {

            probeService.getProbeData(p.id, {
              recent: false,
              limit: 5000,
              startTimestamp: state.timeRange[0],
              endTimestamp: state.timeRange[1]
            } as ProbeDataRequest).then(res => {
              for (let d of res.data as ProbeData[]) {
                //state.probeData.push(d)

                let pprober = getProbe(d.probe) as Probe

                if (pprober.type == "PING") {
                  state.pingData.push(d)
                }
                if (pprober.type == "MTR") {
                  //console.log(d)
                  state.mtrData.push(d)
                }
                if (pprober.type == "RPERF" && !pprober.config.server) {
                  state.rperfData.push(d)
                  //console.log(d.data)
                }
              }
            })
          }

          //console.log(state.rperfData)
          //console.log(state.pingData)
        })
      })
    })
  })
}

function transformPingData(data: any): PingResult {
  return {
    startTimestamp: new Date(data.data.find((d: any) => d.Key === "start_timestamp").Value),
    stopTimestamp: new Date(data.data.find((d: any) => d.Key === "stop_timestamp").Value),
    packetsRecv: data.data.find((d: any) => d.Key === "packets_recv").Value,
    packetsSent: data.data.find((d: any) => d.Key === "packets_sent").Value,
    packetsRecvDuplicates: data.data.find((d: any) => d.Key === "packets_recv_duplicates").Value,
    packetLoss: data.data.find((d: any) => d.Key === "packet_loss").Value,
    addr: data.data.find((d: any) => d.Key === "addr").Value,
    minRtt: data.data.find((d: any) => d.Key === "min_rtt").Value,
    maxRtt: data.data.find((d: any) => d.Key === "max_rtt").Value,
    avgRtt: data.data.find((d: any) => d.Key === "avg_rtt").Value,
    stdDevRtt: data.data.find((d: any) => d.Key === "std_dev_rtt").Value,
  }
}


function getProbe(probeId: string) {
  let foundProbe = state.similarProbes.find(probe => probe.id === probeId);
  return foundProbe ? foundProbe : null;
}

// const site = inject("site") as Site

watch(() => state.timeRange, (newTimeRange) => {
  let checkId = router.currentRoute.value.params["probeId"] as string;
  if (checkId) {
    reloadData(checkId);
  }
  state.timeRange = newTimeRange
}, {deep: true});

onMounted(() => {
  let checkId = router.currentRoute.value.params["probeId"] as string
  if (!checkId) return

  state.timeRange = [
    new Date(new Date().getTime() - 3 * 60 * 60 * 1000), // Current time minus 6 hours
    new Date() // Current time
  ]

  //console.log(checkId)


  /*setInterval(() => {
    reloadData(checkId);
  }, 1000 * 15);*/
  /*reloadData(checkId);*/
})
const router = core.router()

function onCreate(response: any) {
  router.push("/sites")
}

function onError(response: any) {
  alert(response)
}

function submit() {

}

</script>

<template>
  <div v-if="state.ready" class="container-fluid">
    <Title
        :history="[{title: 'workspaces', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}, {title: state.agent.name, link: `/agents/${state.agent.id}`}]"
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

    <div class="row">
      <!--      <div class="col-sm-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">voice graph</h5>
                  <p class="card-text">this shows the estimated mos score of your target</p>
                </div>
              </div>
            </div>-->
      <div v-if="state.pingData.length > 0" class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">latency</h5>
            <p class="card-text">displays the stats associated with latency</p>
            <LatencyGraph v-if="state.ready" :pingResults="transformPingDataMulti(state.pingData)"/>
          </div>
        </div>
      </div>
      <div v-if="state.rperfData.length > 0" class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">simulated traffic</h5>
            <p class="card-text">displays the stats for simulated traffic</p>
            <RperfGraph v-if="state.ready" :rperfResults="transformToRPerfResults(state.rperfData)"/>
          </div>
        </div>
      </div>
      <div v-if="state.mtrData.length > 0" class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">traceroutes</h5>
            <p class="card-text">view the recent trace routes for the selected period of time</p>

                        <NetworkMap v-if="state.ready" :mtrResults="transformMtrDataMulti(state.mtrData)"/>

            <div id="mtrAccordion" class="accordion">

              <div v-for="mtr in state.mtrData" :key="mtr.id">

                <div v-if="getProbe((mtr as ProbeData).probe).type == `MTR` as ProbeType" class="accordion-item">
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

              <!-- Add more accordion items here if needed -->
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.check-grid {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(12, minmax(8rem, 1fr));
  grid-gap: 0.5rem;

}
</style>