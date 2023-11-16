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
}


const state = reactive({
  sites: [] as Site[],
  agent_counts: [] as AgentCountInfo[],
  ready: false
})

onMounted(() => {
  siteService.getSites().then(res => {
    let data = res.data as Site[]
    if(!data) return
    state.sites = data.map(s => {
      return s
    })
  }).catch(res => {
    alert(res)
  })

  if(state.sites.length > 0) {
    state.ready = true
  }
})

</script>

<template>
  <div class="container-fluid">
    <Title title="sites" subtitle="an overview of the sites you have access to">
      <div class="d-flex gap-1">
      <router-link to="/sites/alerts" active-class="active" class="btn btn-outline-primary"><i class="fa-solid fa-plus"></i>&nbsp;View Alerts</router-link>
      <router-link to="/sites/new" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;Create</router-link>
      </div>
    </Title>
    <div v-if="state.ready" class="row">
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
                  <th class="px-0" scope="col">description</th>
                  <th class="px-0" scope="col">location</th>
                  <th class="px-0" scope="col">members</th>
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
                    {{ site.description }}
                  </td>
                  <td class="px-0">
                    {{ site.location }}
                  </td>
                  <td class="px-0">
                    <span class="badge bg-dark">{{ site.members.length }}</span>
                  </td>
<!--                  <td class="px-0">
                    <span class="badge bg-dark">{{ site. }}</span>
                  </td>-->
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