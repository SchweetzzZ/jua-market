import { Elysia, t } from "elysia"
import { adminGuard } from "./admin-guard"
import { auth } from "../auth/auth"

export const adminRoutes = new Elysia({
    prefix: "/admin"
})
    .use(adminGuard)

    .get("/users", async ({ request: { headers } }) => {
        return await auth.api.listUsers({
            query: { limit: 10 },
            headers: await headers
        })
    })

    .post("/ban-user", async ({ body, request: { headers } }) => {
        const { userId, reason } = body

        await auth.api.banUser({
            body: {
                userId,
                banReason: reason
            },
            headers
        })

        await auth.api.revokeUserSessions({
            body: { userId },
            headers
        })

        return {
            success: true,
            message: "User banned successfully"
        }
    }, {
        body: t.Object({
            userId: t.String(),
            reason: t.Optional(t.String())
        })
    })
    .post("/impersonate", async ({ body, request: { headers } }) => {
        const { userId } = body
        return await auth.api.impersonateUser({
            body: { userId },
            headers
        })
    }, {
        body: t.Object({
            userId: t.String()
        })
    })