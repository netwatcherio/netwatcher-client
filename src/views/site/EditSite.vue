<script lang="ts" setup>
import { onMounted, reactive } from "vue";
import siteService from "@/services/siteService";
import type { Site } from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";

const router = core.router();
const state = reactive({
  site: {} as Site,
  ready: false
});

// Extract the siteId from the route parameters
const siteId = router.currentRoute.value.params.siteId as string;

onMounted(() => {
  if (!siteId) return;

  siteService.getSite(siteId).then(res => {
    state.site = res.data as Site
    console.log(state.site)
    state.ready = true
  })
});

function onError(error: any) {
  alert(error);
}

function submit() {
  if (state.site.id) {
    // Call the updateSite method from the siteService
    siteService.updateSite(state.site).then(() => {
      router.push(`/sites/${state.site.id}`);
    }).catch(onError);
  }
}
</script>

<template>
  <div class="container-fluid" v-if="state.ready">
    <Title title="Edit Site"
           subtitle="update site details"
           :history="[{ title: 'workspaces', link: '/sites' }, { title: state.site.name, link: `/sites/${state.site.id}` }]">
    </Title>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="form-horizontal r-separator border-top">
            <div class="card-body">
              <div class="form-group row align-items-center mb-0">
                <label class="col-3 text-end control-label col-form-label" for="siteName">Site Name</label>
                <div class="col-9 border-start pb-2 pt-2">
                  <input id="siteName" class="form-control" name="name" v-model="state.site.name" placeholder="Enter site name" type="text">
                  <br>
                  <input id="siteDesc" class="form-control" name="desc" v-model="state.site.description" placeholder="Enter site description" type="text">
                  <br>
                  <input id="siteLocation" class="form-control" name="location" v-model="state.site.location" placeholder="Enter site location" type="text">
                </div>
              </div>
            </div>
            <div class="p-3 border-top">
              <div class="form-group mb-0 text-end">
                <button class="btn btn-primary px-4" type="button" @click="submit">
                  Update Site
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
