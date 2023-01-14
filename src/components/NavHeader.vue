<script lang="ts" setup>

</script>

<template>
  <header class="topbar">
    <nav class="navbar top-navbar navbar-expand-md navbar-dark">
      <div class="navbar-header">
        <!-- This is for the sidebar toggle which is visible on mobile only -->
        <a
            class="nav-toggler waves-effect waves-light d-block d-md-none"
            href="javascript:void(0)"
        ><i class="ri-close-line ri-menu-2-line fs-6"></i
        ></a>

        <a class="navbar-brand" href="/home">
          <!-- Logo icon -->
          <b class="logo-icon">
            <!--You can put here icon as well // <i class="wi wi-sunset"></i> //-->
            <!-- Dark Logo icon -->
            <img
                alt="homepage"
                class="dark-logo"
                src="/assets/images/logo-icon.png"
            />
            <!-- Light Logo icon -->
            <img
                alt="homepage"
                class="light-logo"
                src="/assets/images/logo-light-icon.png"
            />
          </b>
          <!--End Logo icon -->
          <!-- Logo text -->
          <span class="logo-text">
               <!-- dark Logo text -->
               <img
                   alt="homepage"
                   class="dark-logo"
                   src="/assets/images/logo-text.png"
               />
            <!-- Light Logo text -->
               <img
                   alt="homepage"
                   class="light-logo"
                   src="/assets/images/logo-light-text.png"
               />
            </span>
        </a>
        <!-- ============================================================== -->
        <!-- End Logo -->
        <!-- ============================================================== -->
        <!-- ============================================================== -->
        <!-- Toggle which is visible on mobile only -->
        <!-- ============================================================== -->
        <a
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            class="topbartoggler d-block d-md-none waves-effect waves-light"
            data-bs-target="#navbarSupportedContent"
            data-bs-toggle="collapse"
            href="javascript:void(0)"
        ><i class="ri-more-line fs-6"></i
        ></a>
      </div>
      <!-- ============================================================== -->
      <!-- End Logo -->
      <!-- ============================================================== -->
      <div id="navbarSupportedContent" class="navbar-collapse collapse">
        <!-- ============================================================== -->
        <!-- toggle and nav items -->
        <!-- ============================================================== -->
        <ul class="navbar-nav me-auto">
          <!-- This is  -->
          <li class="nav-item">
            <a
                class="nav-link sidebartoggler d-none d-md-block"
                href="javascript:void(0)"
            ><i data-feather="menu"></i
            ></a>
          </li>
        </ul>

        <ul class="navbar-nav">

          <li class="nav-item dropdown profile-dropdown">
            <a
                aria-expanded="false"
                aria-haspopup="true"
                class="nav-link dropdown-toggle d-flex align-items-center"
                data-bs-toggle="dropdown"
                href="#"
            >
              <img
                  alt="user"
                  class="profile-pic rounded-circle"
                  src="/assets/images/profile-placeholder.png"
                  width="30"
              />
              <div class="d-none d-md-flex">
                     <span class="ms-2"
                     >Hi,
                     <span class="text-dark fw-bold">FIRST LAST</span></span
                     >
                <span>
                     <i class="feather-sm" data-feather="chevron-down"></i>
                     </span>
              </div>
            </a>
            <div
                class="
                  dropdown-menu dropdown-menu-end
                  mailbox
                  dropdown-menu-animate-up
                  "
            >
              <ul class="list-style-none">
                <li class="p-30 pb-2">
                  <div class="rounded-top d-flex align-items-center">
                    <h3 class="card-title mb-0">profile</h3>
                    <div class="ms-auto">
                      <a class="link py-0" href="javascript:void(0)">
                        <i data-feather="x-circle"></i>
                      </a>
                    </div>
                  </div>
                  <div
                      class="
                           d-flex
                           align-items-center
                           mt-4
                           pt-3
                           pb-4
                           border-bottom
                           "
                  >
                    <img
                        alt="user"
                        class="rounded-circle"
                        src="/assets/images/profile-placeholder.png"
                        width="90"
                    />
                    <div class="ms-4">
                      <h4 class="mb-0">FirstName LastName</h4>
                      <!--<span class="text-muted">User</span>-->
                      <p class="text-muted mb-0 mt-1">
                        <i class="feather-sm me-1" data-feather="mail"></i>
                        EMAIL
                      </p>
                    </div>
                  </div>
                </li>
                <li class="p-30 pt-0">
                  <!--<div class="message-center message-body position-relative" style="height: 210px">
                      <a class="message-item px-2 d-flex align-items-center border-bottom py-3"
                         href="javascript:void(0)">
                <span class="btn btn-light-info btn-rounded-lg text-info">
                <i class="feather-sm fill-white" data-feather="dollar-sign"></i>
                </span>
                          <div class="w-75 d-inline-block v-middle ps-3 ms-1">
                              <h5 class="
                      message-title
                      mb-0
                      mt-1
                      fs-4
                      font-weight-medium">
                                  My Profile
                              </h5>
                              <span class="
                      fs-3
                      text-nowrap
                      d-block
                      time
                      text-truncate
                      fw-normal
                      mt-1
                      text-muted
                      ">Account Settings</span>
                          </div>
                      </a>
                  </div>-->
                  <div class="mt-4">
                    <a class="
                              text-dark
                              fs-3
                              font-weight-medium
                              hover-primary
                              " href="/account/settings">
                      account settings
                    </a>
                    <a class="
                              text-dark
                              fs-3
                              font-weight-medium
                              hover-primary
                              " href="/faq">
                      frequently asked questions
                    </a>
                  </div>
                  <div class="mt-4">
                    <a
                        class="btn btn-info text-white"
                        href="/logout">
                      logout
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<style>

</style>