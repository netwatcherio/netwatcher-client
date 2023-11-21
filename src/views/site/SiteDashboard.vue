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

</script>

<template>

  <div class="container-fluid">
  <Title :title="state.site.name || 'site'" :history="[{title: 'workspaces', link: '/sites'}]">
    <div class="d-flex gap-1">
      <router-link :to="`/sites/${state.site.id}/invite`" active-class="active" class="btn btn-outline-primary"><i class="fa-solid fa-user-plus"></i>&nbsp;invite member</router-link>
      <router-link :to="`/sites/${state.site.id}/groups`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-object-group"></i>&nbsp;agent groups</router-link>
      <router-link :to="`/agents/${state.site.id}/new`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;add agent</router-link>
    </div>
  </Title>
    <div v-if="state.ready" class="card px-3 py-1">
     <div class="table-responsive">
       <table class="table">
         <thead>
         <tr>
           <th class="px-0 text-muted" scope="col">Name</th>
<!--           <th class="px-0 text-muted" scope="col">Location</th>-->
           <th class="px-0 text-muted" scope="col">pin</th>
           <th class="px-0 text-muted" scope="col">secret</th>
           <th class="px-0 text-muted" scope="col">activated</th>
           <th class="px-0 text-muted text-end" scope="col"></th>
         </tr>
         </thead>
         <tbody>
         <tr v-for="agent in state.agents">
           <td class="px-0">
             {{agent.name}}
           </td>
<!--           <td class="px-0">
             {{agent.latitude}}, {{agent.longitude}}
           </td>-->
           <td class="px-0">
             <Code :code="agent.pin"></Code>
           </td>
           <td class="px-0">
             <Code :code="agent.id"></Code>
           </td>
           <td class="px-0 fw-bold text-muted">
             {{agent.initialized?"Yes":"No"}}
           </td>
           <td class="px-0 text-end px-1 d-flex gap-1 justify-content-end">
             <router-link :to="`/agents/${agent.id}`" class="btn btn-primary"><i class="fa-solid fa-gears"></i>&nbsp;view</router-link>
           </td>
         </tr>
         </tbody>
       </table>
     </div>
   </div>
    <div v-else class="card px-3 py-1">
      <div class="d-flex flex-row py-2">
      This site has no agents.
      </div>
    </div>

  </div>
</template>

<style>

</style>