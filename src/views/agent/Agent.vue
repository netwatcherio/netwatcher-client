<script lang="ts" setup>

import {onMounted, reactive} from "vue";
import siteService from "@/services/siteService";
import type {
  Agent,
  AgentGroup,
  CompleteSystemInfo,
  CPUTimes,
  HostInfo,
  HostMemoryInfo,
  NetResult,
  OSInfo,
  Probe,
  ProbeData,
  ProbeType,
  Site
} from "@/types";
import {OUIEntry} from "@/types";
import core from "@/core";
import Title from "@/components/Title.vue";
import agentService from "@/services/agentService";
import probeService from "@/services/probeService";
import Chart from "@/components/Chart.vue"
import ElementLink from "@/components/ElementLink.vue";
import Element from "@/components/Element.vue";
import List from "@/components/List.vue";
import {since} from "@/time";
import ElementPair from "@/components/ElementPair.vue";
import FillChart from "@/components/FillChart.vue";
import ElementExpand from "@/components/ElementExpand.vue";

interface OrganizedProbe {
  key: string;
  probes: Probe[];
}

interface CpuUsage {
  idle: number
  system: number
  user: number
}

interface MemoryUsage {

  used: number
  free: number
  total: number
}

interface SystemData {
  cpu: CpuUsage
  ram: MemoryUsage
  virtual: MemoryUsage
}

function roundTo(value: number): number {
  return Math.round(value * 1000) / 1000
}

function updateSystemData(info: CompleteSystemInfo): SystemData {
  let cpuCapacity: number = (info.CPUTimes?.idle || 0) + info.CPUTimes.system + info.CPUTimes.user;
  let ramCapacity: number = info.memoryInfo.totalBytes;
  let virtualCapacity: number = info.memoryInfo.virtualTotalBytes;
  return {
    cpu: {
      idle: roundTo((info.CPUTimes?.idle || 0) / cpuCapacity),
      system: roundTo((info.CPUTimes?.system || 0) / cpuCapacity),
      user: roundTo((info.CPUTimes?.user || 0) / cpuCapacity),
    },
    ram: {
      used: roundTo(info.memoryInfo.usedBytes / ramCapacity),
      free: roundTo(info.memoryInfo.availableBytes / ramCapacity),
      total: roundTo(info.memoryInfo.totalBytes / ramCapacity),
    },
    virtual: {
      used: roundTo(info.memoryInfo.virtualUsedBytes / ramCapacity),
      free: roundTo(info.memoryInfo.virtualFreeBytes / virtualCapacity),
      total: roundTo(info.memoryInfo.virtualTotalBytes / virtualCapacity),
    }
  } as SystemData
}

function getVendorFromMac(macAddress: string) {
  const normalizedMac = macAddress.replace(/[:-]/g, '').toUpperCase();
  const oui = normalizedMac.substring(0, 6);
  console.log(oui + " " + normalizedMac)
  const entry = state.ouiList.find(item => item.Assignment == oui);
  console.log(entry)
  return entry ? (entry as OUIEntry)["Organization Name"] : "Unknown";
}

let state = reactive({
  site: {} as Site,
  ready: false,
  agent: {} as Agent,
  agents: {} as Agent[],
  probes: [] as Probe[],
  organizedProbes: [] as OrganizedProbe[],
  agentGroups: [] as AgentGroup[],
  networkInfo: {} as ProbeData,
  netData: {} as NetResult,
  systemInfoComplete: {} as CompleteSystemInfo,
  systemData: {} as SystemData,
  hasData: false,
  ouiList: [] as OUIEntry[]
})

function transformNetData(data: any): NetResult {
  return {
    localAddress: data.find((d: any) => d.Key === "local_address").Value || 'Unknown',
    defaultGateway: data.find((d: any) => d.Key === "default_gateway").Value || 'Unknown',
    publicAddress: data.find((d: any) => d.Key === "public_address").Value || 'Unknown',
    internetProvider: data.find((d: any) => d.Key === "internet_provider").Value || 'Unknown',
    lat: data.find((d: any) => d.Key === "lat").Value || 'Unknown',
    long: data.find((d: any) => d.Key === "long").Value || 'Unknown',
    timestamp: new Date(data.find((d: any) => d.Key === "timestamp").Value || Date.now()),
  };
}

