import request from "@/services/request";
import type {Agent, Check, Site} from "@/types";

export default {
    async createAgent(agent: Agent): Promise<any> {
        return await request.post(`/agents/new/${agent.site}`, agent)
    },
    async getSiteAgents(id: string): Promise<any> {
        return await request.get(`/agents/site/${id}`)
    },
}
