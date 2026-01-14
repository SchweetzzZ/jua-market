import { Elysia } from "elysia"
import { auth } from "../../modules/auth/auth"

export const authGuard = new Elysia({ name: "auth-guard" })
    .derive(async ({ request: { headers }, set }) => {
        const session = await auth.api.getSession({ headers })

        if (!session) {
            set.status = 401
            throw new Error("Unauthorized")
        }

        return {
            user: session.user,
            session: session.session
        }
    })
