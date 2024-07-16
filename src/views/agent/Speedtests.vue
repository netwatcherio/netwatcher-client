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
  RPerfResults, SelectOption,
  Site, SpeedTestPLoss, SpeedTestResult, SpeedTestServer, SpeedTestTestDuration, TrafficSimResult
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
import TrafficSimGraph from "@/components/TrafficSimGraph.vue";

const state = reactive({
  target: {} as string,
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  checks: [] as Probe[],
  probe: {} as Probe,
  probeData: [] as ProbeData[],
  title: {} as string,
  probeAgent: {} as Agent,
  speedtestProbe: {} as Probe,
  speedtestData: [] as SpeedTestResult[],
  speedtestServerProbe: {} as Probe
})
function camelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function convertToSpeedTestResult(data: any): SpeedTestResult {
  console.log(data)

  const result: SpeedTestResult = {
    test_data: [],
    timestamp: new Date(data.createdAt)
  };

  // Find the 'data' array in the input
  const dataArray = data;
  if (!dataArray || !Array.isArray(dataArray)) {
    throw new Error("Invalid data structure");
  }

  // Find the 'testdata' item in the data array
  const testDataItem = dataArray.find(item => item.Key === "testdata");
  if (!testDataItem || !Array.isArray(testDataItem.Value)) {
    throw new Error("Invalid testdata structure");
  }

  // Convert each server data
  testDataItem.Value.forEach((serverData: any[]) => {
    const server = convertToSpeedTestServer(serverData);
    result.test_data.push(server);
  });

  // Find and set the timestamp
  const timestampItem = dataArray.find(item => item.Key === "timestamp");
  if (timestampItem && timestampItem.Value) {
    result.timestamp = new Date(timestampItem.Value);
  }

  console.log(result)

  return result;
}

function convertToSpeedTestServer(data: Array<{ Key: string; Value: any }>): SpeedTestServer {
  const result: Partial<SpeedTestServer> = {};

  for (const item of data) {
    switch (item.Key) {
      case 'url':
      case 'lat':
      case 'lon':
      case 'name':
      case 'country':
      case 'sponsor':
      case 'id':
      case 'host':
        result[item.Key] = item.Value as string;
        break;
      case 'distance':
      case 'latency':
      case 'max_latency':
      case 'min_latency':
      case 'jitter':
      case 'dl_speed':
      case 'ul_speed':
        result[item.Key] = Number(item.Value);
        break;
      case 'test_duration':
        result.test_duration = convertTestDuration(item.Value);
        break;
      case 'packet_loss':
        result.packet_loss = convertPacketLoss(item.Value);
        break;
    }
  }

  return result as SpeedTestServer;
}

function convertTestDuration(data: Array<{ Key: string; Value: number }>): SpeedTestTestDuration {
  const result: SpeedTestTestDuration = {};
  for (const item of data) {
    result[item.Key as keyof SpeedTestTestDuration] = Number(item.Value);
  }
  return result;
}

function convertPacketLoss(data: Array<{ Key: string; Value: number }>): SpeedTestPLoss {
  const result: SpeedTestPLoss = { sent: 0, dup: 0, max: 0 };
  for (const item of data) {
    result[item.Key as keyof SpeedTestPLoss] = Number(item.Value);
  }
  return result;
}

