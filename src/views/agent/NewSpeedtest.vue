<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type { AgentGroup, Probe, ProbeConfig, ProbeTarget, ProbeType, SelectOption, Site } from "@/types";
import { Agent } from "@/types";
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
  targetGroup: false,
  agentGroupSelected: [] as AgentGroup[],
  agents: [] as Agent[],
  customServer: false,
  targetAgent: true,
  targetAgentSelected: {} as Agent,
  validAgents: [] as Agent[]
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
  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  state.probeConfig = {
    duration: 60,
    count: 60,
    interval: 5,
    server: false,
  } as ProbeConfig
  state.probeTarget = {
    target: ""
  } as ProbeTarget

  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent
    siteService.getSite(state.agent.site).then(async res => {
      state.site = res.data as Site
      console.log(state.agent)
      agentService.getSiteAgents(state.agent.site).then(res => {
        if (res.data.length > 0) {
          const agents = res.data as Agent[];
          state.ready = true

          for (let i = 0; i < agents.length; i++) {
            if (agents[i].id != id) {
              state.agents.push(agents[i])
            }
          }
        }
        getValidAgents("TRAFFICSIM")
      }).catch(res => {
        alert(res)
      })
    })
  })

  state.options.push({value: "MTR", text: "MTR (My Traceroute)"} as SelectOption)
  state.options.push({value: "PING", text: "PING (Packet Internet Groper)"} as SelectOption)
  state.options.push({value: "TRAFFICSIM", text: "Simulated Traffic (UDP)"} as SelectOption)

  // Initialize filteredOptions
  filteredOptions.value = state.options;

  // Add event listener for clicking outside
  document.addEventListener('click', handleClickOutside);
})

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

async function getValidAgents(probeType: ProbeType){
  let validAgents: Agent[] = [];

  console.log("getting valid agents for probe type: " + probeType + "...");

  for (let agent of state.agents) {
    console.log(state.agents);
    console.log("checking agent: " + agent.id + " for probe type: " + probeType + "...");
    if (agent.id != state.agent.id) {
      try {
        let res = await probeService.getAgentProbes(agent.id);
        let agentProbes = res.data as Probe[];
        for (let probe of agentProbes) {
          console.log(probe);
          if (probe.type === probeType) {
            if (probe.type === "TRAFFICSIM" && probe.config.server) {
              console.log("valid agent: " + agent.id);
              validAgents.push(agent);
            } else if (probe.type !== "TRAFFICSIM") {
              console.log("valid agent: " + agent.id);
              validAgents.push(agent);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching agent probes: ", error);
      }
    }
  }

  state.validAgents = validAgents;
}

function submit() {
  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  if (state.targetGroup && state.agentGroupSelected.length > 0) {
    let tempTargetGroups = [] as ProbeTarget[]
    for (let aa of state.agentGroupSelected) {
      tempTargetGroups.push({group: aa.id} as ProbeTarget)
    }
    state.probeConfig.target = tempTargetGroups
  } else if (state.targetGroup && state.agentGroupSelected.length <= 0) {
    return
  } else if (state.targetAgent && state.targetAgentSelected) {
    state.probeConfig.target = [] as ProbeTarget[]
    state.probeConfig.target.push({agent: state.targetAgentSelected.id} as ProbeTarget)
  } else {
    state.probeConfig.target = [] as ProbeTarget[]
    state.probeConfig.target.push(state.probeTarget)
  }

  if(state.selected.value === 'TRAFFICSIM' && state.targetAgent) {
    if (state.probeConfig.target.length >= 1) {
      state.probeConfig.server = false
    }
  }

  state.probe.config = state.probeConfig
  state.probe.type = state.selected.value as ProbeType

  let send = state.probe

  probeService.createProbe(id, send).then((res) => {
    router.push(`/agents/${id}`)
  }).catch(err => {
    console.log(err)
  })
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
                <div class="mb-3 col-lg-8 col-12">
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
              </div>
            </div>
            <div class="p-3">
              <div class="form-group mb-0 text-end">
                <button class="btn btn-primary px-4" type="submit" @click="submit">
                  Create Probe
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
.dropdown-menu {
  max-height: 200px;
  overflow-y: auto;
}
</style>