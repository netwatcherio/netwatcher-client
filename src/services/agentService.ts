import request from "@/services/request";
import type {Agent, Site} from "@/types";

export default {
    async createAgent(agent: Agent): Promise<any> {
        return await request.post(`/agent/new/${agent.site}`, agent)
    },
    async getAgent(id: string): Promise<any> {
        return await request.get(`/agent/${id}`)
    },
}
