<script lang="ts" setup>
import { onMounted, reactive, computed, watch } from "vue";
import type { AgentGroup, Probe, ProbeConfig, ProbeTarget, ProbeType, SelectOption, Site } from "@/types";
import { Agent } from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";
import siteService from "@/services/siteService";

interface ProbeState {
  site: Site;
  ready: boolean;
  loading: boolean;
  agent: Agent;
  selected: SelectOption;
  options: SelectOption[];
  probe: Probe;
  probeConfig: ProbeConfig;
  probeTarget: ProbeTarget;
  targetGroup: boolean;
  agentGroupSelected: AgentGroup[];
  agents: Agent[];
  customServer: boolean;
  targetAgent: boolean;
  targetAgentSelected: Agent | null;
  validAgents: Agent[];
  existingProbes: Probe[];
  duplicateWarning: string;
  errors: string[];
}

const state = reactive<ProbeState>({
  site: {} as Site,
  ready: false,
  loading: false,
  agent: {} as Agent,
  selected: {} as SelectOption,
  options: [],
  probe: {} as Probe,
  probeConfig: {} as ProbeConfig,
  probeTarget: {} as ProbeTarget,
  targetGroup: false,
  agentGroupSelected: [],
  agents: [],
  customServer: false,
  targetAgent: true,
  targetAgentSelected: null,
  validAgents: [],
  existingProbes: [],
  duplicateWarning: "",
  errors: []
});

const router = core.router();

// Computed properties
const showTargetAgentOption = computed(() => {
  const validTypes = ['MTR', 'PING', 'RPERF', 'TRAFFICSIM', 'AGENT'];
  return state.selected.value && validTypes.includes(state.selected.value) && state.agents.length >= 1;
});

const showTargetInput = computed(() => {
  return !state.targetGroup && !state.targetAgent;
});

const isValidProbe = computed(() => {
  if (!state.selected.value) return false;

  if (state.targetAgent && !state.targetAgentSelected) return false;

  if (state.targetGroup && state.agentGroupSelected.length === 0) return false;

  if (!state.targetAgent && !state.targetGroup) {
    if (!state.probeConfig.server && !state.probeTarget.target) return false;
  }

  return state.duplicateWarning === "";
});

// Initialize component
onMounted(async () => {
  const id = router.currentRoute.value.params["idParam"] as string;
  if (!id) return;

  state.probeConfig = {
    duration: 60,
    count: 60,
    interval: 5,
    server: false,
  } as ProbeConfig;

  state.probeTarget = {
    target: ""
  } as ProbeTarget;

  try {
    // Load agent data
    const agentRes = await agentService.getAgent(id);
    state.agent = agentRes.data as Agent;

    // Load existing probes for duplicate checking
    const probesRes = await probeService.getAgentProbes(id);
    state.existingProbes = probesRes.data as Probe[];

    // Load site data
    const siteRes = await siteService.getSite(state.agent.site);
    state.site = siteRes.data as Site;

    // Load all agents for the site
    const agentsRes = await agentService.getSiteAgents(state.agent.site);
    if (agentsRes.data.length > 0) {
      const agents = agentsRes.data as Agent[];
      state.agents = agents.filter(a => a.id !== id);
      state.ready = true;
    }

    // Initialize probe type options
    initializeOptions();

  } catch (error) {
    console.error("Error loading data:", error);
    state.errors.push("Failed to load agent data");
  }
});

// Initialize probe type options
function initializeOptions() {
  state.options = [
    { value: "MTR", text: "MTR (My Traceroute)" },
    { value: "PING", text: "PING (Packet Internet Groper)" },
    { value: "TRAFFICSIM", text: "Simulated Traffic (UDP)" },
    { value: "AGENT", text: "Agent Monitoring" },
    // { value: "SPEEDTEST", text: "Speed Test" },
    // { value: "RPERF", text: "RPERF (UDP)" }
  ];
}

// Watch for probe type changes
watch(() => state.selected.value, async (newType) => {
  if (newType === 'TRAFFICSIM') {
    await getValidAgents('TRAFFICSIM');
  } else if (newType === 'AGENT') {
    // For AGENT type, all other agents are valid targets
    state.validAgents = state.agents;
  }

  // Reset target selection when changing probe type
  state.targetAgentSelected = null;
  state.duplicateWarning = "";

  // Check for duplicates when type changes
  if (state.targetAgent && state.targetAgentSelected) {
    checkForDuplicates();
  }
});

// Watch for target changes to check duplicates
watch([
  () => state.targetAgentSelected,
  () => state.probeTarget.target,
  () => state.probeConfig.server
], () => {
  checkForDuplicates();
});

