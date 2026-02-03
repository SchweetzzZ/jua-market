import { Elysia } from "elysia"
import { auth } from "../auth/auth"

export const adminGuard = (app: Elysia) => app
    .derive(async ({ request: { headers }, set }) => {
        const session = await auth.api.getSession({
            headers
        })

        if (!session) {
            set.status = 401
            return { success: false, message: "Unauthorized", data: null }
        }

        return {
            user: session.user,
            session: session.session
        }
    })
    .onBeforeHandle(({ user, set }) => {
        const role = user?.role

        const isAdmin =
            role === "admin" ||
            (Array.isArray(role) && role.includes("admin"))

        if (!isAdmin) {
            set.status = 403
            return { success: false, message: "Forbidden: Admin access required", data: null }
        }
    })