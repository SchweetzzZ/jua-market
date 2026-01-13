import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { createServico, updateService, deletService, getByUserId, getAllServices } from "./service"

export const servicesRoutes = new Elysia()
    .use(authMacro)
    .post("/servicos", async ({ body, set, user }) => {
        const data = await createServico(user.id, body)
        if (!data.success) {
            set.status = 400
            return data
        }
        set.status = 201
        return data
    }, {
        auth: true,
        body: t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            image: t.String(),
            price: t.String(),
        })
    })
    .put("/servicos/:id", async ({ body, params, set, user }) => {
        const data = await updateService(params.id, user.id, body)
        set.status = 200
        return { success: true, data }
    }, {
        auth: true,
        body: t.Partial(
            t.Object({
                name: t.String(),
                description: t.String(),
                category: t.String(),
                image: t.String(),
                price: t.String(),
            })
        )
    })
    .delete("/servicos/:id", async ({ params, user, set }) => {
        const data = await deletService(params.id, user.id)
        if (!data) {
            set.status = 404
            return { success: false, message: "Servico não encontrado" }
        }
        set.status = 200
        return { success: true, data }
    }, {
        auth: true
    })

    .get("/servicos/:id", async ({ user, set }) => {
        const data = await getByUserId(user.id)
        if (!data) {
            set.status = 404
            return { success: false, message: "Servico não encontrado" }
        }
        set.status = 200
        return { success: true, data }
    }, {
        auth: true
    })
    .get("/servicos", async ({ set }) => {
        const data = await getAllServices()
        set.status = 200
        return { success: true, data }
    })
