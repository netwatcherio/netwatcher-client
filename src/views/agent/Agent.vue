<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Agent, AgentGroup, NetResult, Probe, ProbeData, Site} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";

interface OrganizedProbe {
  key: string;
  probes: Probe[];
}

let state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  probes: [] as Probe[],
  organizedProbes: [] as OrganizedProbe[],
  agentGroups: [] as AgentGroup[],
  networkInfo: {} as ProbeData
})

function transformNetData(data: any): NetResult {
  return {
    localAddress: data.find((d: any) => d.Key === "local_address").Value || '',
    defaultGateway: data.find((d: any) => d.Key === "default_gateway").Value || '',
    publicAddress: data.find((d: any) => d.Key === "public_address").Value || '',
    internetProvider: data.find((d: any) => d.Key === "internet_provider").Value || '',
    lat: data.find((d: any) => d.Key === "lat").Value || '',
    long: data.find((d: any) => d.Key === "long").Value || '',
    timestamp: new Date(data.find((d: any) => d.Key === "timestamp").Value || Date.now()),
  };
}

function getGroupName(id: string): string {
  // Use the 'find' method to locate the group with the matching ID
  const group = state.agentGroups.find(group => group.id === id);

  // Return the group name if found, otherwise return a default value or empty string
  return group ? group.name : 'Unknown Group';
}

function reloadData(id: string) {
  state.probes = [] as Probe[]
  state.organizedProbes = [] as OrganizedProbe[];


  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent

    probeService.getNetworkInfo(state.agent.id).then(res => {
      state.networkInfo = res.data as ProbeData
      console.log(state.networkInfo)
    })

    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site

      siteService.getAgentGroups(state.agent.site).then(res => {
        state.agentGroups = res.data as AgentGroup[]

        probeService.getAgentProbes(state.agent.id).then(res => {
          state.probes = res.data as Probe[]
          state.ready = true
          console.log("probes ", res.data)

          let organizedProbesMap = new Map<string, Probe[]>();

          for (let probe of state.probes) {
            if (probe.config && probe.config.target) {
              for (let target of probe.config.target) {
                let key = target.target;
                if (target.group && target.group !== "000000000000000000000000") {
                  // Prefix group ID to differentiate
                  key = `group:${target.group}`;
                  // Fetch or determine group information here if necessary
                  // e.g., groupInfoMap.get(target.group) or similar
                }

                if (!organizedProbesMap.has(key)) {
                  organizedProbesMap.set(key, []);
                }
                organizedProbesMap.get(key).push(probe);
              }
            }
          }

          state.organizedProbes = Array.from(organizedProbesMap, ([key, probes]) => ({key, probes}));
        })
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

function getRandomProbeId(list: Probe[]): string | undefined {
  if (list.length === 0) {
    return undefined; // Return undefined if the list is empty
  }

  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex].id; // Return the ID of the randomly selected probe
}


</script>

<template>
  <div v-if="state.ready" class="container-fluid">
    <Title :history="[{title: 'workspaces', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}]" :title="state.agent.name"
           subtitle="information about this agent">
      <div class="d-flex gap-1">
        <router-link :to="`/agent/${state.agent.id}/probes`" active-class="active" class="btn btn-outline-primary"><i
            class="fa-regular fa-pen-to-square"></i>&nbsp;edit probes
        </router-link>
        <router-link :to="`/agents/${state.agent.id}/probes/new`" active-class="active" class="btn btn-primary"><i
            class="fa-solid fa-plus"></i>&nbsp;add probe
        </router-link>
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
              <li class="list-group-item">public address: <code>{{transformNetData(state.networkInfo.data).publicAddress == "" ? "Unknown" : transformNetData(state.networkInfo.data).publicAddress}}</code></li>
              <li class="list-group-item">internet provider: <code>{{transformNetData(state.networkInfo.data).internetProvider == "" ? "Unknown" : transformNetData(state.networkInfo.data).internetProvider}}</code></li>
              <br>
              <li class="list-group-item">local address: <code>{{transformNetData(state.networkInfo.data).localAddress == "" ? "Unknown" : transformNetData(state.networkInfo.data).localAddress}}</code></li>
              <li class="list-group-item">default gateway: <code>{{transformNetData(state.networkInfo.data).defaultGateway == "" ? "Unknown" : transformNetData(state.networkInfo.data).defaultGateway}}</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-sm-5">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">probes</h5>
            <p class="card-text">view the targets for your MTR, PING, and RPERF checks</p>
                <!-- Iterate over organized probes -->
                  <div class="table-responsive">
                    <table class="table">
                      <thead>
                      <tr>
                        <th class="px-0" scope="col">Group / Target</th>
                        <th class="px-0" scope="col">Probe Types</th>
                        <th class="px-0 text-end" scope="col">View</th>
                      </tr>
                      </thead>
                      <tbody>
                      <!-- Iterate over organized probes -->
                      <tr v-for="(organized, index) in state.organizedProbes" :key="index">
                        <td class="px-0">
                          <!-- Display group name or target -->
                          <span class="badge bg-dark" v-if="organized.key.startsWith('group:')">
            {{ getGroupName(organized.key.replace('group:', '')) }}
          </span>
                          <code v-else>
                            {{ organized.key }}
                          </code>
                        </td>
                        <td class="px-0">
                          <!-- Generate badges for each probe type in the group -->
                          <span v-for="probe in organized.probes" :key="probe.id" class="badge bg-secondary me-1">
            {{ probe.type }}
          </span>
                        </td>
                        <td class="px-0 text-end px-3">
                          <!-- Link to view details of the group (adjust as needed) -->
                          <router-link :to="`/probes/${getRandomProbeId(organized.probes)}/view`">
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