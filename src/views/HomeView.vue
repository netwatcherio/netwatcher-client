<script lang="ts" setup></script>

<template>
  <div class="page-titles">
    <div class="row">
      <div class="col-lg-8 col-md-6 col-12 align-self-center">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 d-flex align-items-center">
            <li class="breadcrumb-item">
              <a class="link" href="/home"><i class="ri-home-3-line fs-5"></i></a>
            </li>
            <li aria-current="page" class="breadcrumb-item active">
              Home
            </li>
          </ol>
        </nav>
        <h1 class="mb-0 fw-bold">Overview</h1>
      </div>
    </div>
  </div>

  <div class="container-fluid">
    <div class="row">
      <!-- column -->
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- title -->
            <div class="d-md-flex">
              <div>
                <h4 class="card-title">Sites</h4>
                <h5 class="card-subtitle">Overview of Sites</h5>
              </div>
            </div>
            <!-- title -->
            <div class="table-responsive">
              <table class="table mb-0 table-hover align-middle text-nowrap">
                <thead>
                <tr>
                  <!--TODO make custom icons for this or something to indicate wether it's online or not-->
                  <th class="border-top-0">Status</th>
                  <th class="border-top-0">Name</th>
                  <th class="border-top-0">Location</th>
                  <th class="border-top-0">ISP</th>
                  <th class="border-top-0">Type</th>
                  <th class="border-top-0">Last Seen</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>
                    <label class="badge bg-success">Online</label>
                  </td>
                  <td>TOPS</td>
                  <td>Kelowna, BC</td>
                  <td>Telus</td>
                  <td>MacOS - Dev</td>
                  <td>
                    <label class="badge bg-info">13s ago</label>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>