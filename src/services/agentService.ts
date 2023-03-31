import request from "@/services/request";
import type {Agent, Check, Site} from "@/types";

export default {
    async createAgent(agent: Agent): Promise<any> {
        return await request.post(`/agent/new/${agent.site}`, agent)
    },
    async getAgent(id: string): Promise<any> {
        return await request.get(`/agent/${id}`)
    },
    async getChecks(agentId: string): Promise<any> {
        return await request.get(`/checks/${agentId}`)
    },
    async getAgentStats(id: string): Promise<any> {
        return await request.get(`/agent_stats/${id}`)
    },
    async createCheck(id: string, check: Check): Promise<any> {
        return await request.post(`/check/new/${id}`, check)
    },
}
