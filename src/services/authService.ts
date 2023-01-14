import request from "@/services/request";
import type {User} from "@/types"

export default {
    async login(user: User): Promise<void> {
        return await request.post("/login", user)
    },
    async register(user: User): Promise<void> {
        return await request.post("/register", user)
    },
}
