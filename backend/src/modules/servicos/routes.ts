import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { createServico, updateService, deletService, getByUserId, getAllServices, getServiceById } from "./service"
import { checkPermission } from "../../modules/access-control/access-control"

export const servicesRoutes = new Elysia()
    .use(authMacro)

    // Rota pública: Listar todos
    .get("/servicos/all", async ({ set }) => {
        const data = await getAllServices()
        set.status = 200
        return { success: true, data }
    })

    // Rota pública: Detalhes de um serviço
    .get("/servicos/:id", async ({ params, set }) => {
        const data = await getServiceById(params.id)
        if (!data.success) {
            set.status = 404
            return data
        }
        set.status = 200
        return data
    })

    // Rotas protegidas (Meus Serviços)
    .get("/servicos/me", async ({ set, user }) => {
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

    // Criar (Auth)
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

    // Atualizar (Auth)
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

    // Deletar (Auth)
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
        return data
    }, {
        auth: true
    })