<script lang="ts" setup>

import core from "@/core";
import {User} from "@/types";

const persistent = core.persistent()
const router = core.router()
const session = core.session()

function logout() {
  session.token = ""
  session.data = {} as User
  router.push("/auth/login")
}
</script>

<template>
  <nav class="navbar bg-light">
    <div class="container-fluid">
      <form class="d-flex" role="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-primary" type="submit">Search</button>
      </form>
      <div class="d-flex align-items-center gap-3">
          <div>
            <i class="bi bi-moon"></i>
          </div>
        <div>
          <i class="bi bi-bell"></i>
        </div>
        <div class="nav-divider"></div>
        <div class="d-flex gap-1 align-items-center px-1">
          <i class="bi bi-person text-muted" style="font-size: 22px; line-height: 22px"></i>
          <div class="d-flex flex-column gap-0 align-items-center">
            <small class="text-capitalize lh-1">
              {{ session.data.firstName }} {{ session.data.lastName }}
            </small>

          </div>

        </div>
      </div>
    </div>

  </nav>
</template>

<style>

</style>