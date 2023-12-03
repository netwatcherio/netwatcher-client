import request from "@/services/request";
import type {AgentGroup, Site} from "@/types";

export default {
    async getSites(): Promise<any> {
        return await request.get("/sites")
    },
    async updateSite(site: Site): Promise<void> {
        return await request.post(`/sites/update/${site.id}`, site)
    },
    async createSite(site: Site): Promise<void> {
        return await request.post("/sites", site)
    },
    async getSite(id: string): Promise<any> {
        return await request.get(`/sites/${id}`)
    },
    async getMemberInfos(id: string): Promise<any> {
        return await request.get(`/sites/${id}/memberinfo`)
    },
    async getAgentGroups(id: string): Promise<any> {
        return await request.get(`/sites/${id}/groups`)
    },
    async createAgentGroup(id: string, group: AgentGroup): Promise<any> {
        return await request.post(`/sites/${id}/groups`, group)
    },
}
