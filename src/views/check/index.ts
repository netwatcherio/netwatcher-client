
import NewCheck from "@/views/check/NewCheck.vue";
import Check from "@/views/check/Check.vue";
import CheckView from "@/views/check/CheckView.vue";

export default {
    path: '/agents/:agentId/checks',
    name: 'checkView',
    component: CheckView,
    children: [
        {
            path: '/agents/:agentId/checks/new',
            name: 'checkNew',
            component: NewCheck,
        },
        {
            path: '/agents/:agentId/checks/:checkId',
            name: 'check',
            component: Check,
        },
    ]
}