function convertToCompleteSystemInfo(data: any[]): CompleteSystemInfo {
  let completeSystemInfo: any = {};

  data.forEach(item => {
    switch (item.Key) {
      case 'hostInfo':
        completeSystemInfo.hostInfo = convertToHostInfo(item.Value);
        break;
      case 'memoryInfo':
          completeSystemInfo.memoryInfo = convertToHostMemoryInfo(item.Value);
        break;
      case 'CPUTimes':
        completeSystemInfo.CPUTimes = convertToCPUTimes(item.Value);
        break;
      case 'timestamp':
        completeSystemInfo.timestamp = new Date(item.Value);
        break;
    }
  });

  return completeSystemInfo as CompleteSystemInfo;
}

function convertToHostInfo(data: any[]): HostInfo {
  let hostInfo: any = {IPs: [], MACs: [], os: {}};

  data.forEach(item => {
    switch (item.Key) {
      case 'architecture':
      case 'bootTime':
      case 'containerized':
      case 'hostname':
      case 'kernelVersion':
      case 'timezone':
      case 'timezoneOffsetSec':
      case 'uniqueID':
        hostInfo[item.Key] = item.Value;
        break;
      case 'IPs':
        hostInfo.IPs = item.Value;
        break;
      case 'MACs':
        hostInfo.MACs = item.Value;
        break;
      case 'OS':
        hostInfo.os = convertToOSInfo(item.Value);
        break;
    }
  });

  hostInfo.bootTime = new Date(hostInfo.bootTime);

  return hostInfo as HostInfo;
}

function convertToOSInfo(data: any[]): OSInfo {
  let osInfo: any = {};

  data.forEach(item => {
    osInfo[item.Key] = item.Value;
  });

  return osInfo as OSInfo;
}

function convertToHostMemoryInfo(data: any[]): HostMemoryInfo {
  let memoryInfo: any = {metrics: {}};

  data.forEach(item => {
    if (item.Key === 'metrics' && item.Value != null) {
      item.Value.forEach((metric: any) => {
        memoryInfo.metrics[metric.Key] = metric.Value;
      });
    } else {
      memoryInfo[item.Key + 'Bytes'] = item.Value;
    }
  });

  return memoryInfo as HostMemoryInfo;
}

function getAgentName(id: string) {
  let name = "Unknown"
  state.agents.find(a => {
    if (a.id == id) {
      name = a.name
      return name
    }
  })

  return name
}

function convertToCPUTimes(data: any[]): CPUTimes {
  let cpuTimes: any = {};

  data.forEach(item => {
    cpuTimes[item.Key] = item.Value;
  });

  return cpuTimes as CPUTimes;
}

// Example us
function formatNumber(value: number): string {
  return value.toFixed(2)
}

function getGroupName(id: string): string {
  // Use the 'find' method to locate the group with the matching ID
  const group = state.agentGroups.find(group => group.id === id);

  // Return the group name if found, otherwise return a default value or empty string
  return group ? group.name : 'Unknown Group';
}

