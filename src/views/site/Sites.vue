<script lang="ts" setup>

import type {Site} from "@/types";
import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import Title from "@/components/Title.vue";

declare interface AgentCountInfo {
  site_id: string;
  count: number;
}

declare interface sitesList {
  sites: Site[];
  agent_counts: AgentCountInfo[];
}


const state = reactive({
  sites: [] as Site[],
  agent_counts: [] as AgentCountInfo[]
})

onMounted(() => {
  siteService.getSites().then(res => {
    let data = res.data as sitesList
    if(!data.sites) return
    state.sites = data.sites.map(s => {
      let target = data.agent_counts.find(a => a.site_id === s.id)
      if (target) s.agents = target.count
      return s
    })
  }).catch(res => {
    alert(res)
  })
})

</script>

<template>
  <div class="container-fluid">
    <Title title="Sites" subtitle="an overview of the sites you have access to">
      <div class="d-flex gap-1">
      <router-link to="/sites/alerts" active-class="active" class="btn btn-outline-primary"><i class="fa-solid fa-plus"></i>&nbsp;View Alerts</router-link>
      <router-link to="/sites/new" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;Create</router-link>
      </div>
    </Title>
    <div v-if="state.sites" class="row">
      <!-- column -->
      <div class="col-12">
        <div class="d-md-flex px-2">
        <span class="card-subtitle text-muted"></span>
      </div>
        <div class="card px-3 py-1">
            <!-- title -->
            <div class="table-responsive">
              <table class="table">
                <thead>
                <tr>
                  <th class="px-0" scope="col">name</th>
                  <th class="px-0" scope="col">members</th>
                  <th class="px-0" scope="col">agent count</th>
                  <th class="px-0 text-end" scope="col">view</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="site in state.sites">
                  <td class="px-0">
                    <router-link :to="`/sites/${site.id}`" class="">
                      {{site.name}}
                    </router-link>

                  </td>
                  <td class="px-0">
                    <span class="badge bg-dark">{{ site.members.length }}</span>
                  </td>
                  <td class="px-0">
                    <span class="badge bg-dark">{{ site.agents }}</span>
                  </td>
                  <td class="px-0 text-end px-3">
                    <router-link :to="`/sites/${site.id}`" class="">
                      <i class="fa-solid fa-up-right-from-square"></i> view
                    </router-link>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

        </div>
      </div>
    </div>
    <div v-else class="row">
      <div class="col-lg-12">
        <div class="error-body text-center">
          <h1 class="error-title text-danger">no sites</h1>
          <h3 class="text-error-subtitle">please create or join a new site</h3>
          <!-- <p class="text-muted m-t-30 m-b-30">YOU SEEM TO BE TRYING TO FIND HIS WAY HOME</p>
           <a href="/" class="btn btn-danger btn-rounded waves-effect waves-light m-b-40 text-white">Back to home</a>-->
        </div>
      </div>
    </div>

  </div>
</template>

<style>

</style>