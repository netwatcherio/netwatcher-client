<script lang="ts" setup>
import {useRouter} from "vue-router";

const router = useRouter()
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
            justify-content-center
          ">
      <div class="row justify-content-center w-100 mt-4 mt-lg-0">
        <div class="col-lg-6 col-xl-3 col-md-7">
          <div class="card">
            <div class="card-body">
              <h2>Sign Up Form</h2>
              <p class="text-muted fs-4">
                Enter given details for new account
              </p>
              <form action="/auth/register" class="form-horizontal mt-4 pt-4 needs-validation" method="post"
                    novalidate="">
                <div class="form-floating mb-3">
                  <input id="tb-firstname" class="form-control form-input-bg" name="first_name" placeholder="john deo"
                         required="" type="text">
                  <label for="tb-firstname">First Name</label>
                  <div class="invalid-feedback">First name is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="tb-lastname" class="form-control form-input-bg" name="last_name" placeholder="john deo"
                         required="" type="text">
                  <label for="tb-lastname">Last Name</label>
                  <div class="invalid-feedback">Last name is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="tb-remail" class="form-control form-input-bg" name="email" placeholder="john@gmail.com"
                         required="" type="email">
                  <label for="tb-remail">Email</label>
                  <div class="invalid-feedback">Email is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="text-rpassword" class="form-control form-input-bg" name="password" placeholder="*****"
                         required="" type="password">
                  <label for="text-rpassword">Password</label>
                  <div class="invalid-feedback">Password is required</div>
                </div>
                <div class="form-floating mb-3">
                  <input id="text-rcpassword" class="form-control form-input-bg" name="password_confirm" placeholder="*****"
                         required="" type="password">
                  <label for="text-rcpassword">Confirm Password</label>
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
                  <button class="btn btn-primary btn-lg px-4" type="submit">
                    Submit
                  </button>
                  <a id="to-login2" class="
                          btn btn-lg btn-light-secondary
                          text-secondary
                          font-weight-medium
                        " href="javascript:void(0)">Cancel</a>
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