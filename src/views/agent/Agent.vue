<script lang="ts" setup>

import {inject, onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Site, Agent, Stats, Check} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import Widget from "@/components/Widget.vue";

const state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  checks: [] as Check[],
  stats: {} as Stats
})


// const site = inject("site") as Site

onMounted(() => {

  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

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
    <Title :title="state.agent.name" subtitle="Information about this agent" :history="[{title: 'Sites', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}]">
      <div class="d-flex gap-1">
        <router-link :to="`/checks/new`" active-class="active" class="btn btn-outline-primary"><i class="fa-regular fa-pen-to-square"></i>&nbsp;Update</router-link>
        <router-link :to="`/agents/${state.agent.id}/checks/new`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;Add Check</router-link>
      </div>
    </Title>

    <div class="check-grid">
      <div v-for="check in state.checks" class="card">
        <div >
          {{ check.type }}
        </div>
      </div>
    </div>
<!--      <Widget title="Speed Test" subtext="100 MPS / 200 GBH" desc="AAH" style="grid-column: 1 / span 4" ></Widget>-->
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