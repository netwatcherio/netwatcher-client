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

    state.ready = true
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
  agentService.createAgent(state.agent).then((res) => {
    router.push(`/sites/${state.site.id}`)
    console.log(res)
  }).catch(err => {
    console.log(err)

  })
}

</script>

<template>
  <div class="container-fluid" v-if="state.ready">
  <Title title="Add Agent" subtitle="create a new agent" :history="[{title: 'Sites', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}]"></Title>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="form-horizontal r-separator border-top">
            <div class="card-body">
              <div class="form-group row align-items-center mb-0">
                <label class="col-3 text-end control-label col-form-label" for="agentName">agent name</label>
                <div class="col-9 border-start pb-2 pt-2">
                  <input id="agentName" class="form-control" name="name" v-model="state.agent.name" placeholder="agent name" type="text">
                </div>
              </div>
              <div class="form-group row align-items-center mb-0">
                <label class="col-3 text-end control-label col-form-label" for="agentLongitude">longitude</label>
                <div class="col-9 border-start pb-2 pt-2">
                  <input id="agentLongitude" class="form-control" name="longitude" v-model="state.agent.longitude" placeholder="-48.876667" type="number" min="-180" max="180" step="0.001">
                </div>
              </div>
              <div class="form-group row align-items-center mb-0">
                <label class="col-3 text-end control-label col-form-label" for="agentLatitude">latitude</label>
                <div class="col-9 border-start pb-2 pt-2">
                  <input id="agentLatitude" class="form-control" name="latitude" v-model="state.agent.latitude" placeholder="-123.393333" type="number" min="-180" max="180" step="0.001">
                </div>
              </div>
            </div>
            <div class="p-3 border-top">
              <div class="form-group mb-0 text-end">
                <button class="
                          btn btn-primary px-4" type="submit" @click="submit">
                  Create Site
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