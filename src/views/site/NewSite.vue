<script lang="ts" setup>

import {reactive} from "vue";
import siteService from "@/services/siteService";
import type {Site} from "@/types";
import core from "@/core";

const state = reactive({
  name: ""
})

const router = core.router()

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
  <div class="page-titles">
    <div class="row">
      <div class="col-lg-8 col-md-6 col-12 align-self-center">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 d-flex align-items-center">
            <li class="breadcrumb-item">
              <a class="link" href="/home"><i class="ri-home-3-line fs-5"></i></a>
            </li>
            <li aria-current="page" class="breadcrumb-item active">
              sites
            </li>
            <li aria-current="page" class="breadcrumb-item active">
              new site
            </li>
          </ol>
        </nav>
        <h1 class="mb-0 fw-bold">New Site</h1>
      </div>

      <div class="
                col-lg-4 col-md-6
                d-none d-md-flex
                align-items-center
                justify-content-end
              ">
        <a class="btn btn-info d-flex align-items-center ms-2" href="/site/new">
          <i class="ri-add-line me-1"></i>
          new site
        </a>
      </div>
    </div>
  </div>

  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">new site</h4>
          </div>
          <div class="form-horizontal r-separator border-top">
            <div class="card-body">
              <div class="form-group row align-items-center mb-0">
                <label class="col-3 text-end control-label col-form-label" for="siteName">site name</label>
                <div class="col-9 border-start pb-2 pt-2">
                  <input id="siteName" class="form-control" name="name" v-model="state.name" placeholder="site name here" type="text">
                </div>
              </div>
            </div>
            <div class="p-3 border-top">
              <div class="form-group mb-0 text-end">
                <button class="
                          btn btn-info
                          rounded-pill
                          px-4
                          waves-effect waves-light
                        " type="submit" @click="submit">
                  create
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