function reloadData(id: string) {
  state.probes = [] as Probe[]
  state.organizedProbes = [] as OrganizedProbe[];

  state.ready = false


  probeService.getSystemInfo(id).then(res => {
    let sysInfo = (res.data as ProbeData)
    state.systemInfoComplete = convertToCompleteSystemInfo(sysInfo.data)

    //console.log(state.systemInfoComplete)
  })

  probeService.getNetworkInfo(id).then(res => {
    state.networkInfo = res.data as ProbeData
    //console.log(state.networkInfo)
    // todo handle edgecase where probe_data collection is wiped and agents are already running

  })

  agentService.getSiteAgents(state.agent.site).then(res => {
    state.agents = res.data as Agent[]
    //console.log("agents ", res.data)
  })

  siteService.getAgentGroups(state.agent.site).then(res => {
    state.agentGroups = res.data as AgentGroup[]

    probeService.getAgentProbes(id).then(res => {
      state.probes = res.data as Probe[]
      //console.log("probes ", res.data)
      let organizedProbesMap = new Map<string, Probe[]>();

      console.log("1" + state)
      for (let probe of state.probes) {
        if (probe.type == "SYSINFO" as ProbeType || probe.type == "NETINFO" as ProbeType /*|| /*(probe.type == "RPERF" as ProbeType && probe.config.server)*/) {
          continue
        }

        if (probe.config && probe.config.target) {
          //console.log(probe)

          for (let target of probe.config.target) {
            let key = target.target;
            if (probe.type == "RPERF" && !probe.config.server) {
              key = target.target.split(':')[0]
            }

            if (target.group && target.group !== "000000000000000000000000") {
              // Prefix group ID to differentiate
              key = `group:${target.group}`;
              // Fetch or determine group information here if necessary
              // e.g., groupInfoMap.get(target.group) or similar
            }
            if (target.agent && target.agent !== "000000000000000000000000") {
              // Prefix group ID to differentiate
              /*target.agent*/
              key = `agent:${target.agent}`;
            }

            if (!organizedProbesMap.has(key)) {
              organizedProbesMap.set(key, []);
            }
            organizedProbesMap.get(key).push(probe);
            console.log(state)
          }
        }
      }

      state.organizedProbes = Array.from(organizedProbesMap, ([key, probes]) => ({key, probes}));
      state.ready = true
      state.hasData = true
    })
  })

  state.netData = transformNetData(state.networkInfo.data)
  state.systemData = updateSystemData(state.systemInfoComplete);
}

function latestUpdate(list: Probe[]): string {
  let now = Date.now().valueOf()
  let mutations = list.map(p => new Date(p.updatedAt));
  let latest = now - (24 * 60 * 1000)
  let sorted = mutations.sort((a, b) => a.valueOf() - b.valueOf())

  return since(sorted[0].toString(), true)
}


// const site = inject("site") as Site

onMounted(() => {

  let id = router.currentRoute.value.params["agentId"] as string
  if (!id) return

  console.log("oui: "+state.ouiList)

  agentService.getAgent(id).then(res => {
    state.agent = res.data as Agent

    fetch('/ouiList.json')
        .then(response => response.json())
        .then(data => state.ouiList = data as OUIEntry[]);

    siteService.getSite(state.agent.site).then(res => {
      state.site = res.data as Site
      probeService.getNetworkInfo(state.agent.id).then(res => {
        state.networkInfo = res.data as ProbeData
        //console.log(state.networkInfo)
        probeService.getSystemInfo(state.agent.id).then(res => {
          state.systemInfoComplete = convertToCompleteSystemInfo((res.data as ProbeData).data);
          //console.log(state.systemInfoComplete)
          reloadData(id);
        })
      })
    })
  })
  /*setInterval(() => {
    reloadData(id);
  }, 1000 * 15);*/
})
const router = core.router()

function onCreate(response: any) {
  router.push("/sites")
}

function onError(response: any) {
  alert(response)
}

function submit() {

}

function getRandomProbeId(list: Probe[]): string | undefined {
  if (list.length === 0) {
    return undefined; // Return undefined if the list is empty
  }

  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex].id; // Return the ID of the randomly selected probe
}

