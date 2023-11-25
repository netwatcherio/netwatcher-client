<script lang="ts" setup>
import {reactive} from "vue";
import authService from "@/services/authService";
import type {User} from "@/types"
import core from "@/core";
import Loader from "@/components/Loader.vue";

const state = reactive({
  user: {} as User,
  began: 0 as number,
  waiting: false,
  error: false
})

interface Response {
  token: string
  data: User
}

let session = core.session()

function onLogin(response: any) {
  done()
  let data = response.data as Response
  session.token = data.token
  session.data = data.data
  window.location.href = "/"
}

function onFailure(error: any) {

  done()
  state.error = true
  console.log(error)
}

function begin() {
  state.waiting = true
  state.began = Date.now().valueOf()
}

function done() {
  if (state.waiting) {
    let delta = Date.now().valueOf() - state.began
    let minTimeout = 1000
    setTimeout(() => {
      state.waiting = false
      state.began = 0
    }, Math.max(minTimeout - delta, 0))
  }
}

function submit(_: MouseEvent) {
  begin()
  // Attempt to log in with the provided credentials
  authService.authLogin(state.user).then(onLogin).catch(onFailure)
}

</script>

<template>
  <div class="d-flex h-100">
    <div class="col-lg-3 col-xl-3 bg-primary on-sidebar" style="height: 100vh;">
      <div class="h-100 d-flex align-items-center justify-content-center">
        <div class="row justify-content-center text-center">
          <div class="col-md-7 col-lg-12 col-xl-9">
            <div>
              <span class="db"><img alt="logo" src="/assets/images/logo-light-icon.png"></span>
              <span class="db"><img alt="logo" src="/assets/images/logo-light-text.png"></span>
            </div>
            <h2 class="text-white mt-4 fw-light">
              <span class="font-weight-medium">Network Monitoring</span> made easy
            </h2>
            <p class="op-5 text-white fs-4 mt-4">
              A simple network performance monitoring platform designed for MSPs
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="
            col-lg-8
            d-flex
            align-items-center
            justify-content-center
          ">
      <div class="col-5">

        <div class="card">
          <div class="card-body d-flex flex-column gap-1">
            <div class="d-flex align-items-end justify-content-between gap-1">
              <div class="d-flex gap-2">
              <div class="label-title">Login</div>
              </div>
              <span class="label-subtext mb-1">
              Need an account?
              <router-link id="to-register" to="/auth/register">register</router-link>
            </span>
            </div>
            <div class="form-horizontal needs-validation mt-2">
              <div class="form-floating mb-2">
                <input id="tb-email" v-model="state.user.email" class="form-control form-input-bg" name="email"
                       placeholder="name@example.com" required="" type="email">
                <label for="tb-email">Email</label>
                <div class="invalid-feedback">email is required</div>
              </div>

              <div class="form-floating mb-2">
                <input id="current-password" v-model="state.user.password" class="form-control form-input-bg"
                       name="password"
                       placeholder="*****" required="" type="password">
                <label for="current-password">Password</label>
                <div class="invalid-feedback">password is required</div>
              </div>

              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <router-link id="to-recover" class="label-c4 label-w600 label-underlined px-1" to="/auth/reset">forgot password?</router-link>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <div class="d-flex align-items-center justify-content-center">
                    <Loader v-if="state.waiting" inverse large></Loader>
                  </div>
                  <button class="btn btn-primary btn-lg px-4 d-flex align-items-center gap-1" @click="submit"
                          :disabled="state.waiting">

                    login
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
        <div class="" style="height: 4rem">
          <div class="mt-2 " v-if="state.error"
               :class="`${state.waiting?'error-message-pending':'error-message-animation message-body '}`">
            <div class="text-danger" v-if="!state.waiting">Incorrect Email/Password combination. Please try again.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 0.8rem;
}

.card-body {

  padding: 0.8rem;
}

.error-message-pending {
  animation: animate-pending 100ms forwards ease-out;

}

@keyframes animate-pending {
  0% {
    filter: saturate(90%) blur(1px);
    height: 100%;
  }

  100% {
    filter: saturate(50%) blur(8px);
    opacity: 0;
    height: 0%;
  }
}

.message-body {

  margin-bottom: 0.375rem;
  background-color: rgba(255, 64, 64, 0.3);
  border: 1px solid rgba(255, 64, 64, 1);
  width: 100%;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  border-radius: 0.8rem;
}

.error-message-animation {
  animation: animate-expand-vertical 250ms forwards ease-out;
}

@keyframes animate-expand-vertical {
  0% {
    scale: 0.95;
    opacity: 0.8;
    filter: blur(2px);
  }
  50% {

  }
  100% {
    scale: 1;
    opacity: 1;
    filter: blur(0px);
  }
}

.btn-primary.btn-lg {
  border-radius: 0.375rem !important;

}


</style>