// Check for duplicate probes
function checkForDuplicates() {
  state.duplicateWarning = "";

  if (!state.selected.value) return;

  const probeType = state.selected.value as ProbeType;

  for (const existingProbe of state.existingProbes) {
    if (existingProbe.type !== probeType) continue;

    // Check server probes
    if (state.probeConfig.server && existingProbe.config.server) {
      if (probeType === 'TRAFFICSIM' || probeType === 'RPERF') {
        state.duplicateWarning = `A ${probeType} server probe already exists for this agent`;
        return;
      }
    }

    // Check target-based probes
    if (state.targetAgent && state.targetAgentSelected) {
      const existingTargets = existingProbe.config.target || [];
      for (const target of existingTargets) {
        if (target.agent === state.targetAgentSelected.id) {
          state.duplicateWarning = `A ${probeType} probe already exists for target agent: ${state.targetAgentSelected.name}`;
          return;
        }
      }
    }

    // Check custom target probes
    if (!state.targetAgent && !state.targetGroup && state.probeTarget.target) {
      const existingTargets = existingProbe.config.target || [];
      for (const target of existingTargets) {
        if (target.target === state.probeTarget.target) {
          state.duplicateWarning = `A ${probeType} probe already exists for target: ${state.probeTarget.target}`;
          return;
        }
      }
    }
  }
}

// Get valid agents for specific probe types
async function getValidAgents(probeType: ProbeType) {
  const validAgents: Agent[] = [];
  state.loading = true;

  console.log(`Getting valid agents for probe type: ${probeType}...`);

  try {
    for (const agent of state.agents) {
      if (agent.id === state.agent.id) continue;

      try {
        const res = await probeService.getAgentProbes(agent.id);
        const agentProbes = res.data as Probe[];

        // For TRAFFICSIM, only agents with server enabled are valid
        if (probeType === "TRAFFICSIM") {
          const hasTrafficSimServer = agentProbes.some(
              probe => probe.type === "TRAFFICSIM" && probe.config.server
          );
          if (hasTrafficSimServer) {
            validAgents.push(agent);
          }
        }
      } catch (error) {
        console.error(`Error fetching probes for agent ${agent.id}:`, error);
      }
    }
  } finally {
    state.loading = false;
  }

  state.validAgents = validAgents;
  console.log(`Found ${validAgents.length} valid agents for ${probeType}`);
}

// Create probe
async function submit() {
  state.errors = [];

  if (!isValidProbe.value) {
    state.errors.push("Please fill in all required fields");
    return;
  }

  const id = router.currentRoute.value.params["idParam"] as string;
  if (!id) return;

  state.loading = true;

  try {
    // Build probe targets
    if (state.targetGroup && state.agentGroupSelected.length > 0) {
      // Group targets
      state.probeConfig.target = state.agentGroupSelected.map(
          group => ({ group: group.id } as ProbeTarget)
      );
    } else if (state.targetAgent && state.targetAgentSelected) {
      // Agent target
      state.probeConfig.target = [{ agent: state.targetAgentSelected.id } as ProbeTarget];
    } else if (!state.probeConfig.server) {
      // Custom target
      state.probeConfig.target = [state.probeTarget];
    }

    // Special handling for TRAFFICSIM client mode
    if (state.selected.value === 'TRAFFICSIM' && state.targetAgent && state.probeConfig.target.length >= 1) {
      state.probeConfig.server = false;
    }

    // Set probe configuration
    state.probe.config = state.probeConfig;
    state.probe.type = state.selected.value as ProbeType;

    // Create the probe
    await probeService.createProbe(id, state.probe);
    router.push(`/agent/${id}`);

  } catch (error) {
    console.error("Error creating probe:", error);
    state.errors.push("Failed to create probe. Please try again.");
  } finally {
    state.loading = false;
  }
}

// Helper function to get available agents based on probe type
const availableAgentsForSelection = computed(() => {
  if (state.selected.value === 'TRAFFICSIM') {
    return state.validAgents;
  } else if (state.selected.value === 'AGENT') {
    return state.agents;
  }
  return state.agents;
});
</script>

