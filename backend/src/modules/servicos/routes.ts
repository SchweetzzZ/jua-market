import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { createServico, updateService, deletService, getByUserId, getAllServices } from "./service"
import { checkPermission } from "../../modules/access-control/access-control"
import { auth } from "../../modules/auth/auth"


export const servicesRoutes = new Elysia()
    .use(authMacro)
    .post("/servicos", async ({ body, set, user }) => {
        const allowed = checkPermission(user.role, "services", "create")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para criar serviços" }
        }
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
        const allowed = checkPermission(user.role, "services", "update")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para atualizar serviços" }
        }
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
        const allowed = checkPermission(user.role, "services", "delete")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para deletar serviços" }
        }
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
    .get("/servicos", async ({ set, user }) => {
        // Apenas quem pode criar (sellers/admins) pode ver "meus produtos"
        const allowed = checkPermission(user.role, "services", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado" }
        }
        const result = await getByUserId(user.id)
        if (!result.success) {
            set.status = 404
            return result
        }
        set.status = 200
        return result
    }, {
        auth: true
    })
    .get("/servicos/:id", async ({ user, set }) => {
        const allowed = checkPermission(user.role, "services", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para ver serviços" }
        }
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
