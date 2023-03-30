<script>
import {defineComponent} from "vue";
import Title from "@/components/Title.vue";

export default defineComponent({
  components: {Title}
})
</script>

<template>

  <div class="container-fluid">
  <Title title="overview"></Title>
    <div class="row">
      <!-- column -->
      <div class="col-12">
        <div class="alert alert-info" role="alert">
          todo: add some sort of overview here
        </div>
        <div class="card">
          <div class="card-body">
            <!-- title -->
            <div class="d-md-flex">
              <div>
                <h4 class="card-title">sites</h4>
<!--                <h5 class="card-subtitle">sites</h5>-->
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