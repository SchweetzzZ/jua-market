import { Elysia } from "elysia"
import { auth } from "../../modules/auth/auth"

export const sellerGuard = new Elysia({ name: "seller-guard" })
    .derive(async ({ request: { headers }, set }) => {
        const session = await auth.api.getSession({ headers })

        if (!session) {
            set.status = 401
            throw new Error("Unauthorized")
        }

        if (session.user.role !== "seller" && session.user.role !== "admin") {
            set.status = 403
            throw new Error("Forbidden")
        }

        return { seller: session.user }
    })
