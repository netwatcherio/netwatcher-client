<script lang="ts" setup>
import { onMounted, reactive, toRefs } from "vue";
import siteService from "@/services/siteService";
import agentService from "@/services/agentService";
import type { Site, Agent } from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";

const state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent
});

onMounted(() => {
  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    console.log(state.agent)

    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site
      state.ready = true
    })
  })
});

const router = core.router();
const { currentRoute } = router;

function onError(error: any) {
  alert(error);
}

function submit() {
  if (state.agent.id) {
    agentService.updateAgent(state.agent).then(() => {
      router.push(`/sites/${state.site.id}`);
    }).catch(onError);
  }
}
</script>


<template>
  <div class="container-fluid" v-if="state.ready">
    <Title :title="`edit agent`"
           :subtitle="`update agent details`"
           :history="[{ title: 'workspaces', link: '/sites' }, { title: state.site.name, link: `/sites/${state.site.id}` }]">
    </Title>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="form-horizontal r-separator border-top">
            <div class="card-body">
              <div class="form-group row align-items-center mb-0">
                <label class="col-3 text-end control-label col-form-label" for="agentName">Agent Name</label>
                <div class="col-9 border-start pb-2 pt-2">
                  <input id="agentName" class="form-control" name="name" v-model="state.agent.name" placeholder="Enter agent name" type="text">
                  <br>
                  <input id="agentLocation" class="form-control" name="location" v-model="state.agent.location" placeholder="Enter agent location" type="text">
                </div>
              </div>
            </div>
            <div class="p-3 border-top">
              <div class="form-group mb-0 text-end">
                <button class="btn btn-primary px-4" type="button" @click="submit">
                  update agent
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