<script lang="ts" setup>

import {onMounted, reactive, watchEffect} from "vue";
import type {AgentGroup, Probe, ProbeConfig, ProbeTarget, ProbeType, SelectOption, Site} from "@/types";
import {Agent} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";
import siteService from "@/services/siteService";
import AgentGroups from "@/views/site/AgentGroups.vue";

let state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  selected: {} as SelectOption,
  options: [] as SelectOption[],
  probe: {} as Probe,
  probeTarget: {} as ProbeTarget,
  targetGroup: false,
  agentGroup: [] as AgentGroup[],
  agentGroups: [] as AgentGroup[]
})

onMounted(() => {
  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  state.probe.config = {} as ProbeConfig
  state.probeTarget = {} as ProbeTarget

  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    console.log(state.agent)
    siteService.getAgentGroups(state.agent.site).then(res => {
      state.agentGroups = res.data as AgentGroups[]
      state.ready = true

      console.log(state.agentGroups)
    })
  })

  state.options.push({value: "MTR", text: "My Trace Route"} as SelectOption)
  state.options.push({value: "PING", text: "Packet Internet Groper"} as SelectOption)
  state.options.push({value: "SPEEDTEST", text: "Speed Test"} as SelectOption)
  state.options.push({value: "RPERF", text: "REPERF"} as SelectOption)
})

const router = core.router()

function onCreate(response: any) {
  router.push("/sites")
}

function onError(response: any) {
  alert(response)
}

function submit() {

  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  let send = state.probe

  probeService.createProbe(id, send).then((res) => {
    router.push(`/agents/${id}`)
  }).catch(err => {
    console.log(err)

  })
}


// Target: 10.0111
//
</script>

<template>
  <div class="container-fluid">
    <Title title="Add Check" subtitle="Add a new check to the agent"
           :history="[{title: 'Sites', link: '/sites'}]"></Title>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="form-horizontal">
            <div class="card-body">
              <div class="row">
                <div class="mb-3 col-lg-8 col-12">
                  <label for="agentOptions" class="form-label">Probe Types</label>
                  <select v-model="state.selected" class="form-select">
                    <option v-for="option in state.options" :value="option">
                      {{ option.text}}
                    </option>
                  </select>
                  </div>
                <div class="mb-1 col-lg-4 col-8">
                  <br>
                  <div v-if="state.selected.value === 'MTR' || 'PING' || 'RPERF' && state.agentGroups.length > 0">
                    <label class="form-label">Use Agent Groups</label>
                    <div class="form-check">
                      <input type="checkbox" id="useAgentGroups" value="Enable" v-model="state.targetGroup" class="form-check-input">
                      <label for="useAgentGroups" class="form-check-label">Enable</label>
                    </div>
                  </div>
<!--                  <div class="mt-3">Selected: <strong>{{ state.selected }}</strong></div>-->
                </div>
              </div>
              <br>
              <div class="row">
              <div v-if="state.selected && state.selected.value">
                  <h5 class="border-bottom pb-2">Options</h5>
                  <!-- MTR Options -->
                <div v-if="state.targetGroup">
                  <div class="mb-3 col-lg-8 col-12">
                    <label for="agentGroupOptions" class="form-label">Available Agent Groups</label>
                    <select v-model="state.agentGroup" class="form-select" multiple id="agentGroupOptions">
                      <option v-for="group in state.agentGroups" :value="group" :key="group.name">
                        {{ group.name }}
                      </option>
                    </select>
                    <div class="mt-3">
                      Selected:
                      <strong>{{ state.agentGroup }}</strong>
                    </div>
                  </div>
                </div>
                  <div v-if="state.selected.value === 'MTR'">
                    <!-- Fields specific to MTR -->
                    <div class="mb-3">
                      <label for="mtrTarget" class="form-label">Target</label>
                      <input type="text" id="mtrTarget" v-model="state.probe.config.target" class="form-control">
                    </div>
                  </div>

                  <!-- PING Options -->
                  <div v-if="state.selected.value === 'PING'">
                    <!-- Fields specific to PING -->
                  </div>

                  <!-- SPEEDTEST Options -->
                  <div v-if="state.selected.value === 'SPEEDTEST'">
                    <!-- Fields specific to SPEEDTEST -->
                  </div>

                  <!-- RPERF Options -->
                  <div v-if="state.selected.value === 'RPERF'">
                    <!-- Fields specific to RPERF -->
                  </div>
                </div>
              </div>
            </div>
            <div class="p-3">
              <div class="form-group mb-0 text-end">
                <button class="
                         btn btn-primary px-4" type="submit" @click="submit">
                  Create Probe
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>