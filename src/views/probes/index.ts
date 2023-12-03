
import NewProbe from "@/views/probes/NewProbe.vue";
import Probe from "@/views/probes/Probe.vue";
import ProbeView from "@/views/probes/ProbeView.vue";

export default {
    path: '/agents/:agentId/probes',
    name: 'probeView',
    component: ProbeView,
    children: [
        {
            path: '/agents/:agentId/probes/new',
            name: 'probeNew',
            component: NewProbe,
        },
        {
            path: '/probes/:probeId/view',
            name: 'probeView',
            component: Probe,
        },
    ]
}