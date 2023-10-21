<script lang="ts" setup>

import {inject, onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Site, Agent, Stats, Check, Target} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import Widget from "@/components/Widget.vue";

const state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  checks: [] as Check[],
  stats: {} as Stats,
  targets: [] as Target[],
})

function reloadData(id: string){
  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site
    })
    /*agentService.getAgentStats(id).then(agent => {
      state.stats = agent.data as Stats
    })*/

    /*agentService.getChecks(id).then(cs => {
      console.log("got checks", cs.data)

      // get checks and calculate targets based on the checks
      state.checks = cs.data as Check[]
      for (let check of cs.data as Check[]) {
        if (check.type == "PING" || check.type == "MTR" || check.type == "RPERF") {
          if (check.type == "RPERF" && check.server) {
            return // skip rperf checks that are server checks
          }

          let target = state.targets.find(t => t.target == check.target)
          if (!target) {
            console.log("creating new target", check.target)
            target = {
              target: check.target,
              checks: []
            }
            console.log("target", target)
            state.targets.push(target)
          }
          // check to see if the target already contains the check
          if (target.checks.find(c => c.id == check.id)) {
            console.log("target already contains check", check)
            continue
          }
          console.log("adding check to target", check)
          target.checks.push(check)
        }
      }
    })*/
    console.log("targets", state.targets)

    state.ready = true
  })

  // get checks and group them in a list of targets based on if they have matching ips, and are either
  // ping, mtr, or rperf (rperf and ping are combined to get an average "voice score" when monitoring a site.)
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
        <router-link :to="`/agent/${state.agent.id}/checks`" active-class="active" class="btn btn-outline-primary"><i class="fa-regular fa-pen-to-square"></i>&nbsp;edit checks</router-link>
        <router-link :to="`/agents/${state.agent.id}/checks/new`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;add check</router-link>
      </div>
    </Title>

    <div class="row">
      <div class="col-sm-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">system *TODO*</h5>
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
<!--              <li class="list-group-item">default gateway: <code>{{state.stats.net_info.default_gateway == "" ? "Unknown" : state.stats.net_info.default_gateway}}</code></li>
              <li class="list-group-item">local address: <code>{{state.stats.net_info.local_address == "" ? "Unknown" : state.stats.net_info.local_address}}</code></li>
              <li class="list-group-item">public address: <code>{{state.stats.net_info.public_address == "" ? "Unknown" : state.stats.net_info.public_address}}</code></li>-->
            </ul>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">targets</h5>
            <p class="card-text">view the targets for your MTR, PING, and RPERF checks</p>
            <table class="table">
              <thead>
              <tr>
                <th scope="col">host</th>
                <th scope="col">checks</th>
                <th class="text-end" scope="col">view</th>
              </tr>
              </thead>
              <tbody>
              <template v-for="t in state.targets">
<!--                <tr>
                <th scope="row">{{t.target}}</th>
                <td><span class="badge bg-info" v-for="c in t.checks"> {{c.type}}</span></td>
                <td class="text-end">
                  <router-link :to="`/checks/${t.checks[0].id}`" class="btn btn-primary"><i class="fa-solid fa-gears"></i>&nbsp;view</router-link>
                </td>
                </tr>-->
              </template>
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