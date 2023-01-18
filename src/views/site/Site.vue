<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import core from "@/core";
import type {Site} from "@/types";
import Title from "@/components/Title.vue";

const state = reactive({
  site: {} as Site
})

let router = core.router()

onMounted(() => {
  let id = router.currentRoute.value.params["siteId"] as string
  if (!id) return

  siteService.getSite(id).then(res => {
    state.site = res.data as Site
  })
})

</script>

<template>

  <Title :title="state.site.name" :history="[{title: 'Sites', link: '/sites'}]"></Title>
  <div class="container-fluid">

    <div class="row" v-if="state.site">
      <div class="col-lg-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="mb-0">agent overview</h4>
          </div>
          <div class="card-body img-responsive">
            <div>
              <div style="display: flex; justify-content: center;" id="my_dataviz"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row" v-else>
      <div class="col-lg-12">
        <div class="error-body text-center">
          <h1 class="error-title text-danger">no data</h1>
          <h3 class="text-error-subtitle">please create a new agent and install it</h3>
          <!-- <p class="text-muted m-t-30 m-b-30">YOU SEEM TO BE TRYING TO FIND HIS WAY HOME</p>
           <a href="/" class="btn btn-danger btn-rounded waves-effect waves-light m-b-40 text-white">Back to home</a>-->
        </div>
      </div>
    </div>
    <div class="row" v-else>
      <div class="col-lg-12">
        <div class="error-body text-center">
          <h1 class="error-title text-danger">no data</h1>
          <h3 class="text-error-subtitle">please create a new agent and install it</h3>
          <!-- <p class="text-muted m-t-30 m-b-30">YOU SEEM TO BE TRYING TO FIND HIS WAY HOME</p>
           <a href="/" class="btn btn-danger btn-rounded waves-effect waves-light m-b-40 text-white">Back to home</a>-->
        </div>
      </div>
    </div>

  </div>
</template>

<style>

</style>