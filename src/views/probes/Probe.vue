<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Agent, MtrResult, Probe, ProbeData, ProbeDataRequest, Site} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";
import {AsciiTable3} from "@/lib/ascii-table3/ascii-table3"

const state = reactive({
  target: {} as string,
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  checks: [] as Probe[],
  table: {} as string, // may need to re-work this...
  mtrData: [] as ProbeData[],
  probe: {} as Probe[],
  probeData: [] as ProbeData[],
})

function transformData(data: any[]): MtrResult {
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
  let mtrCalculate = transformData(probeData.data)

  let table = new AsciiTable3(mtrCalculate.report.mtr.dst);
  table.setHeading('Hop', 'Host', 'Loss%', 'Snt', 'Recv', 'Avg', 'Best', 'Worst', 'StDev', 'ASN')
  for(let i = 0; i<mtrCalculate.report.hubs.length; i++){
    let v = mtrCalculate.report.hubs[i]
    table.addRow(i, v.host, v["Loss%"], v.Snt, v.Rcv, v.Avg, v.Best, v.Wrst, v.StDev, v.ASN)
  }
  table.setStyle("unicode-single")

  console.log(table.toString());
  return table.toString()
}

function reloadData(id: string) {
  state.ready = true
}

// const site = inject("site") as Site

onMounted(() => {
  let checkId = router.currentRoute.value.params["probeId"] as string
  if (!checkId) return

console.log(checkId)

  probeService.getProbe(checkId).then(res => {
    state.probe = res.data as Probe[]
    console.log(res.data)

    probeService.getProbeData(checkId, {recent: true} as ProbeDataRequest).then(res => {
      state.probeData = res.data as ProbeData[]

      console.log(state.probeData)

      agentService.getAgent(state.probe[0].agent).then(res => {
        state.agent = res.data as Agent

        siteService.getSite(state.agent.site).then(res => {
          state.site = res.data as Site
          /*siteService.getAgentGroups(state.agent.site).then(res => {
            state.agentGroups = res.data as AgentGroups[]
            state.ready = true

            console.log(state.agentGroups)
          })*/
          state.ready = true

          //state.ready = true
        })
      })
    })
  })

  reloadData(checkId);
  setInterval(() => {
    reloadData(checkId);
  }, 1000 * 15);
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
        :history="[{title: 'sites', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}, {title: state.agent.name, link: `/agents/${state.agent.id}`}]"
        :title="state.target"
        subtitle="information about this target">
      <div class="d-flex gap-1">
        <router-link :to="`/agent/${state.agent.id}/checks`" active-class="active" class="btn btn-outline-primary"><i
            class="fa-regular fa-pen-to-square"></i>&nbsp;edit checks
        </router-link>
        <router-link :to="`/agents/${state.agent.id}/probes/new`" active-class="active" class="btn btn-primary"><i
            class="fa-solid fa-plus"></i>&nbsp;add check
        </router-link>
      </div>
    </Title>

    <div class="row">
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
            <h5 class="card-title">health graph</h5>
            <p class="card-text">this graph displays the overall packet loss, jitter, and latency of the connection to
              the target</p>
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

            <div id="accordionExample" class="accordion">
              <div v-for="mtr in state.probeData" :key="mtr.id" class="accordion-item">
                <h2 :id="'heading' + mtr.id" class="accordion-header">
                  <button :aria-controls="'collapse' + mtr.id" :aria-expanded="false" class="accordion-button collapsed"
                          :data-bs-target="'#collapse' + mtr.id" data-bs-toggle="collapse" type="button">
                    {{ transformData((mtr as ProbeData).data).stopTimestamp }}
                    <span class="badge bg-dark" v-if="transformData((mtr as ProbeData).data).triggered">TRIGGERED</span>
                  </button>

                </h2>
                <div :id="'collapse' + mtr.id" :aria-labelledby="'heading' + mtr.id" class="accordion-collapse collapse"
                     data-bs-parent="#accordionExample">
                  <div class="accordion-body">
                    <pre style="text-align: center">{{ generateTable(mtr as ProbeData) }}</pre>
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