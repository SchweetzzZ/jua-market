import { Elysia, t } from "elysia"
import { adminGuard } from "./admin-guard"
import { auth } from "../auth/auth"
import { authMacro } from "../auth/macro"
import { checkPermission } from "../access-control/access-control"
import { getAllProducts, deleteProductAdmin, createProductAdmin, updateProductAdmin } from "../products/service"
import { getAllServices, deletService, createServicoAdmin, updateServiceAdmin } from "../servicos/service"

export const adminRoutes = new Elysia({
    prefix: "/admin"
})
    .use(adminGuard)
    .use(authMacro)

    .post("/services", async ({ body, user, set }) => {
        try {
            const ownerId = body.userId || user.id
            const data = await createServicoAdmin(ownerId, body)
            return { success: true, message: "Service created successfully", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error creating service", data: null }
        }
    }, {
        auth: true,
        body: t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            imageUrl: t.String(),
            price: t.String(),
            userId: t.Optional(t.String()),
        })
    })

    .post("/products", async ({ body, user, set }) => {
        try {
            const ownerId = body.userId || user.id
            const data = await createProductAdmin(body, ownerId)
            return { success: true, message: "Product created successfully", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error creating product", data: null }
        }
    }, {
        auth: true,
        body: t.Object({
            name: t.String(),
            description: t.String(),
            category: t.String(),
            imageUrl: t.String(),
            price: t.String(),
            userId: t.Optional(t.String()),
        })
    })

    .put("/products/:id", async ({ body, params, set }) => {
        try {
            const data = await updateProductAdmin(params.id, body)
            return { success: true, message: "Product updated successfully", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error updating product", data: null }
        }
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

    .put("/services/:id", async ({ body, params, set }) => {
        try {
            const data = await updateServiceAdmin(params.id, body)
            return { success: true, message: "Service updated successfully", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error updating service", data: null }
        }
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
        try {
            const data = await deletService(params.id, user.id)
            return { success: true, message: "Service deleted successfully", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error deleting service", data: null }
        }
    }, { auth: true })

    .delete("/products/:id", async ({ params, set }) => {
        try {
            const data = await deleteProductAdmin(params.id)
            return { success: true, message: "Product deleted successfully", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error deleting product", data: null }
        }
    }, { auth: true })

    .post("/ban-user", async ({ body, request: { headers }, set }) => {
        try {
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
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error banning user", data: null }
        }
    }, {
        body: t.Object({
            userId: t.String(),
            reason: t.Optional(t.String())
        })
    })

    .post("/unban-user", async ({ body, request: { headers }, set }) => {
        try {
            const { userId } = body
            await auth.api.unbanUser({
                body: { userId },
                headers
            })
            return {
                success: true,
                message: "User unbanned successfully"
            }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error unbanning user", data: null }
        }
    }, {
        body: t.Object({
            userId: t.String()
        })
    })

    .post("/impersonate", async ({ body, request: { headers }, set }) => {
        try {
            const { userId } = body
            return await auth.api.impersonateUser({
                body: { userId },
                headers
            })
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error impersonating user", data: null }
        }
    }, {
        body: t.Object({
            userId: t.String()
        })
    })

    .post("/change-password", async ({ body, request: { headers }, set }) => {
        try {
            const { userId, newPassword } = body

            await auth.api.setUserPassword({
                body: {
                    userId,
                    newPassword
                },
                headers
            })

            return {
                success: true,
                message: "Password changed successfully"
            }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error changing password", data: null }
        }
    }, {
        body: t.Object({
            userId: t.String(),
            newPassword: t.String()
        })
    })

    .get("/users", async ({ query, request: { headers }, set }) => {
        try {
            const { limit = 9, offset = 0, search = "" } = query as any;
            const isEmail = search.includes("@");

            const listData = await auth.api.listUsers({
                query: {
                    limit: Number(limit),
                    offset: Number(offset),
                    filterField: isEmail ? "email" : "name",
                    filterValue: search || undefined,
                    filterOperator: "contains"
                },
                headers: await headers
            })

            return {
                success: true,
                message: "Usuários listados com sucesso",
                data: (listData as any).users || [],
                total: (listData as any).total || 0
            }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error listing users", data: null }
        }
    })

    .get("/products", async ({ query, set }) => {
        try {
            const { limit = 100, offset = 0, search = "" } = query as any;
            const result = await getAllProducts({
                limit: Number(limit),
                offset: Number(offset),
                search
            })
            return { success: true, message: "Produtos buscados com sucesso", data: result.products, total: result.total }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error listing products", data: null }
        }
    }, { auth: true })

    .get("/services", async ({ query, set }) => {
        try {
            const { limit = 100, offset = 0, search = "" } = query as any;
            const result = await getAllServices({
                limit: Number(limit),
                offset: Number(offset),
                search
            })
            return { success: true, message: "Serviços buscados com sucesso", data: result.services, total: result.total }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Error listing services", data: null }
        }
    }, { auth: true })
