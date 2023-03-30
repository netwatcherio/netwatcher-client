import NewAgent from "@/views/agent/NewAgent.vue";
import Agent from "@/views/agent/Agent.vue";
import AgentView from "@/views/agent/AgentView.vue";
import AgentTarget from "@/views/agent/AgentTarget.vue"
import check from "@/views/check";

export default {
    path: '/agents',
    name: 'agentView',
    component: AgentView,
    children: [
        {
            path: '/agents/:siteId/new',
            name: 'agentNew',
            component: NewAgent,
        },
        {
            path: '/agents/:agentId',
            name: 'agent',
            component: Agent,
        },
        {
            path: '/agents/:agentId:/target/:targetHost:',
            name: 'agentTarget',
            component: AgentTarget,
        },
    ]
}