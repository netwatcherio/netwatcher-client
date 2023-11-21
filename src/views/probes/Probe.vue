<script lang="ts" setup>

import {onMounted, reactive, ref, watch} from "vue";
import siteService from "@/services/siteService";
import type {
  Agent,
  MtrReport,
  MtrResult,
  PingResult,
  Probe,
  ProbeData,
  ProbeDataRequest,
  ProbeType,
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

function transformMtrDataMulti(dataArray: ProbeData[]): MtrResult[] {
  console.log(dataArray)

  return dataArray.map(data => {
    // Initialize the report structure
    const report: MtrReport = {
      mtr: {
        src: '',
        dst: '',
        tos: 0,
        tests: 0,
        psize: '',
        bitpattern: ''
      },
      hubs: []
    };

    // Extract the report data
    const reportData = data.data.find((d: { Key: string; }) => d.Key === 'report')?.Value;
    if (reportData) {
      reportData.forEach((reportItem: { Key: string; Value: any }) => {
        if (reportItem.Key === 'mtr') {
          Object.assign(report.mtr, reportItem.Value);
        } else if (reportItem.Key === 'hubs') {
          report.hubs = reportItem.Value.map((hubData: { [s: string]: unknown; } | ArrayLike<unknown>) => {
            const hub: any = {};
            Object.entries(hubData).forEach(([key, value]) => {
              hub[key] = value;
            });
            return hub;
          });
        }
      });
    }

    // Find the values for startTimestamp, stopTimestamp, and triggered
    const startTimestamp = new Date(data.data.find((d: any) => d.Key === 'start_timestamp')?.Value);
    const stopTimestamp = new Date(data.data.find((d: any) => d.Key === 'stop_timestamp')?.Value);
    const triggered = data.data.find((d: any) => d.Key === 'triggered')?.Value;

    // Return the MtrResult object
    return {
      startTimestamp,
      stopTimestamp,
      triggered,
      report
    };
  });
}


function transformMtrData(data: any[]): MtrResult {
  let result: MtrResult = {
    startTimestamp: new Date(),
    stopTimestamp: new Date(),
    triggered: false,
    report: {
      mtr: {
        src: '',
        dst: '',
        tos: 0,
        tests: 0,
        psize: '',
        bitpattern: ''
      },
      hubs: []
    }
  };

  data.forEach(item => {

    switch (item.Key) {
      case 'start_timestamp':
        result.startTimestamp = new Date(item.Value);
        break;
      case 'stop_timestamp':
        result.stopTimestamp = new Date(item.Value);
        break;
      case 'triggered':
        result.triggered = item.Value;
        break;
      case 'report':
        item.Value.forEach(reportItem => {
          if (reportItem.Key === 'mtr') {
            reportItem.Value.forEach(mtrItem => {
              result.report.mtr[mtrItem.Key] = mtrItem.Value;
            });
          } else if (reportItem.Key === 'hubs') {
            reportItem.Value.forEach(hubArray => {
              let hub = {};
              hubArray.forEach(hubItem => {
                hub[hubItem.Key] = hubItem.Value;
              });
              result.report.hubs.push(hub);
            });
          }
        });
        break;
        // Add more cases as needed
    }
  });

  return result;
}

function generateTable(probeData: ProbeData) {
  let mtrCalculate = transformMtrData(probeData.data)

  let table = new AsciiTable3(mtrCalculate.report.mtr.dst + " - " + mtrCalculate.stopTimestamp);
  table.setHeading('Hop', 'Host', 'Loss%', 'Snt', 'Recv', 'Avg', 'Best', 'Worst', 'StDev', 'ASN')
  for (let i = 0; i < mtrCalculate.report.hubs.length; i++) {
    let v = mtrCalculate.report.hubs[i]
    table.addRow(i, v.host, v["Loss%"], v.Snt, v.Rcv, v.Avg, v.Best, v.Wrst, v.StDev, v.ASN)
  }
  table.setStyle("unicode-single")

  //console.log(table.toString());
  return table.toString()
}


function reloadData(checkId: string) {
  state.pingData = []
  state.probeData = []
  state.similarProbes = []
  state.mtrData = []

  probeService.getProbe(checkId).then(res => {
    state.probe = res.data as Probe[]

    // todo fix title - chances are when not using a group,
    // it won't be more than 0, lets hope someone doesn't abuse it
    state.title = state.probe[0].config.target[0].target

    probeService.getSimilarProbes(checkId).then(res => {
      state.similarProbes = res.data as Probe[]
      for (let p of state.similarProbes) {
        probeService.getProbeData(p.id, {recent: false, limit: 5000, startTimestamp: state.timeRange[0], endTimestamp: state.timeRange[1]} as ProbeDataRequest).then(res => {
          for (let d of res.data as ProbeData[]) {
            state.probeData.push(d)

            if (getProbeType(d.probe) == "PING") {
              state.pingData.push(d)
            }
            if (getProbeType(d.probe) == "MTR") {
              state.mtrData.push(d)
            }
          }
        })
      }

      //console.log(state.pingData)
      });

    agentService.getAgent(state.probe[0].agent).then(res => {
      state.agent = res.data as Agent

      siteService.getSite(state.agent.site).then(res => {
        state.site = res.data as Site
        state.ready = true
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


function getProbeType(probeId: string) {
  let foundProbe = state.similarProbes.find(probe => probe.id === probeId);
  return foundProbe ? foundProbe.type : null;
}

// const site = inject("site") as Site

watch(() => state.timeRange, (newTimeRange) => {
  let checkId = router.currentRoute.value.params["probeId"] as string;
  if (checkId) {
    reloadData(checkId);
  }
  state.timeRange = newTimeRange
}, { deep: true });

onMounted(() => {
  let checkId = router.currentRoute.value.params["probeId"] as string
  if (!checkId) return

  state.timeRange = [
      new Date(new Date().getTime() - 3 * 60 * 60 * 1000), // Current time minus 6 hours
      new Date() // Current time
  ]

  //console.log(checkId)

  //reloadData(checkId);
  /*setInterval(() => {
    reloadData(checkId);
  }, 1000 * 15);*/
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
      <div class="d-flex gap-1" v-if="state.ready">
<!--        <router-link :to="`/agent/${state.agent.id}/checks`" active-class="active" class="btn btn-outline-primary"><i
            class="fa-regular fa-pen-to-square"></i>&nbsp;edit checks
        </router-link>
        <router-link :to="`/agents/${state.agent.id}/probes/new`" active-class="active" class="btn btn-primary"><i
            class="fa-solid fa-plus"></i>&nbsp;add check
        </router-link>-->
        <VueDatePicker v-model="state.timeRange" range :partial-range="false" />
      </div>
    </Title>

    <div class="row" v-if="state.ready">
      <div class="col-sm-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">voice graph</h5>
            <p class="card-text">this shows the estimated mos score of your target</p>
          </div>
        </div>
      </div>
      <div class="col-sm-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">latency graph</h5>
            <p class="card-text">this graph displays the overall packet loss, jitter, and latency of the connection to
              the target</p>
            <LatencyGraph v-if="state.ready" :pingResults="transformPingDataMulti(state.pingData)"/>
          </div>
        </div>
      </div>
    </div>
    <hr>
    <div class="row" v-if="state.ready">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">traceroutes</h5>
            <p class="card-text">view the recent trace routes for the selected period of time</p>

            <NetworkMap v-if="state.ready" :pingResults="transformMtrDataMulti(state.mtrData)"/>

            <div id="mtrAccordion" class="accordion">

              <div v-for="mtr in state.mtrData" :key="mtr.id">

                <div class="accordion-item" v-if="getProbeType((mtr as ProbeData).probe) == `MTR` as ProbeType">
                  <h2 :id="'heading' + mtr.id" class="accordion-header">
                    <button :aria-controls="'collapse' + mtr.id" :aria-expanded="false" :data-bs-target="'#collapse' + mtr.id"
                            class="accordion-button collapsed" data-bs-toggle="collapse" type="button">
                      {{ transformMtrData((mtr as ProbeData).data).stopTimestamp }}
                      <span v-if="transformMtrData((mtr as ProbeData).data).triggered" class="badge bg-dark">TRIGGERED</span>
                    </button>

                  </h2>
                  <div :id="'collapse' + mtr.id" :aria-labelledby="'heading' + mtr.id" class="accordion-collapse collapse"
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