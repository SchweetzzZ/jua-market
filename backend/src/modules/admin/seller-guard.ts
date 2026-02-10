import { Elysia } from "elysia"
import { auth } from "../auth/auth"

export const sellerGuard = (app: Elysia) => app
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
            role === "admin" || role === "seller" ||
            (Array.isArray(role) && role.includes("admin")) || (Array.isArray(role) && role.includes("seller"))

        const isSeller =
            role === "seller" ||
            (Array.isArray(role) && role.includes("seller"))

        if (!isAdmin && !isSeller) {
            set.status = 403
            return { success: false, message: "Forbidden: Admin or Seller access required", data: null }
        }
    })