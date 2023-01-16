<script lang="ts" setup>
import {useRouter} from "vue-router";
import {reactive} from "vue";
import {User} from "@/types";
import authService from "@/services/authService";

const router = useRouter()


const state = reactive({
  user: {} as User,
  confirmPassword: "",
  waiting: false
})

function submit(_: MouseEvent) {
  state.waiting = true
  authService.register(state.user).then(res => {
    console.log(res)
    state.waiting = false
  }).catch(err => {
    state.waiting = false
    console.log(err)
  })
}


</script>

<template>
  <div class="row auth-wrapper gx-0">
    <div class="col-lg-4 col-xl-3 bg-primary auth-box-2 on-sidebar">
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
            col-lg-8 col-xl-9
            d-flex
            align-items-center
            justify-content-center">
      <div class="row justify-content-center w-100 mt-4 mt-lg-0">
        <div class="col-lg-6 col-xl-3 col-md-7">
          <div class="card">
            <div class="card-body">
              <h2>Sign Up Form</h2>
              <p class="text-muted fs-4">
                Enter given details for new account
              </p>
              <form class="form-horizontal mt-4 pt-4 needs-validation" novalidate="">
                <div class="form-floating mb-3">
                  <input id="nw-firstname" v-model="state.user.first_name" class="form-control form-input-bg" name="first_name" placeholder="john deo"
                         required="" type="text">
                  <label for="nw-firstname">First Name</label>
                  <div class="invalid-feedback">First name is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="nw-lastname" v-model="state.user.last_name" class="form-control form-input-bg" name="last_name" placeholder="john deo"
                         required="" type="text">
                  <label for="nw-lastname">Last Name</label>
                  <div class="invalid-feedback">Last name is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="nw-remail" v-model="state.user.email" class="form-control form-input-bg" name="email" placeholder="john@gmail.com"
                         required="" type="email">
                  <label for="nw-remail">Email</label>
                  <div class="invalid-feedback">Email is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="text-rpassword" v-model="state.user.password" class="form-control form-input-bg" name="password" placeholder="*****"
                         required="" type="password">
                  <label for="text-rpassword">Password</label>
                  <div class="invalid-feedback">Password is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="nw-rcpassword" v-model="state.confirmPassword" class="form-control form-input-bg" name="password_confirm" placeholder="*****"
                         required="" type="password">
                  <label for="nw-rcpassword">Confirm Password</label>
                  <div class="invalid-feedback">Password is required</div>
                </div>
                <div class="form-check mb-4 pb-2">
                  <input id="r-me" class="form-check-input" required="" type="checkbox" value="">
                  <label class="form-check-label" for="r-me">
                    Remember me
                  </label>
                  <div class="invalid-feedback">
                    You must agree before submitting.
                  </div>
                </div>
                <div class="d-flex align-items-stretch button-group">
                  <button class="btn btn-primary btn-lg px-4" type="submit" @click="submit">
                    Submit
                  </button>
                  <a id="to-login2" class="
                          btn btn-lg btn-light-secondary
                          text-secondary
                          font-weight-medium
                        " >Cancel</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>