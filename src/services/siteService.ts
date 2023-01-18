import request from "@/services/request";
import type {Site} from "@/types";

export default {
    async getSites(): Promise<any> {
        return await request.get("/sites")
    },
    async createSite(site: Site): Promise<void> {
        return await request.post("/site/new", site)
    },
    async getSite(id: string): Promise<any> {
        return await request.get(`/site/${id}`)
    },
}