<template>
  <div class="container-fluid">
    <Title
        :history="[
          {title: 'workspaces', link: '/workspaces'},
          {title: state.site.name, link: `/workspace/${state.site.id}`},
          {title: state.agent.name, link: `/agent/${state.agent.id}`}
        ]"
        :subtitle="`create a new probe for agent '${state.agent.name}'`"
        title="New Probe">
    </Title>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="form-horizontal">
            <div class="card-body">
              <!-- Error Messages -->
              <div v-if="state.errors.length > 0" class="alert alert-danger mb-3">
                <div v-for="(error, index) in state.errors" :key="index">{{ error }}</div>
              </div>

              <!-- Duplicate Warning -->
              <div v-if="state.duplicateWarning" class="alert alert-warning mb-3">
                <i class="fas fa-exclamation-triangle me-2"></i>{{ state.duplicateWarning }}
              </div>

              <div class="row">
                <!-- Probe Type Selection -->
                <div class="mb-3 col-lg-8 col-12">
                  <label class="form-label" for="probeType">Probe Type</label>
                  <select
                      id="probeType"
                      v-model="state.selected"
                      class="form-select"
                      :disabled="state.loading">
                    <option value="" disabled>Select a probe type</option>
                    <option v-for="option in state.options" :key="option.value" :value="option">
                      {{ option.text }}
                    </option>
                  </select>
                </div>

                <!-- Target Options -->
                <div class="mb-1 col-lg-4 col-8">
                  <br>
                  <div v-if="showTargetAgentOption">
                    <label class="form-label">Use Agent as Target</label>
                    <div class="form-check">
                      <input
                          id="useAgentTarget"
                          v-model="state.targetAgent"
                          class="form-check-input"
                          type="checkbox">
                      <label class="form-check-label" for="useAgentTarget">Enable</label>
                    </div>
                  </div>
                </div>
              </div>

              <br>

              <!-- Probe Configuration -->
              <div v-if="state.selected && state.selected.value" class="row">
                <h5 class="border-bottom pb-2">Configuration</h5>

                <!-- Agent Selection -->
                <div v-if="state.targetAgent" class="mb-3 col-lg-8 col-12">
                  <label class="form-label" for="targetAgent">Target Agent</label>
                  <select
                      id="targetAgent"
                      v-model="state.targetAgentSelected"
                      class="form-select"
                      :disabled="state.loading">
                    <option :value="null" disabled>Select an agent</option>
                    <option
                        v-for="agent in availableAgentsForSelection"
                        :key="agent.id"
                        :value="agent">
                      {{ agent.name }} ({{ agent.location || 'No location' }})
                    </option>
                  </select>
                  <small v-if="state.selected.value === 'TRAFFICSIM' && state.validAgents.length === 0" class="text-muted">
                    No agents with TrafficSim server enabled found
                  </small>
                </div>

                <!-- AGENT Probe Options -->
                <div v-if="state.selected.value === 'AGENT'">
                  <div class="mb-3">
                    <p class="text-muted">
                      Agent monitoring will check the health and connectivity of the selected target agent.
                    </p>
                  </div>
                </div>

                <!-- TRAFFICSIM Options -->
                <div v-if="state.selected.value === 'TRAFFICSIM'">
                  <div v-if="!state.targetAgent && !state.targetGroup" class="mb-3">
                    <label class="form-label">Enable Server Mode</label>
                    <div class="form-check">
                      <input
                          id="trafficSimServer"
                          v-model="state.probeConfig.server"
                          class="form-check-input"
                          type="checkbox"
                          :disabled="state.existingProbes.some(p => p.type === 'TRAFFICSIM' && p.config.server)">
                      <label class="form-check-label" for="trafficSimServer">
                        Enable (only one server per agent allowed)
                      </label>
                    </div>
                  </div>

                  <div v-if="state.probeConfig.server && showTargetInput" class="mb-3">
                    <label class="form-label" for="trafficSimPort">
                      Listening Address <code>(e.g., 0.0.0.0:5000)</code>
                    </label>
                    <input
                        id="trafficSimPort"
                        v-model="state.probeTarget.target"
                        class="form-control"
                        type="text"
                        placeholder="0.0.0.0:5000">
                  </div>
                </div>

                <!-- PING Options -->
                <div v-if="state.selected.value === 'PING'">
                  <div v-if="showTargetInput" class="mb-3">
                    <label class="form-label" for="pingTarget">
                      Target <code>(e.g., 1.1.1.1 or google.com)</code>
                    </label>
                    <input
                        id="pingTarget"
                        v-model="state.probeTarget.target"
                        class="form-control"
                        type="text"
                        placeholder="1.1.1.1">
                  </div>
                </div>

                <!-- MTR Options -->
                <div v-if="state.selected.value === 'MTR'">
                  <div v-if="showTargetInput" class="mb-3">
                    <label class="form-label" for="mtrTarget">
                      Target <code>(e.g., 1.1.1.1 or google.com)</code>
                    </label>
                    <input
                        id="mtrTarget"
                        v-model="state.probeTarget.target"
                        class="form-control"
                        type="text"
                        placeholder="1.1.1.1">
                  </div>
                  <div class="mb-3">
                    <label class="form-label" for="mtrInterval">Interval (minutes)</label>
                    <input
                        id="mtrInterval"
                        v-model.number="state.probeConfig.interval"
                        class="form-control"
                        type="number"
                        min="1"
                        max="60">
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="card-footer">
              <div class="d-flex justify-content-between align-items-center">
                <router-link
                    :to="`/agent/${state.agent.id}`"
                    class="btn btn-secondary">
                  Cancel
                </router-link>
                <button
                    class="btn btn-primary px-4"
                    type="submit"
                    @click="submit"
                    :disabled="!isValidProbe || state.loading">
                  <span v-if="state.loading">
                    <i class="fas fa-spinner fa-spin me-2"></i>Creating...
                  </span>
                  <span v-else>Create Probe</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  font-weight: 500;
}

.card-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.alert {
  border-radius: 0.375rem;
}

code {
  color: #e83e8c;
  font-size: 0.875em;
}

.text-muted {
  font-size: 0.875rem;
}
</style>