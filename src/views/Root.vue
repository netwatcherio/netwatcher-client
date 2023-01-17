<script lang="ts" setup>

import NavHeader from "@/components/NavHeader.vue";
import NavSidebar from "@/components/NavSidebar.vue";
import Footer from "@/components/Footer.vue";
import Customize from "@/components/Customize.vue";
import {onMounted, reactive} from "vue";
import core from "@/core";
import {User} from "@/types";

const session = core.session()

const state = reactive({
  loaded: false,
})

onMounted(() => {
  if(session.token === "") {
    document.location.href = "/auth/login"
    return
  }
  state.loaded = true
})

</script>

<template>
  <div v-if="state.loaded" id="main-wrapper">
  <NavHeader></NavHeader>
  <NavSidebar></NavSidebar>
  <div class="page-wrapper">
    <RouterView></RouterView>
    <Footer></Footer>
  </div>
    <Customize></Customize>
  </div>
</template>

<style>

</style>