import NewAgent from "@/views/agent/NewAgent.vue";
import Agent from "@/views/agent/Agent.vue";
import AgentView from "@/views/agent/AgentView.vue";
import DeactivateAgent from "@/views/agent/DeactivateAgent.vue";
import EditAgent from "@/views/agent/EditAgent.vue";

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
            path: '/agents/:agentId/edit',
            name: 'editAgent',
            component: EditAgent,
        },
        {
            path: '/agents/:agentId/deactivate',
            name: 'deactivateAgent',
            component: DeactivateAgent,
        },
        {
            path: '/agents/:agentId',
            name: 'agent',
            component: Agent,
        },
    ]
}