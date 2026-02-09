import { Elysia, t } from "elysia"
import { adminGuard } from "./admin-guard"
import { auth } from "../auth/auth"
import { authMacro } from "../auth/macro"
import { checkPermission } from "../access-control/access-control"
import { getAllProducts, deleteProductAdmin, createProductAdmin, updateProduct } from "../products/service"
import { getAllServices, deletService, createServicoAdmin, updateService } from "../servicos/service"

export const adminRoutes = new Elysia({
    prefix: "/admin"
})
    .use(adminGuard)
    .use(authMacro)

    .post("/services", async ({ body, user, set }) => {
        if (!user) {
            set.status = 401
            return { success: false, message: "Usuário não autenticado", data: null }
        }
        const allowed = checkPermission(user.role, "services", "create")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        // Se body.userId for informado, usa ele, senão usa o id do admin
        const ownerId = body.userId || user.id
        const data = await createServicoAdmin(ownerId, body)

        if (!data.success) {
            set.status = 404
            return { success: false, message: "Erro ao criar serviço", data: null }
        }

        return data
    }, {
        auth: true,
        body: t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            imageUrl: t.String(),
            price: t.String(),
            userId: t.Optional(t.String()), // Adicionado id opcional
        })
    })

    .post("/products", async ({ body, user, set }) => {
        if (!user) {
            set.status = 401
            return { success: false, message: "Usuário não autenticado", data: null }
        }
        const allowed = checkPermission(user.role, "products", "create")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        // Se body.userId for informado, usa ele, senão usa o id do admin
        const ownerId = body.userId || user.id
        const data = await createProductAdmin(body, ownerId)

        if (!data.success) {
            set.status = 404
            return { success: false, message: "Erro ao criar produto", data: null }
        }

        return data
    }, {
        auth: true,
        body: t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            imageUrl: t.String(),
            price: t.String(),
            userId: t.Optional(t.String()), // Adicionado id opcional
        })
    })

    .put("/products/:id", async ({ body, params, user, set }) => {
        if (!user) {
            set.status = 401
            return { success: false, message: "Usuário não autenticado", data: null }
        }
        const allowed = checkPermission(user.role, "products", "update")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await updateProduct(params.id, user.id, body)

        if (!data.success) {
            set.status = 404
            return { success: false, message: "Erro ao atualizar produto", data: null }
        }

        return data
    }, {
        auth: true,
        body: t.Partial(t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            imageUrl: t.String(),
            price: t.String(),
        }))
    })

    .put("/services/:id", async ({ body, params, user, set }) => {
        if (!user) {
            set.status = 401
            return { success: false, message: "Usuário não autenticado", data: null }
        }
        const allowed = checkPermission(user.role, "services", "update")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await updateService(params.id, user.id, body)

        if (!data.success) {
            set.status = 404
            return { success: false, message: "Erro ao atualizar serviço", data: null }
        }

        return data
    }, {
        auth: true,
        body: t.Partial(t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            imageUrl: t.String(),
            price: t.String(),
        }))
    })

    .delete("/services/:id", async ({ params, user, set }) => {
        console.log("DELETE PRODUCT HIT:", params.id)
        if (!user) {
            set.status = 401
            return { success: false, message: "Usuário não autenticado", data: null }
        }
        const allowed = checkPermission(user.role, "services", "delete")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await deletService(params.id, user.id)

        if (!data.success) {
            set.status = 404
            return { success: false, message: "Serviço não encontrado", data: null }
        }

        return data
    }, { auth: true })

    .delete("/products/:id", async ({ params, user, set }) => {
        if (!user) {
            set.status = 401
            return { success: false, message: "Usuário não autenticado", data: null }
        }
        const allowed = checkPermission(user.role, "products", "delete")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await deleteProductAdmin(params.id)

        if (!data.success) {
            set.status = 404
            return { success: false, message: "Produto não encontrado", data: null }
        }

        return data
    }, { auth: true })

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

    .post("/unban-user", async ({ body, request: { headers } }) => {
        const { userId } = body
        await auth.api.unbanUser({
            body: { userId },
            headers
        })
        return {
            success: true,
            message: "User unbanned successfully"
        }
    }, {
        body: t.Object({
            userId: t.String()
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

    .post("/change-password", async ({ body, request: { headers } }) => {
        const { userId, newPassword } = body

        await auth.api.setUserPassword({
            body: {
                userId,
                newPassword
            },
            headers
        })

        // 2. Revogar outras sessões (opcional - se necessário)
        // Você precisaria implementar esta lógica separadamente
        // Por exemplo:
        // await auth.api.revokeAllUserSessions({ userId })

        return {
            success: true,
            message: "Password changed successfully"
        }
    }, {
        body: t.Object({
            userId: t.String(),
            newPassword: t.String()
        })
    })

    .get("/users", async ({ query, request: { headers } }) => {
        const { limit = 10, offset = 0, search = "" } = query as any;

        // Determine if search is email or name
        const isEmail = search.includes("@");

        return await auth.api.listUsers({
            query: {
                limit: Number(limit),
                offset: Number(offset),
                filterField: isEmail ? "email" : "name",
                filterValue: search || undefined,
                filterOperator: "contains"
            },
            headers: await headers
        })
    })

    .get("/products", async ({ set, user, query }) => {
        const { limit = 10, offset = 0, search = "" } = query as any;
        const allowed = checkPermission(user.role, "products", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await getAllProducts({
            limit: Number(limit),
            offset: Number(offset),
            search
        })

        if (!data?.success) {
            set.status = 404
            return { success: false, message: "Erro ao buscar produtos", data: null }
        }

        return data
    }, { auth: true })

    .get("/services", async ({ set, user, query }) => {
        const { limit = 10, offset = 0, search = "" } = query as any;
        const allowed = checkPermission(user.role, "services", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await getAllServices({
            limit: Number(limit),
            offset: Number(offset),
            search
        })

        if (!data?.success) {
            set.status = 404
            return { success: false, message: "Erro ao buscar serviços", data: null }
        }

        return data
    }, { auth: true })

