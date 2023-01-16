<script lang="ts" setup>

import NavHeader from "@/components/NavHeader.vue";
import NavSidebar from "@/components/NavSidebar.vue";
import Footer from "@/components/Footer.vue";
import Customize from "@/components/Customize.vue";


</script>

<template>
  <div id="main-wrapper">
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