function formatDate(timestamp: Date): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function bytesToString(bytes: number, si: boolean = true, dp: number = 2): string {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

function getLocalAddresses(addresses: string[]): string[] {
  let ipv4s = addresses.filter(f => f.split(".").length == 4)
  let nonLocal = ipv4s.filter(i => !i.includes("127.0.0.1"))
  return nonLocal.map(l => l.split('/')[0])
}

function formatSnakeCaseToHumanCase(name: string): string {
  let words = name.split("_")
  words = words.filter(w => w != "bytes")
  words = words.map(w => w[0].toUpperCase() + w.substring(1))

  return words.join(" ")
}

function probeTitle(probeKey: string): string {
  if (probeKey.startsWith("group:")) {
    return ``+ getGroupName(probeKey.split(":")[1]);
  } else if (probeKey.startsWith("agent:")) {
    return ``+getAgentName(probeKey.split(":")[1]);
  } else {
    return probeKey;
  }
}

</script>

<template>
  <div class="container-fluid gap-0">
    <Title :history="[{title: 'workspaces', link: '/sites'}, {title: state.site.name, link: `/sites/${state.site.id}`}]"
           :title="state.agent.name"
           subtitle="information about this agent">
      <div class="d-flex gap-1">
        <router-link :to="`/agent/${state.agent.id}/probes`" active-class="active" class="btn btn-outline-primary"><i
            class="fa-regular fa-pen-to-square"></i>&nbsp;edit probes
        </router-link>
        <router-link :to="`/agents/${state.agent.id}/probes/new`" active-class="active" class="btn btn-primary"><i
            class="fa-solid fa-plus"></i>&nbsp;add probe
        </router-link>
      </div>
    </Title>

    <Element v-if="false">
      <ElementPair :title="key" :key="key" code v-for="key in Object.keys(state)">
        <template v-slot:extended>
          <List>
            <ElementPair :title="vk" :key="vk" code v-for="vk in Object.keys(state[key])">
              <template v-slot:extended>
                {{ state[key][vk] }}
              </template>

            </ElementPair>
          </List>
        </template>

      </ElementPair>
    </Element>

    <div class="d-flex flex-column gap-1" v-if="state.ready && state.agent.initialized">
      <div class="agent-grid">
        <div v-if="state.organizedProbes.length > 0" style="grid-column: 1 / span 2">
          <Element style="height: 100%">
            <div class="px-2 py-2 pb-1 ">
              <div class="label-c4 label-o2 label-w500">Probes</div>
            </div>
            <List>
              <ElementLink v-for="(organized, index) in state.organizedProbes" :key="organized"
                           :icon="organized.key.startsWith('agent:') ? 'fa-solid fa-robot' : 'fa-solid fa-diagram-project'"
                           :to="`/probes/${getRandomProbeId(organized.probes)}/view`"
                           :secondary="organized.probes.sort((a, b) => a.type.localeCompare(b.type)).map(p => p.type).join(', ')"
                           :title="probeTitle(organized.key)">
                <Chart></Chart>
              </ElementLink>
            </List>
          </Element>

        </div>

        <Element>
          <div class="px-2 py-2 pb-1 ">
            <div class="label-c4 label-o2 label-w500">Network</div>
          </div>
          <List>
            <ElementPair title="Hostname" code>
              {{ state.systemInfoComplete.hostInfo.hostname }}
            </ElementPair>
            <ElementPair title="WAN" code>
              {{ state.netData.publicAddress }}
            </ElementPair>
            <ElementPair title="ISP" code>
              {{ state.netData.internetProvider }}
            </ElementPair>
          </List>
          <List>


            <ElementPair title="IPs" code>
              <div v-for="alias in getLocalAddresses(state.systemInfoComplete.hostInfo?.IPs || [])">
                {{ alias }}
              </div>
            </ElementPair>

            <ElementPair title="Gateway" code>
              {{ state.netData.defaultGateway }}
            </ElementPair>


          </List>
        </Element>


      </div>
      <div class="agent-grid">
        <Element>
          <div class="px-2 py-2 pb-1 ">
            <div class="label-c4 label-o2 label-w500">Utilization</div>
          </div>
          <List style="height: 100%;">
            <ElementPair title="CPU" code class="">
              <FillChart :data="[state.systemData.cpu.user, state.systemData.cpu.system]"
                         :labels="['user', 'system']"></FillChart>
            </ElementPair>

            <ElementPair title="Ram" code class="">
              <FillChart :data="[state.systemData.ram.used, state.systemData.virtual.used]"
                         :labels="['physical', 'virtual']"
                         :values="[bytesToString(state.systemInfoComplete.memoryInfo.usedBytes), bytesToString(state.systemInfoComplete.memoryInfo.virtualUsedBytes)]"></FillChart>
            </ElementPair>

            <ElementExpand title="Memory Allocations"  code>
              + {{Object.keys(state.systemInfoComplete.memoryInfo.metrics).length}} values
              <template v-slot:expanded>
                <div class="d-flex flex-column gap-2 pt-1 w-100">
                  <div v-for="entry in Object.keys(state.systemInfoComplete.memoryInfo.metrics)" class="d-flex justify-content-between gap-1" style="margin-left: 1rem">
                    <div class="label-o1 label-w500 label-c5">{{formatSnakeCaseToHumanCase(entry)}}</div>
                    <div class="label-o4 label-w400 label-c5 label-code">{{bytesToString(state.systemInfoComplete.memoryInfo.metrics[entry])}}</div>

                  </div>
                </div>
              </template>
            </ElementExpand>



          </List>

        </Element>
        <Element>
          <div class="px-2 py-2 pb-1 ">
            <div class="label-c4 label-o2 label-w500">Machine</div>
          </div>
          <List>
            <ElementPair title="Architecture" code>
              {{ state.systemInfoComplete.hostInfo.architecture }}
            </ElementPair>
            <ElementPair title="Virtuality" code>
              {{ state.systemInfoComplete.hostInfo.containerized ? "Virtual" : "Physical" }}
            </ElementPair>
            <ElementPair title="Timezone" code>
              {{ state.systemInfoComplete.hostInfo.timezone }}
            </ElementPair>
            <ElementPair title="Location" code>
              {{ state.netData.lat }},{{ state.netData.long }}
            </ElementPair>

            <ElementExpand title="Media Access Control"  code>
              + {{Object.keys(state.systemInfoComplete.hostInfo.MACs).length}} values
              <template v-slot:expanded>
                <div class="d-flex flex-column gap-2 pt-1 w-100">
                  <div v-for="entry in Object.keys(state.systemInfoComplete.hostInfo.MACs)" class="d-flex justify-content-between gap-1" style="margin-left: 1rem">
                    <div class="label-o1 label-w500 label-c5">{{getVendorFromMac(state.systemInfoComplete.hostInfo.MACs[entry])}}</div>
                    <div class="label-o4 label-w400 label-c5 label-code">{{state.systemInfoComplete.hostInfo.MACs[entry]}}</div>

                  </div>
                </div>
              </template>
            </ElementExpand>
          </List>
        </Element>
        <Element>
          <div class="px-2 py-2 pb-1 ">
            <div class="label-c4 label-o2 label-w500">Operating System</div>
          </div>
          <List>

            <ElementPair title="OS" code>
              {{ state.systemInfoComplete.hostInfo.os.name }}
              {{ state.systemInfoComplete.hostInfo.os.version }}
            </ElementPair>
            <ElementPair title="Location" code>
              {{ state.netData.lat }},
              {{ state.netData.long }}
            </ElementPair>
            <ElementPair title="Uptime" code>
              {{ since(state.systemInfoComplete.hostInfo.bootTime + "", false) }}
            </ElementPair>

            <ElementPair title="Last Seen" code>
              {{ since(state.systemInfoComplete.timestamp + "", true) }}
            </ElementPair>
          </List>
        </Element>

      </div>
    </div>
    <div v-else>
      <div class="col-lg-12">
        <div class="error-body text-center">
          <h1 class="error-title text-danger">no data</h1>
          <h3 class="text-error-subtitle">please check back later</h3>
          <!-- <p class="text-muted m-t-30 m-b-30">YOU SEEM TO BE TRYING TO FIND HIS WAY HOME</p>
           <a href="/" class="btn btn-danger btn-rounded waves-effect waves-light m-b-40 text-white">Back to home</a>-->
        </div>
      </div>
    </div>


    <br>
    <!--    <div class="row">
          <div class="col-sm-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">speedtest</h5>
                <p class="card-text">view historical speedtests</p>
                <table class="table">
                  <thead>
                  <tr>
                    <th scope="col">timestamp</th>
                    <th scope="col">server</th>
                    <th scope="col">host</th>
                    <th scope="col">upload</th>
                    <th scope="col">download</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    &lt;!&ndash;                <th scope="row">{{state.stats.speed_test_info.timestamp}}</th>
                                    <td>{{state.stats.speed_test_info.server}}</td>
                                    <td>{{state.stats.speed_test_info.host}}</td>
                                    <td>{{state.stats.speed_test_info.ul_speed}}</td>
                                    <td>{{state.stats.speed_test_info.dl_speed}}</td>&ndash;&gt;
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>-->
  </div>
</template>

<style lang="scss">

.agent-grid {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(1, 1fr);

  grid-gap: 0.25rem;

}

.probe {
  height: 100%;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.check-grid {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(12, minmax(8rem, 1fr));
  grid-gap: 0.5rem;

}
</style>