import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { createServico, updateService, deletService, getByUserId, getAllServices, getServiceById } from "./service"
import { checkPermission } from "../../modules/access-control/access-control"
import { sellerGuard } from "../../modules/admin/seller-guard"

export const servicesRoutes = new Elysia()
    .use(authMacro)
    .get("/servicos", async ({ set, user, query }) => {
        try {
            const { limit = 9, offset = 0, search = "" } = query as any
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
            return { success: true, message: "Serviços buscados com sucesso", data: result.services, total: result.total }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao buscar serviços", data: null }
        }
    }, {
        auth: true
    })
    .get("/servicos/all", async ({ set, query }) => {
        try {
            const { limit = 9, offset = 0, search = "" } = query as any
            const result = await getAllServices({
                limit: Number(limit),
                offset: Number(offset),
                search: search
            })
            return { success: true, message: "Serviços buscados com sucesso", data: result.services, total: result.total }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Erro ao buscar todos os serviços", data: null }
        }
    })
    .get("/servicos/:id", async ({ params, set }) => {
        try {
            const data = await getServiceById(params.id)
            return { success: true, message: "Serviço encontrado com sucesso", data }
        } catch (error: any) {
            set.status = 404
            return { success: false, message: error.message || "Serviço não encontrado", data: null }
        }
    })
    .use(sellerGuard)
    .post("/servicos", async ({ body, set, user }) => {
        try {
            const allowed = checkPermission(user.role, "services", "create")
            if (!allowed) {
                set.status = 403
                return { success: false, message: "Sem permissão para criar serviços", data: null }
            }
            const data = await createServico(user.id, body)
            return { success: true, message: "Serviço criado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao criar serviço", data: null }
        }
    }, {
        auth: true,
        body: t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            price: t.String(),
            images: t.Array(
                t.Object({
                    imageUrl: t.String(),
                    imageKey: t.String(),
                })
            )
        })
    })

    .put("/servicos/:id", async ({ body, params, set, user }) => {
        try {
            const allowed = checkPermission(user.role, "services", "update")
            if (!allowed) {
                set.status = 403
                return { success: false, message: "Sem permissão para atualizar serviços", data: null }
            }
            const data = await updateService(params.id, user.id, body)
            return { success: true, message: "Serviço atualizado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao atualizar serviço", data: null }
        }
    }, {
        auth: true,
        body: t.Partial(
            t.Object({
                name: t.String(),
                description: t.String(),
                category: t.String(),
                price: t.String(),
                images: t.Array(
                    t.Object({
                        imageUrl: t.String(),
                        imageKey: t.String(),
                    })
                )
            })
        )
    })

    .delete("/servicos/:id", async ({ params, user, set }) => {
        try {
            const allowed = checkPermission(user.role, "services", "delete")
            if (!allowed) {
                set.status = 403
                return { success: false, message: "Sem permissão para deletar serviços", data: null }
            }
            const data = await deletService(params.id, user.id)
            return { success: true, message: "Serviço deletado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao deletar serviço", data: null }
        }
    }, {
        auth: true
    })

    .get("/servicos/me", async ({ user, query, set }) => {
        try {
            const { limit = 9, offset = 0, search = "" } = query as any
            const result = await getByUserId(user.id, {
                limit: Number(limit),
                offset: Number(offset),
                search: search
            })
            return { success: true, message: "Serviços buscados com sucesso", data: result.services, total: result.total }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao buscar serviços do usuário", data: null }
        }
    }, {
        auth: true
    })