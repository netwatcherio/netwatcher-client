import request from "@/services/request";
import type {Agent, Probe, Site} from "@/types";

export default {
    async createProbe(id: string, probe: Probe): Promise<any> {
        return await request.post(`/probes/new/${id}`, probe)
    },
    async getAgentProbes(id: string): Promise<any> {
        return await request.get(`/probes/agent/${id}`)
    },
    async getProbe(id: string): Promise<any> {
        return await request.get(`/probes/${id}`)
    },
}
