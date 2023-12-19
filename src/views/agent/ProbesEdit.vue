<script lang="ts" setup>

import type {AgentGroup, MemberInfo, Probe, Site, SiteMember} from "@/types";
import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import Title from "@/components/Title.vue";
import core from "@/core";
import {Agent} from "@/types";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";

let state = reactive({
  probes: [] as Probe[],
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

      probeService.getAgentProbes(state.agent.id).then(res => {
        if(res.data.length > 0) {
          state.probes = res.data as Probe[]
          state.ready = true
        }

      }).catch(res => {
        alert(res)
      })
    })
  })
})
const router = core.router()

</script>

<template>
  <div class="container-fluid">
    <Title title="edit probes" subtitle="probes associated with current agent" :history="[{title: 'workspaces', link: '/sites'},{title: state.site.name, link: `/sites/${state.site.id}`},{title: state.agent.name, link: `/agents/${state.agent.id}`}]">
<!--
      <router-link :to="`/site/${state.site.id}/invite`" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;invite</router-link>
-->

      <!--      <div class="d-flex gap-1">
          <router-link to="/sites/alerts" active-class="active" class="btn btn-outline-primary"><i class="fa-solid fa-plus"></i>&nbsp;View Alerts</router-link>
          <router-link to="/sites/new" active-class="active" class="btn btn-primary"><i class="fa-solid fa-plus"></i>&nbsp;Create</router-link>
        </div>-->
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
                <th class="px-0" scope="col">type</th>
                <th class="px-0" scope="col">agent / group</th>
                <th class="px-0" scope="col">target</th>
                <th class="px-0" scope="col"> </th>
                <th class="px-0 text-end" scope="col"> </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="group in state.probes">
                <td class="px-0" v-if="group.type == 'SYSINFO' || group.type == 'NETINFO'">
                  <span class="badge" :class="{'bg-dark': group.type == 'SYSINFO' || group.type == 'NETINFO'}">{{group.type}}</span>
                </td>
                <td class="px-0" v-if="group.config.target && (group.type == 'MTR' || group.type == 'PING')">
                  <span class="badge" :class="{'badge bg-info': group.type == 'MTR', 'badge bg-success': group.type == 'PING'}">{{group.type}}</span>
                </td>
                <td class="px-0" v-if="(group.type == 'RPERF' && group.config.server)">
                  <span class="badge bg-primary">RPERF SERVER</span>
                </td>
                <td class="px-0" v-if="(group.type == 'RPERF' && !group.config.server)">
                  <span class="badge bg-warning">RPERF</span>
                </td>

                <td class="px-0">
                  <span v-if="group.config.target && (group.config.target[0].agent != `000000000000000000000000`)" class="badge bg-primary">{{group.config.target[0].agent}}</span>
                  <span v-if="group.config.target && (group.config.target[0].group != `000000000000000000000000`)" class="badge bg-dark">{{group.config.target[0].agent}}</span>
                </td>

                <td class="px-0">
                  <span v-if="group.config.target && (group.config.target[0].target)" class="badge text-dark">{{group.config.target[0].target}}</span>
                </td>

                <td class="px-0 text-end px-3">
                  <router-link v-if="!(group.type == 'SYSINFO' || group.type == 'NETINFO') && !(group.type == 'RPERF' && group.config.server)" :to="`/probes/${group.id}/delete`" class="">
                    <i class="fa-solid fa-up-right-from-square"></i> remove
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
          <h1 class="error-title text-danger">loading...</h1>
          <h3 class="text-error-subtitle">please wait...</h3>
          <!-- <p class="text-muted m-t-30 m-b-30">YOU SEEM TO BE TRYING TO FIND HIS WAY HOME</p>
           <a href="/" class="btn btn-danger btn-rounded waves-effect waves-light m-b-40 text-white">Back to home</a>-->
        </div>
      </div>
    </div>

  </div>
</template>

<style>

</style>