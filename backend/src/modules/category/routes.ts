import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { createCategory } from "./service"

export const categoryRoutes = new Elysia()
    .use(authMacro)
    .post("/category", async ({ body, set, user }) => {
        const data = await createCategory(user.id, body)
        set.status = 201
        return { success: true, data }
    }, {
        auth: true,
        body: t.Object({
            name: t.String(),
            description: t.String(),
        })
    })