function generateTable(speedTestResult: any) {
  if (speedTestResult.test_data.length === 0) {
    return "No speed test data available.";
  }

  const server = speedTestResult.test_data[0];
  const displayText = `${server.sponsor} (${server.name}, ${server.country}) - ${server.distance}km`;

  console.log(server)

  let table = new AsciiTable3(displayText + " - " + speedTestResult.timestamp.toISOString());
  table.setHeading('Metric', 'Value', 'Unit');

  table.addRow('Download Speed', (server.dl_speed / 1000000).toFixed(2), 'Mbps');
  table.addRow('Upload Speed', (server.ul_speed / 1000000).toFixed(2), 'Mbps');
  table.addRow('Latency', (server.latency / 1000000).toFixed(2), 'ms');
  table.addRow('Jitter', (server.jitter / 1000000).toFixed(2), 'ms');

  if (server.packet_loss) {
    table.addRow('Packet Loss', server.packet_loss.sent, 'packets');
  }

  if (server.test_duration) {
    if (server.test_duration.download) {
      table.addRow('Download Test Duration', (server.test_duration.download / 1000000000).toFixed(2), 's');
    }
    if (server.test_duration.upload) {
      table.addRow('Upload Test Duration', (server.test_duration.upload / 1000000000).toFixed(2), 's');
    }
    if (server.test_duration.total) {
      table.addRow('Total Test Duration', (server.test_duration.total / 1000000000).toFixed(2), 's');
    }
  }

  table.setStyle("unicode-single");

  return table.toString();
}
onMounted(() => {
  let checkId = router.currentRoute.value.params["agentId"] as string
  if (!checkId) return

  agentService.getAgent(checkId).then(res => {
    state.agent = res.data as Agent

    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site
    })

    probeService.getAgentProbes(state.agent.id).then( res => {
      let probes = res.data as Probe[]
      for(let item in probes){
        if(probes[item].type == "SPEEDTEST"){
          state.speedtestProbe = probes[item]
          let req = {limit: 25, recent: true} as ProbeDataRequest
          probeService.getProbeData(state.speedtestProbe.id, req).then(res => {
            for(let i in res.data as ProbeData[]){
              console.log(res.data[i])
              let convD = convertToSpeedTestResult(res.data[i].data)
              console.log(convD)
              state.speedtestData.push(convD)
            }
            state.ready = true
          })

          state.title = "Speedtests"
          continue
        }else if(probes[item].type == "SPEEDTEST_SERVERS"){
          state.speedtestServerProbe = probes[item]
        }
      }
    })
  })

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
        <router-link :to="`/agent/${state.speedtestServerProbe.id}/speedtest/new`" active-class="active" class="btn btn-primary"><i
            class="fa-solid fa-arrows-turn-to-dots"></i> run speedtest
        </router-link>
      </div>
    </Title>

    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">speedtests</h5>
            <p class="card-text">last 25 speedtests</p>

            <div v-if="!state.ready && state.speedtestData.length <= 0">
              <!--        <div class="px-2 py-2 pb-1 ">
                        <div class="label-c4 label-o2 label-w500">Loading...</div>
                      </div>-->
              <div class="error-body text-center">
                <h1 class="error-title text-warning">Loading...</h1>
                <h3 class="text-error-subtitle">please wait for data to load</h3>
              </div>

            </div>
            <div v-else-if="state.ready && state.speedtestData.length <= 0">
              <div class="error-body text-center">
                <h1 class="error-title text-danger">no data</h1>
                <h3 class="text-error-subtitle">please run a speedtest</h3>
              </div>
            </div>
            <div v-else>
              <div id="mtrAccordion" class="accordion">

                <div v-for="mtr in state.speedtestData" :key="state.speedtestProbe.id + mtr.timestamp.getTime()">

                  <div class="accordion-item">
                    <h2 :id="'heading' + state.speedtestProbe.id + mtr.timestamp.getTime()" class="accordion-header">
                      <button :aria-controls="'collapse' + state.speedtestProbe.id + mtr.timestamp.getTime()"
                              :aria-expanded="false"
                              :data-bs-target="'#collapse' + state.speedtestProbe.id + mtr.timestamp.getTime()"
                              class="accordion-button collapsed d-flex align-items-center"
                              data-bs-toggle="collapse"
                              type="button">

  <span class="me-3">
    <i class="fa-regular fa-clock me-2"></i>
    <b>{{mtr.timestamp}}</b>
  </span>
                        <span>
    {{mtr.test_data[0].sponsor}} ({{mtr.test_data[0].country}}, {{mtr.test_data[0].name}}) - ({{mtr.test_data[0].distance}}km)
  </span>
                      </button>
                    </h2>
                    <div :id="'collapse' + state.speedtestProbe.id + mtr.timestamp.getTime()" :aria-labelledby="'heading' + state.probe.id + mtr.timestamp"
                         class="accordion-collapse collapse"
                         data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <pre style="text-align: center">{{ generateTable(mtr) }}</pre>
                      </div>
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