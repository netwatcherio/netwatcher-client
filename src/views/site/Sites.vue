<script lang="ts" setup>

import type {Site} from "@/types";
import {reactive} from "vue";

const state = reactive({
  sites: [] as Site[]
})

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
              Sites
            </li>
          </ol>
        </nav>
        <h1 class="mb-0 fw-bold">Sites</h1>
      </div>

      <div class="
                col-lg-4 col-md-6
                d-none d-md-flex
                align-items-center
                justify-content-end
              ">
        <a class="btn btn-info d-flex align-items-center ms-2" href="/sites/new">
          <i class="ri-add-line me-1"></i>
          new site
        </a>
      </div>
    </div>
  </div>

  <div class="container-fluid">

    <div v-if="state.sites" class="row">
      <!-- column -->
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- title -->
            <div class="d-md-flex">
              <div>
                <h4 class="card-title">sites</h4>
                <h5 class="card-subtitle">an overview of the sites you have access to</h5>
              </div>
            </div>
            <!-- title -->
            <div class="table-responsive">
              <div class="table-responsive mt-4">
                <table id="stats" class="
                        table
                        mb-0
                        text-nowrap
                        varient-table
                        align-middle
                        fs-3
                      ">
                  <thead>
                  <tr>
                    <th class="px-0 text-muted" scope="col">name</th>
                    <th class="px-0 text-muted" scope="col">agent count</th>
                    <th class="px-0 text-muted text-end" scope="col">view</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="site in state.sites">
                    <td class="px-0">
                      {{ site.name }}
                    </td>
                    <td class="px-0">
                      <span class="badge bg-dark">{{ site.members.length }}</span>
                    </td>
                    <td class="px-0 text-end">
                      <router-link :to="`/sites/${site.id}`" active-class="selected" class="badge bg-purple">
                        <i class="fa fa-binoculars"></i> view
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
    </div>
    <div v-else class="row">
      <div class="col-lg-12">
        <div class="error-body text-center">
          <h1 class="error-title text-danger">no sites</h1>
          <h3 class="text-error-subtitle">please create or join a new site</h3>
          <!-- <p class="text-muted m-t-30 m-b-30">YOU SEEM TO BE TRYING TO FIND HIS WAY HOME</p>
           <a href="/" class="btn btn-danger btn-rounded waves-effect waves-light m-b-40 text-white">Back to home</a>-->
        </div>
      </div>
    </div>

  </div>
</template>

<style>

</style>