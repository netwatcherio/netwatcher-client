import NewAgent from "@/views/agent/NewAgent.vue";
import Agent from "@/views/agent/Agent.vue";
import AgentView from "@/views/agent/AgentView.vue";

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
    ]
}