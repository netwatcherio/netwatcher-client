import request from "@/services/request";
import type {User} from "@/types"
import type {AxiosResponse} from "axios";

export default {
    async login(user: User): Promise<any> {
        return await request.post("/auth/login", user)
    },
    async register(user: User): Promise<any> {
        return await request.post("/auth/register", user)
    },
}
