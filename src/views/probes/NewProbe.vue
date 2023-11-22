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
  probeConfig: {} as ProbeConfig,
  probeTarget: {} as ProbeTarget,
  targetGroup: false,
  agentGroupSelected: [] as AgentGroup[],
  agentGroups: [] as AgentGroup[],
  customRperfServer: false,
})

onMounted(() => {
  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  state.probeConfig = {
    duration: 60,
    count: 60,
    interval: 5,
    server: false,
  } as ProbeConfig
  state.probeTarget = {
    target: ""
  } as ProbeTarget

  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site
      console.log(state.agent)
      siteService.getAgentGroups(state.agent.site).then(res => {
        state.agentGroups = res.data as AgentGroups[]
        state.ready = true

        console.log(state.agentGroups)
      })
    })
  })

  state.options.push({value: "MTR", text: "MTR"} as SelectOption)
  state.options.push({value: "PING", text: "PING (Packet Internet Groper)"} as SelectOption)
  //state.options.push({value: "SPEEDTEST", text: "Speed Test"} as SelectOption)
  state.options.push({value: "RPERF", text: "RPERF"} as SelectOption)
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

  // build probetarget for if groups are enabled for specific types


  if(state.targetGroup && state.agentGroupSelected.length > 0) {
    // for the selected groups, build a probe with them as the targets
    let tempTargetGroups = [] as ProbeTarget[]
    for(let aa of state.agentGroupSelected) {
      tempTargetGroups.push({group: aa.id} as ProbeTarget)
    }
    state.probeConfig.target = tempTargetGroups
  }else if(state.targetGroup && state.agentGroupSelected.length <= 0){
    return
  }else{
    // load default/populated target
    state.probeConfig.target = [] as ProbeTarget[]
    state.probeConfig.target.push(state.probeTarget)
  }


  // set probe config as the config
  state.probe.config = state.probeConfig

  // update type of the probe
  state.probe.type = state.selected.value as ProbeType

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
    <Title title="Create Probe" :subtitle="`create a probe for an agent '${state.site.name}'`" :history="[{title: 'workspaces', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}, {title: state.agent.name, link: `/agents/${state.agent.id}`}]"></Title>
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
                    <select v-model="state.agentGroupSelected" class="form-select" id="agentGroupOptions">
                      <option v-for="group in state.agentGroups" :value="group" :key="group.name">
                        {{ group.name + " (" + group.description + ")" }}
                      </option>
                    </select>
                    <div class="mt-3">
                      Selected:
                      <strong>{{ state.agentGroupSelected }}</strong>
                    </div>
                  </div>
                </div>
                  <div v-if="state.selected.value === 'RPERF'">
                    <!-- Fields specific to MTR -->
                    <div class="mb-3" v-if="state.probeConfig.server">
                      <label for="rperfTarget" class="form-label">Port Listening <code>(eg. 0.0.0.0:666)</code></label>
                      <input type="text" id="rperfTarget" v-model="state.probeTarget.target" class="form-control">
                    </div>
                    <div class="mb-3" v-if="!state.targetGroup && state.customRperfServer">
                      <label for="rperfTarget" class="form-label">Target <code>(eg. 1.1.1.1:666)</code></label>
                      <input type="text" id="rperfTarget" v-model="state.probeTarget.target" class="form-control">
                    </div>
                    <div class="mb-3" v-if="state.customRperfServer || state.targetGroup">
                      <label for="mtrInterval" class="form-label">Interval (minutes)</label>
                      <input type="number" id="mtrTarget" v-model="state.probeConfig.interval" class="form-control">
                    </div>
                    <div class="mb-3" v-if="!state.probeConfig.server && !state.targetGroup">
                      <label class="form-label">Custom Target</label>
                      <div class="form-check">
                        <input type="checkbox" id="customRperfServer" value="Enable" v-model="state.customRperfServer" class="form-check-input">
                        <label for="customRperfServer" class="form-check-label">Enable</label>
                      </div>
                    </div>
                      <div class="mb-3" v-if="!state.customRperfServer && !state.targetGroup">
                      <label class="form-label">Enable Server (MUST NOT ALREADY HAVE SERVER FOR AGENT #todo)</label>
                      <div class="form-check">
                        <input type="checkbox" id="useRperfServer" value="Enable" v-model="state.probeConfig.server" class="form-check-input">
                        <label for="useRperfServer" class="form-check-label">Enable</label>
                      </div>
                  </div>
                  </div>

                  <!-- PING Options -->
                  <div v-if="state.selected.value === 'PING'">
                    <!-- Fields specific to PING -->
                    <div class="mb-3" v-if="!state.targetGroup">
                      <label for="pingTarget" class="form-label">Target <code>(eg. 1.1.1.1)</code></label>
                      <input type="text" id="pingTarget" v-model="state.probeTarget.target" class="form-control">
                    </div>
<!--                    <div class="mb-3">
                      <label for="pingInterval" class="form-label">Interval (minutes)</label>
                      <input type="number" id="pingInterval" v-model="state.probeConfig.interval" class="form-control">
                    </div>-->
                    <div class="mb-3">
                      <label for="pingDuration" class="form-label">Duration (seconds)</label>
                      <input type="number" id="pingDuration" v-model="state.probeConfig.duration" class="form-control">
                    </div>
                  </div>

                  <!-- SPEEDTEST Options -->
                  <div v-if="state.selected.value === 'SPEEDTEST'">
                    <!-- Fields specific to SPEEDTEST -->
                  </div>

                  <!-- RPERF Options -->
                  <div v-if="state.selected.value === 'MTR'">
                    <!-- Fields specific to RPERF -->
                    <div class="mb-3" v-if="!state.targetGroup">
                      <label for="mtrTarget" class="form-label">Target <code>(eg. 1.1.1.1)</code></label>
                      <input type="text" id="pingTarget" v-model="state.probeTarget.target" class="form-control">
                    </div>
                    <div class="mb-3">
                      <label for="mtrInterval" class="form-label">Interval (minutes)</label>
                      <input type="number" id="mtrInterval" v-model="state.probeConfig.interval" class="form-control">
                    </div>
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