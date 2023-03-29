<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Agent, Check, Site, Stats} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";

const state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  checks: [] as Check[],
  stats: {} as Stats
})

function reloadData(id: string) {
  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site
    })
    agentService.getAgentStats(id).then(agent => {
      state.stats = agent.data as Stats
      state.ready = true
    })
    agentService.getChecks(id).then(agent => {
      state.checks = agent.data as Check[]
      state.ready = true
    })
  })
}


// const site = inject("site") as Site

onMounted(() => {

  let id = router.currentRoute.value.params["agentTarget"] as string
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
    <Title :history="[{title: 'sites', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}]" :title="state.agent.name"
           subtitle="information about this agent">
      <div class="d-flex gap-1">
      <router-link :to="`/agent/${state.agent.id}/checks`" active-class="active" class="btn btn-outline-primary"><i
      class="fa-regular fa-pen-to-square"></i>&nbsp;edit checks</router-link>
      <router-link :to="`/agents/${state.agent.id}/checks/new`" active-class="active" class="btn btn-primary"><i
      class="fa-solid fa-plus"></i>&nbsp;add check</router-link>
      </div>
    </Title>

    <div class="row">
      <div class="col-sm-4">
        <div class="card">
          <div class="card-body">

            <h5 class="card-title">general information</h5>
            <hr>
            <ul class="list-group">
              <li class="list-group-item">internet provider:
                <code>{{ state.stats.net_info.internet_provider == "" ? "Unknown" : state.stats.net_info.internet_provider }}</code>
              </li>
              <li class="list-group-item">default gateway:
                <code>{{ state.stats.net_info.default_gateway == "" ? "Unknown" : state.stats.net_info.default_gateway }}</code>
              </li>
              <li class="list-group-item">local address:
                <code>{{ state.stats.net_info.local_address == "" ? "Unknown" : state.stats.net_info.local_address }}</code>
              </li>
              <li class="list-group-item">public address:
                <code>{{ state.stats.net_info.public_address == "" ? "Unknown" : state.stats.net_info.public_address }}</code>
              </li>
              <br>
              <li class="list-group-item">last seen: <code>{{ new Date(state.stats.heartbeat).toString() }}</code></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-sm-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">targets</h5>
            <p class="card-text">view various targets that your checks are running against</p>
            <table class="table">
              <thead>
              <tr>
                <th scope="col">host</th>
                <th scope="col">checks</th>
                <th class="text-end" scope="col">view</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <th scope="row">1.1.1.1</th>
                <td><p>
                  <span class="badge bg-info"> MTR, PING, SPEEDTEST</span>
                </p>
                </td>
                <td class="text-end"><a class="btn btn-primary" href="#"> <span class="fa fa-cog"></span> view</a></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <br>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">speedtest</h5>
            <p class="card-text">view historical speedtests</p>
            <table class="table">
              <thead>
              <tr>
                <th scope="col">timestamp</th>
                <th scope="col">server</th>
                <th scope="col">host</th>
                <th scope="col">upload</th>
                <th scope="col">download</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <th scope="row">{{ state.stats.speed_test_info.timestamp }}</th>
                <td>{{ state.stats.speed_test_info.server }}</td>
                <td>{{ state.stats.speed_test_info.host }}</td>
                <td>{{ state.stats.speed_test_info.ul_speed }}</td>
                <td>{{ state.stats.speed_test_info.dl_speed }}</td>
              </tr>
              </tbody>
            </table>
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