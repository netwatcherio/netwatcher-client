<script lang="ts" setup>

import NavHeader from "@/components/NavHeader.vue";
import NavSidebar from "@/components/NavSidebar.vue";
import Footer from "@/components/Footer.vue";
import {useRouter} from "vue-router";
import core from "@/core";

const router = useRouter()
let persistent = core.persistent()
</script>

<template>
  <div v-if="persistent.token!==''" id="main-wrapper" data-boxed-layout="full" data-header-position="absolute"
       data-layout="vertical"
       data-navbarbg="skin5" data-sidebar-position="absolute" data-sidebartype="full">
    <NavHeader></NavHeader>
    <NavSidebar></NavSidebar>
    <div class="page-wrapper">
      <RouterView></RouterView>
      <Footer></Footer>
    </div>
  </div>
  <div v-else>
    <div class="page-wrapper">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<style>

</style>
