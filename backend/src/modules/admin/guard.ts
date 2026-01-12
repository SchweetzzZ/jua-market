
import { Elysia } from "elysia"
import { authMacro } from "../auth/macro"

export const adminGuard = new Elysia()
    .use(authMacro)
    .derive(({ user, set }) => {
        if (user.role !== "admin") {
            set.status = 401
            return { success: false, message: "Unauthorized" }
        }
    })