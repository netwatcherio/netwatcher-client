<script lang="ts" setup>

import core from "@/core";

const persistent = core.persistent()
const router = core.router()

function logout() {
  persistent.token = ""
  router.push("/auth/login")
}

</script>

<template>
  <aside class="left-sidebar">
    <div class="scroll-sidebar">
      <nav class="sidebar-nav">
        <ul id="sidebarnav">
          <li class="sidebar-item">
            <router-link active-class="selected" class="sidebar-item" to="/home">
              <div class="sidebar-link waves-effect waves-dark">Home</div>
            </router-link>
          </li>
          <li class="sidebar-item">
            <router-link active-class="selected" class="sidebar-item" to="/sites">
              <div class="sidebar-link waves-effect waves-dark">Sites</div>
            </router-link>
          </li>
          <li class="nav-small-cap">
            <span class="hide-menu"><b>Sites</b></span>
          </li>
          <li class="sidebar-item"><a aria-expanded="false"
                                      class="sidebar-link waves-effect waves-dark sidebar-link" href="/site/{{.siteId}}"><i
              class="mdi mdi-view-dashboard"></i><span class="hide-menu">dashboard</span></a></li>
          <li class="sidebar-item"><a aria-expanded="false"
                                      class="sidebar-link waves-effect waves-dark sidebar-link" href="/agents/{{.siteId}}"><i
              class="mdi mdi-server"></i><span
              class="hide-menu">agents</span></a></li>
          <li class="sidebar-item"><a aria-expanded="false"
                                      class="sidebar-link waves-effect waves-dark sidebar-link" href="/alerts/{{.siteId}}"><i
              class="mdi mdi-alert-circle"></i><span
              class="hide-menu">alerts</span></a></li>
          <!-- TODO Check if member has correct role and display correct options -->
          <li class="nav-small-line">
            <!--TODO show which site is selected -->
          </li>
          <li class="sidebar-item">
            <a aria-expanded="false" class="sidebar-link has-arrow waves-effect waves-dark"
               href="javascript:void(0)"><span class="hide-menu"><i class="fa fa-cogs"></i> manage</span></a>
            <ul aria-expanded="false" class="collapse first-level">
              <li class="sidebar-item">
                <a class="sidebar-link" href="/site/{{.siteId}}/settings"><i class="fa fa-cog"></i><span
                    class="hide-menu">settings</span></a>
                <a class="sidebar-link" href="/site/{{.siteId}}/members"><i class="fa fa-users"></i><span
                    class="hide-menu">members</span></a>
                <!--<a href="/site/delete/{{.siteId}}" class="sidebar-link">
                        <i class="fa fa-trash"></i><span class="hide-menu text-danger">delete</span></a>-->
              </li>
            </ul>
          </li>
          =
          <li class="nav-devider">
            <!-- <i class="nav-small-line"></i>
             <span class="hide-menu">site</span>-->
            <!--TODO show which site is selected -->
          </li>
          <li class="sidebar-item" @click="logout"><a aria-expanded="false"
                                      class="sidebar-link btn-light waves-effect waves-dark sidebar-link"><i class="mdi mdi-logout"></i><span
              class="hide-menu">logout</span></a></li>
        </ul>
      </nav>
      <!-- End Sidebar navigation -->
    </div>
    <!-- End Sidebar scroll-->
  </aside>
</template>

<style>

</style>