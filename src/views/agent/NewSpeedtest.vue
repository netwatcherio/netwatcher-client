<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type {
  Agent,
  AgentGroup,
  Probe,
  ProbeConfig, ProbeData, ProbeDataRequest,
  ProbeTarget,
  ProbeType,
  SelectOption,
  Site, SpeedTestPLoss,
  SpeedTestServer, SpeedTestTestDuration
} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";
import siteService from "@/services/siteService";

let state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  selected: {} as SelectOption,
  options: [] as SelectOption[],
  probe: {} as Probe,
  probeConfig: {} as ProbeConfig,
  probeTarget: {} as ProbeTarget,
  speedTestServers: {} as SpeedTestServer[],
  customServerEnable: {} as boolean,
  customServer: {} as String
})

// New refs for the searchable dropdown
const searchQuery = ref('');
const filteredOptions = ref<SelectOption[]>([]);
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Function to filter options based on search query
function filterOptions() {
  if (searchQuery.value === '') {
    filteredOptions.value = state.options;
  } else {
    filteredOptions.value = state.options.filter(option =>
        option.text.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
}

// Watch for changes in the search query
watch(searchQuery, filterOptions);

// Function to select an option
function selectOption(option: SelectOption) {
  state.selected = option;
  searchQuery.value = option.text;
  isDropdownOpen.value = false;
}

// Function to handle clicking outside the dropdown
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
    if (!state.selected.value) {
      searchQuery.value = '';
    }
  }
}

const router = core.router()

onMounted(() => {
  let id = router.currentRoute.value.params["probeId"] as string
  if (!id) return

  probeService.getProbe(id).then(res => {
    let pps = res.data as Probe[]
    state.probe = pps[0]

    agentService.getAgent(pps[0].agent).then(res => {
      state.agent = res.data as Agent

      siteService.getSite(state.agent.site).then(res => {
        state.site = res.data as Site
      })

            let req = {limit: 1, recent: true} as ProbeDataRequest
              probeService.getProbeData(state.probe.id, req).then(res => {
                let probeData = res.data as ProbeData[]

                for(let item in probeData[0].data){
                  let srv = convertToSpeedTestServer(probeData[0].data[item])

                  let displayText = srv.distance + "km - " + srv.sponsor + " (" + srv.name + ", " + srv.country + ") "

                  state.options.push({value: srv.id, text: displayText} as SelectOption)
                }
                state.ready = true
              })
          })
        })

  state.customServerEnable = false
  state.customServer = ""

  // Initialize filteredOptions
  filteredOptions.value = state.options;

  // Add event listener for clicking outside
  document.addEventListener('click', handleClickOutside);
})

function convertToSpeedTestServer(data: Array<{ Key: string; Value: any }>): SpeedTestServer {
  const result: Partial<SpeedTestServer> = {};

  for (const item of data) {
    switch (item.Key) {
      case 'url':
      case 'lat':
      case 'lon':
      case 'name':
      case 'country':
      case 'sponsor':
      case 'id':
      case 'host':
        result[item.Key] = item.Value as string;
        break;
      case 'distance':
      case 'latency':
      case 'max_latency':
      case 'min_latency':
      case 'jitter':
      case 'dl_speed':
      case 'ul_speed':
        result[item.Key] = Number(item.Value);
        break;
      case 'test_duration':
        result.test_duration = convertTestDuration(item.Value);
        break;
      case 'packet_loss':
        result.packet_loss = convertPacketLoss(item.Value);
        break;
    }
  }

  return result as SpeedTestServer;
}

function convertTestDuration(data: Array<{ Key: string; Value: number | null }>): SpeedTestTestDuration {
  const result: SpeedTestTestDuration = {};
  for (const item of data) {
    result[item.Key as keyof SpeedTestTestDuration] = item.Value !== null ? Number(item.Value) : undefined;
  }
  return result;
}

function convertPacketLoss(data: Array<{ Key: string; Value: number }>): SpeedTestPLoss {
  const result: SpeedTestPLoss = { sent: 0, dup: 0, max: 0 };
  for (const item of data) {
    result[item.Key as keyof SpeedTestPLoss] = Number(item.Value);
  }
  return result;
}

// Remove event listener on component unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})

function onCreate(response: any) {
  router.push("/sites")
}

function onError(response: any) {
  alert(response)
}

function submit() {

  // todo do not create probe, update id??

}
</script>

<template>
  <div class="container-fluid">
    <Title
        :history="[{title: 'workspaces', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}, {title: state.agent.name, link: `/agents/${state.agent.id}`}]"
        :subtitle="`start a speedtest on '${state.site.name}'`"
        title="new speedtest"></Title>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="form-horizontal">
            <div class="card-body">
              <div class="row">
                <div class="mb-3 col-lg-8 col-12" v-if="!state.customServerEnable">
                  <label class="form-label" for="agentOptions">Server Selection</label>
                  <div class="dropdown" ref="dropdownRef">
                    <input
                        type="text"
                        class="form-control"
                        v-model="searchQuery"
                        @focus="isDropdownOpen = true"
                        placeholder="Search for a server..."
                    >
                    <ul class="dropdown-menu w-100" :class="{ show: isDropdownOpen }">
                      <li v-for="option in filteredOptions" :key="option.value">
                        <a class="dropdown-item" href="#" @click.prevent="selectOption(option)">
                          {{ option.text }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="col-9 border-start pb-2 pt-2">
                    <label class="form-label">Custom Server</label>
                    <div class="form-check">
                      <input id="customServerEnable" v-model="state.customServerEnable" class="form-check-input"
                             type="checkbox"
                             value="Enable">
                      <label class="form-check-label" for="customServerEnable">Enable</label>
                    </div>
                  <hr v-if="state.customServerEnable">
                  <input v-if="state.customServerEnable" id="serverID" class="form-control" name="name" v-model="state.customServer" placeholder="Server ID (SpeedTest.net)" type="text"></div>
              </div>
              </div>
            </div>
            <div class="p-3">
              <div class="form-group mb-0 text-end">
                <button class="btn btn-primary px-4" type="submit" @click="submit">
                  Run SpeedTest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<style>
.dropdown-menu {
  max-height: 200px;
  overflow-y: auto;
}
</style>