import request from "@/services/request";

function getEndpoint(id: string, path: string): string {
    return `/sites/${id}${path}`
}

export default {
    async getSites(id: string): Promise<void> {
        const url = getEndpoint(id, "/reload")
        return await request.post(url)
    },
}
