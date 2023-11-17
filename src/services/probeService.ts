import request from "@/services/request";
import type {Agent, Probe, ProbeDataRequest, Site} from "@/types";

export default {
    async createProbe(id: string, probe: Probe): Promise<any> {
        return await request.post(`/probes/new/${id}`, probe)
    },
    async getAgentProbes(id: string): Promise<any> {
        return await request.get(`/probes/agent/${id}`)
    },
    async getSimilarProbes(id: string): Promise<any> {
        return await request.get(`/probes/similar/${id}`)
    },
    async getProbeData(id: string, req: ProbeDataRequest): Promise<any> {
        return await request.post(`/probes/data/${id}`, req)
    },
    async getProbe(id: string): Promise<any> {
        return await request.get(`/probe/${id}`)
    },
}
