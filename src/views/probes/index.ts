
import NewProbe from "@/views/probes/NewProbe.vue";
import Probe from "@/views/probes/Probe.vue";
import ProbeView from "@/views/probes/ProbeView.vue";
import DeleteProbe from "@/views/probes/DeleteProbe.vue";

export default {
    path: '/probe/:idParam',
    name: 'probeView',
    component: Probe,
    children: [
        {
            path: '/probe/:idParam/new',
            name: 'newProbe',
            component: NewProbe,
        },
        {
            path: '/probe/:idParam/delete',
            name: 'deleteProbe',
            component: DeleteProbe,
        },
    ]
}