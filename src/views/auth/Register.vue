<script lang="ts" setup>
import {useRouter} from "vue-router";
import {reactive} from "vue";
import {User} from "@/types";
import authService from "@/services/authService";
import core from "@/core";
import Loader from "@/components/Loader.vue";

const router = useRouter()


const state = reactive({
  user: {} as User,
  confirmPassword: "",
  waiting: false,
  error: false,
})

interface Response {
  token: string
  user: User
}

let session = core.session()

function onRegister(response: any) {
  state.waiting = false
  let data = response.data as Response
  session.token = data.token
  session.user = data.user
  console.log(response)
  window.location.href = "/"
}

function onFailure(error: any) {
  state.waiting = false
  state.error = true
  console.log(error)
}
function submit(_: MouseEvent) {
  state.waiting = true
  authService.register(state.user).then(onRegister).catch(onFailure)
}


</script>

<template>
  <div class="d-flex h-100" >
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
      <div class="col-6">
        <div class="card">
          <div class="card-body">
            <h1>register</h1>
            <p class="text-muted fs-4 mb-2">
              already have an account?
              <router-link id="to-register" to="/auth/login">login here</router-link>
            </p>
            <div class="text-danger" v-if="state.error">Something went wrong. Please try again.</div>
            <div v-else>&nbsp;</div>
            <div class="form-horizontal needs-validation mt-2">

              <div class="form-floating mb-3">
                <input id="nw-firstname" v-model="state.user.first_name" class="form-control form-input-bg"
                       name="first_name"
                       placeholder="John" required="" type="text">
                <label for="nw-lastname">first name</label>
                <div class="invalid-feedback">first name is required</div>
              </div>

              <div class="form-floating mb-3">
                <input id="nw-lastname" v-model="state.user.last_name" class="form-control form-input-bg"
                       name="last_name"
                       placeholder="John" required="" type="text">
                <label for="nw-lastname">last name</label>
                <div class="invalid-feedback">last name is required</div>
              </div>

              <div class="form-floating mb-3">
                <input id="nw-remail" v-model="state.user.email" class="form-control form-input-bg" name="email"
                       placeholder="name@example.com" required="" type="email">
                <label for="nw-remail">email</label>
                <div class="invalid-feedback">email is required</div>
              </div>

              <div class="form-floating mb-3">
                <input id="nm-rpassword" v-model="state.user.password" class="form-control form-input-bg"
                       name="rpassword"
                       placeholder="*****" required="" type="password">
                <label for="nm-rpassword">password</label>
                <div class="invalid-feedback">password is required</div>
              </div>
              <div class="form-floating mb-3">
                <input id="nm-rcpassword" v-model="state.confirmPassword" class="form-control form-input-bg"
                       name="rcpassword"
                       placeholder="*****" required="" type="password">
                <label for="nm-rcpassword">password confirmation</label>
                <div class="invalid-feedback">password confirmation is required</div>
              </div>

              <div class="d-flex align-items-center mb-3">
                <div class="ms-auto">
                  <router-link id="to-recover" class="fw-bold" to="/auth/reset">forgot password?</router-link>
                </div>
              </div>
              <div class="d-flex align-items-stretch button-group mt-4 pt-2">
                <button class="btn btn-primary btn-lg px-4" @click="submit" :disabled="state.waiting">
                  register
                  <Loader v-if="state.waiting"></Loader>
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