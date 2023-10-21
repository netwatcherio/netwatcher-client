<script lang="ts" setup>

import {onMounted, reactive, watchEffect} from "vue";
import type {Probe, ProbeType, Site} from "@/types";
import {Agent} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";

interface Option {
  target: boolean,
  duration: boolean,
  rperfServer: boolean,
  count: boolean,
  interval: boolean
  show: boolean
}

const options = new Map<string, Option>([
  ["mtr", {
    target: true,
    duration: false,
    rperfServer: false,
    count: false,
    interval: true,
    show: true,
  } as Option],
  ["rperf", {
    target: true,
    duration: true,
    rperfServer: true,
    count: false,
    interval: false,
    show: true,
  } as Option],
  ["ping", {
    target: true,
    duration: false,
    rperfServer: false,
    count: false,
    interval: false,
    show: true,
  } as Option],
])

const state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  options: {} as Option,
  probe: {
    type: "MTR" as ProbeType,
    config: {
      target: ""
    }
  } as Probe,
})

onMounted(() => {
  state.probe.type = "MTR" as ProbeType
})

const router = core.router()

function onCreate(response: any) {
  router.push("/sites")
}

function onError(response: any) {
  alert(response)
}

watchEffect(() => {
  state.options = options.get(state.probe.type) || {
    target: false,
    duration: false,
    rperfServer: false,
    count: false,
    interval: false,
    show: false,
  } as Option
  return state.probe.type
})

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
                <div class="mb-3 col-lg-5 col-12">
                  <label for="checkType" class="form-label">Check Type</label>
                  <select class="form-select" v-model="state.probe.type" aria-label="Default select example">
                    <option value="mtr" selected>MTR (My Trace Route)</option>
                    <option value="rperf">RPERF (Network Traffic Simulator)</option>
                    <option value="ping">PING (Packet Internet Groper)</option>
                    <option value="speedtest">Speed Test</option>
                    <option value="netinfo">Network Info</option>
                  </select>
                  <div id="memberEmail"
                       class="form-text">The check type determines which operation should be run.</div>
                </div>
              </div>
              <h5 class="border-bottom pb-2" v-if="state.options.show">Options</h5>
              <div class="row">
                <div class="mb-2 col-lg-12 col-12" v-if="state.options.rperfServer">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="state.probe.config.server" value="true" id="flexCheckDefault">
                    <label class="form-check-label" for="flexCheckDefault">
                      Enable rPerf Server
                    </label>
                  </div>
                  <div id="durationLabel" class="form-text">Server will listen on target address and port.</div>
                </div>
                <div class="mb-3 col-lg-6 col-6" v-if="state.options.target">
                  <label for="target" class="form-label">Target</label>
                  <input type="text" v-model="state.probe.config.target" class="form-control" id="target"
                         aria-describedby="target" placeholder="127.0.0.1">
                  <div v-if="state.probe.type === 'MTR'">
                    <div class="form-text">The destination to run the traceroute test on.</div>
                  </div>
                  <div v-else-if="state.probe.type === 'PING'">
                    <div class="form-text">The accessible WAN or LAN device to ping.</div>
                  </div>
                  <div v-else-if="state.probe.type === 'RPERF'">
                    <div v-if="state.probe.config.server" id="target" class="form-text">The address and port the server should listen on.</div>
                    <div v-else id="target" class="form-text">The address and port the client should connect to.</div>
                  </div>

                </div>
                <div class="mb-3 col-lg-6 col-6" v-if="state.options.count">
                  <label for="count" class="form-label">Count</label>
                  <input type="number" min="0" step="1" v-model="state.probe.config.count" class="form-control" id="count"
                         aria-describedby="count" placeholder="0">
                  <div id="countLabel" class="form-text">The desired count</div>
                </div>
                <div class="mb-3 col-lg-6 col-6" v-if="state.options.duration && !state.probe.config.server">
                  <label for="count" class="form-label">Duration</label>
                  <input type="number" min="0" step="1" placeholder="60" v-model="state.probe.config.duration" class="form-control" id="count"
                         aria-describedby="count">
                  <div id="countLabel" class="form-text">The number of seconds the test should be run for.</div>
                </div>
                <div class="mb-3 col-lg-6 col-6" v-if="state.options.interval">
                  <label for="interval" class="form-label">Interval</label>
                  <input type="number" min="0" step="1" v-model="state.probe.config.interval" class="form-control" id="interval"
                         aria-describedby="duration" placeholder="5">
                  <div id="durationLabel" class="form-text">The number of minutes the agent should wait between tests</div>
                </div>


              </div>
            </div>
            <div class="p-3">
              <div class="form-group mb-0 text-end">
                <button class="
                         btn btn-primary px-4" type="submit" @click="submit">
                  Create Check
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