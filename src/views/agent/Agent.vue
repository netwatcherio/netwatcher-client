<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Site} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import {Agent} from "@/types";
import agentService from "@/services/agentService";

const state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent
})


onMounted(() => {

  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site
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
      <router-link :to="`/checks/new`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;Add Check</router-link>
      </div>
    </Title>
    <div class="check-grid">
    <div class="card px-3 py-1" v-for="a in Array(12).keys()">
      {{a}}
    </div>
    </div>
  </div>
</template>

<style>
.check-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 0.5rem;
  height: 22rem;
}
</style>