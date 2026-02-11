import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { createServico, updateService, deletService, getByUserId, getAllServices, getServiceById } from "./service"
import { checkPermission } from "../../modules/access-control/access-control"
import { sellerGuard } from "../../modules/admin/seller-guard"

export const servicesRoutes = new Elysia()
    .use(authMacro)
    .get("/servicos", async ({ set, user, query }) => {
        const { limit = 10, offset = 0, search = "" } = query as any
        const allowed = checkPermission(user.role, "services", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }
        const result = await getByUserId(user.id,
            {
                limit: Number(limit),
                offset: Number(offset),
                search: search
            })
        if (!result || !result.success) {
            set.status = 404
            return { success: false, message: "Erro ao buscar produtos", data: null }
        }
        set.status = 200
        return result
    }, {
        auth: true
    })
    .get("/servicos/all", async ({ set, query }) => {
        const { limit = 10, offset = 0, search = "" } = query as any
        const data = await getAllServices({
            limit: Number(limit),
            offset: Number(offset),
            search: search
        })
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Nenhum serviço encontrado", data: null }
        }
        set.status = 200
        return data
    })
    .use(sellerGuard)
    .post("/servicos", async ({ body, set, user }) => {
        const allowed = checkPermission(user.role, "services", "create")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para criar serviços", data: null }
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
            imageUrl: t.String(),
            price: t.String(),
        })
    })

    .put("/servicos/:id", async ({ body, params, set, user }) => {
        const allowed = checkPermission(user.role, "services", "update")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para atualizar serviços", data: null }
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
                imageUrl: t.String(),
                price: t.String(),
            })
        )
    })

    .delete("/servicos/:id", async ({ params, user, set }) => {
        const allowed = checkPermission(user.role, "services", "delete")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para deletar serviços", data: null }
        }
        const data = await deletService(params.id, user.id)
        if (!data) {
            set.status = 404
            return { success: false, message: "Servico não encontrado", data: null }
        }
        set.status = 200
        return data
    }, {
        auth: true
    })


    .get("/servicos/:id", async ({ params, set }) => {
        const data = await getServiceById(params.id)
        if (!data.success) {
            set.status = 404
            return data
        }
        set.status = 200
        return data
    })

    .get("/servicos/me", async ({ set, user, query }) => {
        const { limit = 10, offset = 0, search = "" } = query as any
        const allowed = checkPermission(user.role, "services", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }
        const result = await getByUserId(user.id, {
            limit: Number(limit),
            offset: Number(offset),
            search: search
        })
        if (!result.success) {
            set.status = 404
            return result
        }
        set.status = 200
        return result
    }, {
        auth: true
    })