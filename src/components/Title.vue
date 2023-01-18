<script lang="ts" setup>

import core from "@/core";

const props = defineProps<{
  title: string,
  history: any[],
}>()

const router = core.router()

</script>

<template>
  <div class="page-titles">
    <div class="row">
      <div class="col-lg-8 col-md-6 col-12 align-self-center">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 d-flex align-items-center">
            <li class="breadcrumb-item">
              <router-link to="/" class="link"><i class="ri-home-3-line fs-5"></i></router-link>
            </li>
            <li v-if="history" v-for="page in props.history" class="breadcrumb-item active" aria-current="page">
              <router-link :to="page.link" class="link">{{ page.title }}</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ props.title }}
            </li>
          </ol>
        </nav>
        <h1 class="mb-0 fw-bold">{{ props.title }}</h1>
      </div>
    </div>
  </div>
</template>

<style>

</style>