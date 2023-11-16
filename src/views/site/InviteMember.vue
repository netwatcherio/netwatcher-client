<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {Site} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";

const state = reactive({
  name: "",
  site: {} as Site
})

const router = core.router()

onMounted(() => {
  let id = router.currentRoute.value.params["siteId"] as string
  if (!id) return

  siteService.getSite(id).then(res => {
    state.site = res.data as Site
  })

})

function onCreate(response: any) {
  router.push("/sites")
}

function onError(response: any) {
  alert(response)
}

function submit() {
  siteService.createSite({
    name: state.name
  } as Site).then(onCreate).catch(onError)
}

</script>

<template>
  <div class="container-fluid">
  <Title title="Invite Member" :subtitle="`Invite a member to the site '${state.site.name}'`" :history="[{title: 'Sites', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}]"></Title>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="form-horizontal">
            <div class="card-body">
              <div class="row">
              <div class="mb-3 col-lg-8 col-12">
                <label for="memberEmail" class="form-label">Email address</label>
                <input type="email" v-model="state" class="form-control" id="memberEmail" aria-describedby="memberEmail" placeholder="example@netwatcher.io">
                <div id="memberEmail" class="form-text">If the email belongs to a user with a netwatcher account, they will be added to the site. If they do not have an account, they will be invited to create one.</div>
              </div>
              <div class="mb-3 col-lg-4 col-12">
                <label for="memberEmail" class="form-label">Member Permissions</label>
                <select class="form-select" aria-label="Default select example">
                  <option value="read-only" selected>Read Only</option>
                  <option value="read-write">Read/Write</option>
                  <option value="admin">Full Access</option>
                </select>
                <div id="memberEmail" class="form-text">Members with full access can permanently change aspects of the site.</div>
              </div>
              </div>
            </div>
            <div class="p-3">
              <div class="form-group mb-0 text-end">
                <button class="
                         btn btn-primary px-4" type="submit" @click="submit">
                  Invite Member
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