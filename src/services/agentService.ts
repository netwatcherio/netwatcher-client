import request from "@/services/request";
import type {Agent, Site} from "@/types";

export default {
    async createAgent(agent: Agent): Promise<any> {
        return await request.post(`/agents/new/${agent.site}`, agent)
    },
    async deactivateAgent(id: string): Promise<any> {
        return await request.get(`/agents/deactivate/${id}`)
    },
    async getSiteAgents(id: string): Promise<any> {
        return await request.get(`/agents/site/${id}`)
    },
    async getAgent(id: string): Promise<any> {
        return await request.get(`/agents/${id}`)
    },
}
