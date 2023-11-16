<script lang="ts" setup>

import {inject, onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Site, Agent, Probe} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import Widget from "@/components/Widget.vue";
import probeService from "@/services/probeService";
import {AsciiTable3, AlignmentEnum} from "@/lib/ascii-table3/ascii-table3";

let state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  probes: [] as Probe[],
})

function reloadData(id: string){
  state.probes = [] as Probe[]

  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site

      probeService.getAgentProbes(state.agent.id).then(res => {
        state.probes = res.data as Probe[]
        state.ready = true
        console.log("probes ", res.data)
      })
    })
  })
}


// const site = inject("site") as Site

onMounted(() => {

  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  reloadData(id);
  setInterval(() => {
    reloadData(id);
  }, 1000*15);
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
  <div class="container-fluid" v-if="state.ready">
    <Title :title="state.agent.name" subtitle="information about this agent" :history="[{title: 'sites', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}]">
      <div class="d-flex gap-1">
        <router-link :to="`/agent/${state.agent.id}/probes`" active-class="active" class="btn btn-outline-primary"><i class="fa-regular fa-pen-to-square"></i>&nbsp;edit probes</router-link>
        <router-link :to="`/agents/${state.agent.id}/probes/new`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;add probe</router-link>
      </div>
    </Title>

    <div class="row">
      <div class="col-sm-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">system</h5>
            <p class="card-text">system information of the host the agent is on</p>
            <hr>
            <ul class="list-group">
              <li class="list-group-item">cpu usage: <code>69%</code></li>
              <li class="list-group-item">ram usage: <code>1024MiB</code></li>
              <li class="list-group-item">disk usage: <code>32GiB / 64 GiB</code></li>
              <li class="list-group-item">os: <code>Ubuntu 20.04 Server LTS</code></li>
              <br>
              <li class="list-group-item">last seen: <code>test</code></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card">
          <div class="card-body">

            <h5 class="card-title">network</h5>
            <p class="card-text">network information of the host the agent is on</p>
            <hr>
            <ul class="list-group">
              <li class="list-group-item">internet provider: <code>demo</code></li>
              <li class="list-group-item">default gateway: <code>Default gateway<!--{{state.stats.net_info.default_gateway == "" ? "Unknown" : state.stats.net_info.default_gateway}}--></code></li>
              <li class="list-group-item">local address: <code>Local Address</code></li>
              <li class="list-group-item">public address: <code>Public Address</code></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-sm-5">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">probes</h5>
            <p class="card-text">view the targets for your MTR, PING, and RPERF checks</p>
            <div class="table-responsive">
              <table class="table">
                <thead>
                <tr>
                  <th class="px-0" scope="col">name</th>
                  <th class="px-0" scope="col">group / target</th>
                  <th class="px-0" scope="col">created at</th>
                  <th class="px-0 text-end" scope="col">view</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="group in state.probes">
                  <td class="px-0">
                    <router-link :to="`/sites/${group.id}`" class="">
                      {{group.type}}
                    </router-link>

                  </td>
                  <td class="px-0">
                    <span class="badge bg-dark" v-if="group.type != 'NETINFO' && group.config.target.length > 0 && group.config.target[0].group != `000000000000000000000000`">{{group.config.target[0].group /* change to get the group names as well?? */}}</span>
                    <span v-else v-if="group.type != 'NETINFO'"><code>{{ group.config.target[0].target }}</code></span>
                  </td>
                  <td class="px-0">
                    {{ group.createdAt }}
                  </td>
                  <!--                  <td class="px-0">
                                      <span class="badge bg-dark">{{ site. }}</span>
                                    </td>-->
                  <td class="px-0 text-end px-3">
                    <router-link :to="`/probes/${group.id}/view`" class="">
                      <i class="fa-solid fa-search"></i>
                    </router-link>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
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
<!--                <th scope="row">{{state.stats.speed_test_info.timestamp}}</th>
                <td>{{state.stats.speed_test_info.server}}</td>
                <td>{{state.stats.speed_test_info.host}}</td>
                <td>{{state.stats.speed_test_info.ul_speed}}</td>
                <td>{{state.stats.speed_test_info.dl_speed}}</td>-->
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