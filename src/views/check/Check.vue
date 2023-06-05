<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Agent, Check, Site, Stats} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import Chart from "@/components/Chart.vue";

const state = reactive({
  target: {} as string,
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  checks: [] as Check[],
  stats: {} as Stats
})

function reloadData(id: string) {
  agentService.getCheck(id).then(res => {
    // get agent and site from check id, then get
    // stats and checks that match the target id
    console.log("got check ", res)

    state.target = res.data.target

    agentService.getAgent(res.data.agent).then(res => {
      state.agent = res.data as Agent
      siteService.getSite(state.agent.site).then(res => {
        state.site = res.data as Site
      })
      agentService.getAgentStats(state.agent.id).then(stats => {
        state.stats = stats.data as Stats
      })
      agentService.getChecks(state.agent.id).then(checks => {
        for(let check of checks.data as Check[]) {
          console.log(check.target + state.target)
          if (state.target == null) {
            if (check.target == null) {
              continue
            }else{
              state.checks.push(check)
            }
            continue
          }
          if (check.target == state.target) {
            state.checks.push(check)
          }
        }

        state.ready = true
      })
    })
  })
}


// const site = inject("site") as Site

onMounted(() => {

  console.log("mounted " + router.currentRoute.value.params["checkId"])

  let id = router.currentRoute.value.params["checkId"] as string
  if (!id) return

  reloadData(id);
  setInterval(() => {
    reloadData(id);
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
    <Title :history="[{title: 'sites', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}, {title: state.agent.name, link: `/agents/${state.agent.id}`}]" :title="state.target"
           subtitle="information about this target">
      <div class="d-flex gap-1">
<!--      <router-link :to="`/agent/${state.agent.id}/checks`" active-class="active" class="btn btn-outline-primary"><i
      class="fa-regular fa-pen-to-square"></i>&nbsp;edit checks</router-link>
      <router-link :to="`/agents/${state.agent.id}/checks/new`" active-class="active" class="btn btn-primary"><i
      class="fa-solid fa-plus"></i>&nbsp;add check</router-link>-->
      </div>
    </Title>

    <div class="row">
      <div class="col-sm-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">voice graph</h5>
            <Chart></Chart>
            <p class="card-text">this shows the estimated mos score of your target</p>
          </div>
        </div>
      </div>
      <div class="col-sm-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">health graph</h5>
            <Chart></Chart>
            <p class="card-text">this graph displays the overall packet loss, jitter, and latency of the connection to the target</p>
          </div>
        </div>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">traceroutes</h5>
            <p class="card-text">view the recent trace routes for the selected period of time</p>

            <div class="accordion" id="traceroutes">
              <div class="accordion-item">
                <h2 class="accordion-header" id="headingOne">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    timestamp now yay yay
                  </button>
                </h2>
                <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                  <div class="accordion-body">
                    <pre>{{table}}}</pre>
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