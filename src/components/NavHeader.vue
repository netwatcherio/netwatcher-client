<script lang="ts" setup>

import core from "@/core";
import {User} from "@/types";

const persistent = core.persistent()
const router = core.router()
const session = core.session()

function logout() {
  session.token = ""
  session.user = {} as User
  router.push("/auth/login")
}
</script>

<template>
  <nav class="navbar bg-light">
    <div class="container-fluid">
      <form class="d-flex" role="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
      <div class="d-flex gap-2 align-items-start">
        <div style="width: 28px; height: 28px; background-color: orange; border-radius: 100%;">
        </div>
        <div class="d-flex flex-column gap-0">
          <small class="text-capitalize lh-1">
            {{ session.user.first_name }} {{ session.user.last_name }}
          </small>
          <small class="lh-1 text-muted">Default</small>
        </div>
        <i class="fa-solid fa-caret-down"></i>
      </div>
    </div>
  </nav>
</template>

<style>

</style>