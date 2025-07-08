
import NewProbe from "@/views/probes/NewProbe.vue";
import Probe from "@/views/probes/Probe.vue";
import AgentProbe from "@/views/probes/AgentProbe.vue";
import ProbeView from "@/views/probes/ProbeView.vue";
import DeleteProbe from "@/views/probes/DeleteProbe.vue";

export default {
    path: '/probe',
    name: 'probeView',
    component: ProbeView,
    children: [
        {
            path: '/probe/:idParam',
            name: 'probe',
            component: Probe,
        },
        {
            path: '/probe/:idParam/new',
            name: 'newProbe',
            component: NewProbe,
        },
        {
            path: '/agent_probe/:idParam',
            name: 'agentProbe',
            component: AgentProbe,
        },
        {
            path: '/probe/:idParam/delete',
            name: 'deleteProbe',
            component: DeleteProbe,
        },
    ]
}