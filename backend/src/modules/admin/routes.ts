import { Elysia, t } from "elysia"
import { adminGuard } from "./admin-guard"
import { auth } from "../auth/auth"
import { authMacro } from "../auth/macro"
import { checkPermission } from "../access-control/access-control"
import { getAllProducts } from "../products/service"
import { deleteProduct } from "../products/service"
import { getAllServices } from "../servicos/service"
import { deletService } from "../servicos/service"

export const adminRoutes = new Elysia({
    prefix: "/admin"
})
    .use(adminGuard)
    .use(authMacro)

    .get("/users", async ({ query, request: { headers } }) => {
        const { limit = 10, offset = 0, search = "" } = query as any;

        return await auth.api.listUsers({
            query: {
                limit: Number(limit),
                offset: Number(offset),
                filterField: search ? "email" : undefined,
                filterValue: search || undefined,
                filterOperator: "contains"
            },
            headers: await headers
        })
    })

    .get("/products", async ({ set, user }) => {
        const allowed = checkPermission(user.role, "products", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await getAllProducts()

        if (!data?.success) {
            set.status = 404
            return { success: false, message: "Nenhum produto encontrado", data: null }
        }

        return data
    }, { auth: true })

    .get("/services", async ({ set, user }) => {
        const allowed = checkPermission(user.role, "services", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Acesso negado", data: null }
        }

        const data = await getAllServices()

        if (!data?.success) {
            set.status = 404
            return { success: false, message: "Nenhum serviço encontrado", data: null }
        }

        return data
    }, { auth: true })

    .delete("/services/:id", async ({ params, user, set }) => {
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

        const data = await deleteProduct(params.id, user.id)

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


