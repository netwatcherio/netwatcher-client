<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import core from "@/core";
import type {Agent, Site} from "@/types";
import Title from "@/components/Title.vue";
import Loader from "@/components/Loader.vue";
import Code from "@/components/Code.vue";
import agentService from "@/services/agentService";

const state = reactive({
  site: {} as Site,
  agents: [] as Agent[],
  ready: false,
})

let router = core.router()

onMounted(() => {
  let id = router.currentRoute.value.params["siteId"] as string
  if (!id) return

  siteService.getSite(id).then(res => {
    state.site = res.data as Site
    console.log(state)
    agentService.getSiteAgents(id).then(res => {
      //console.log("result", res)
      if(res.data.length > 0) {
        state.agents = res.data as Agent[]
        state.ready = true
      }
    })
  })



})

function getOnlineStatus(agent: Agent) {
    let currentTime = new Date();
    let agentTime = new Date(agent.updatedAt)
    let timeDifference = (currentTime.getTime() - agentTime.getTime()) / 100000; // Convert to minutes
    console.log(timeDifference)
    return timeDifference <= 1;
}

</script>

<template>

  <div class="container-fluid">
  <Title :title="state.site.name || 'site'" :history="[{title: 'workspaces', link: '/sites'}]">
    <div class="d-flex gap-1">
      <router-link :to="`/sites/${state.site.id}/edit`" active-class="active" class="btn btn-outline-dark"><i class="fa-solid fa-pencil-alt"></i>&nbsp;edit</router-link>
      <router-link :to="`/sites/${state.site.id}/members`" active-class="active" class="btn btn-outline-dark"><i class="fa-solid fa-users"></i>&nbsp;members</router-link>
      <router-link :to="`/sites/${state.site.id}/groups`" active-class="active" class="btn btn-outline-primary"><i class="fa-solid fa-object-group"></i>&nbsp;agent groups</router-link>
      <router-link :to="`/agents/${state.site.id}/new`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;create agent</router-link>
    </div>
  </Title>
    <div v-if="state.ready" class="card px-3 py-1">
     <div class="table-responsive">
       <table class="table">
         <thead>
         <tr>
           <th class="px-0 text-muted" scope="col">name</th>
           <th class="px-0 text-muted" scope="col">location</th>
           <th class="px-0 text-muted" scope="col">online (last 1m)</th>
           <th class="px-0 text-muted" scope="col">id / secret</th>
           <th class="px-0 text-muted" scope="col">pin</th>
           <th class="px-0 text-muted" scope="col"></th>
           <th class="px-0 text-muted" scope="col"></th>
           <th class="px-0 text-muted text-end" scope="col"></th>
         </tr>
         </thead>
         <tbody>
         <tr v-for="agent in state.agents">
           <td class="px-0">
             {{agent.name}}
           </td>
           <td class="px-0">
             {{agent.location?agent.location:agent.location}}
           </td>
           <td class="px-0">
             <span class="badge bg-success" v-if="getOnlineStatus(agent)">Online
             </span>
             <span class="badge bg-danger" v-if="!getOnlineStatus(agent)">Offline
             </span>
           </td>
           <td class="px-0">
             <Code :code="agent.initialized?`************************`:agent.id"></Code>
           </td>
           <td class="px-0">
             <!-- todo make this actually work and initialize on backend -->
             <Code :code="agent.initialized?`*********`:agent.pin"></Code>
           </td>
           <td class="px-0 text-end px-1 gap-1 justify-content-end">
             <router-link v-if="agent.initialized" :to="`/agents/${agent.id}/deactivate`" class="btn btn-outline-warning"><i class="fa-solid fa-bed"></i>&nbsp;deactivate</router-link>
           </td>
           <td class="px-0 text-end px-1 gap-1 justify-content-end">
             <router-link :to="`/agents/${agent.id}/edit`" class="btn btn-outline-success"><i class="fa-solid fa-pencil-alt"></i>&nbsp;edit</router-link>
           </td>
           <td class="px-0 text-end px-1 d-flex gap-1 justify-content-end">
             <router-link :to="`/agents/${agent.id}`" class="btn btn-primary"><i class="fa-solid fa-search"></i>&nbsp;view</router-link>
           </td>
         </tr>
         </tbody>
       </table>
     </div>
   </div>
    <div v-else class="card px-3 py-1">
      <div class="d-flex flex-row py-2">
      this workspace has no agents
      </div>
    </div>

  </div>
</template>

<style>

</style>