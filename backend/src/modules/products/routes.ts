import { createProduct, updateProduct, deleteProduct, getByUserId, getAllProducts, getProductById, getUsers, getUserById } from "./service"
import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { checkPermission } from "../../modules/access-control/access-control"
import { sellerGuard } from "../admin/seller-guard"

export const productsRoutes = new Elysia()
    .use(authMacro)
    .get("/products", async ({ set, user, query }) => {
        try {
            const { limit = 9, offset = 0, search = "" } = query as any
            const allowed = checkPermission(user.role, "products", "read")
            if (!allowed) {
                set.status = 403
                return { success: false, message: "Acesso negado", data: null }
            }
            const result = await getByUserId(user.id, {
                limit: Number(limit),
                offset: Number(offset),
                search: search
            })
            return { success: true, message: "Produtos buscados com sucesso", data: result.products, total: result.total }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao buscar produtos", data: null }
        }
    }, {
        auth: true
    })
    .get("/products/all", async ({ set, query }) => {
        try {
            const { limit = 9, offset = 0, search = "" } = query as any
            const result = await getAllProducts({
                limit: Number(limit),
                offset: Number(offset),
                search
            })
            return { success: true, message: "Produtos buscados com sucesso", data: result.products, total: result.total }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao buscar todos os produtos", data: null }
        }
    })
    .get("/products/:id", async ({ params, set }) => {
        try {
            const data = await getProductById(params.id)
            return { success: true, message: "Produto encontrado com sucesso", data }
        } catch (error: any) {
            set.status = 404
            return { success: false, message: "Produto não encontrado", data: null }
        }
    })
    .get("/productsId/:id", async ({ params, set }) => {
        try {
            const data = await getProductById(params.id)
            return { success: true, message: "Produto encontrado com sucesso", data }
        } catch (error: any) {
            set.status = 404
            return { success: false, message: error.message || "Produto não encontrado", data: null }
        }
    })
    .get("/users", async ({ set }) => {
        try {
            const data = await getUsers()
            return { success: true, message: "Usuários encontrados com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Erro ao buscar usuários", data: null }
        }
    })
    .get("/users/:id", async ({ params, set }) => {
        try {
            const data = await getUserById(params.id)
            return { success: true, message: "Usuário encontrado com sucesso", data }
        } catch (error: any) {
            set.status = 404
            return { success: false, message: error.message || "Usuário não encontrado", data: null }
        }
    })
    .use(sellerGuard)
    .post("/products", async ({ body, set, user }) => {
        try {
            const allowed = checkPermission(user.role, "products", "create")
            if (!allowed) {
                set.status = 403
                return { success: false, message: "Sem permissão para criar produtos", data: null }
            }
            const data = await createProduct(user.id, body)
            return { success: true, message: "Produto criado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Erro ao criar produto", data: null }
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
    .put("/products/:id", async ({ body, params, set, user }) => {
        try {
            const allowed = checkPermission(user.role, "products", "update")
            if (!allowed) {
                set.status = 403
                return { success: false, message: "Sem permissão para atualizar produtos", data: null }
            }
            const data = await updateProduct(params.id, user.id, body)
            return { success: true, message: "Produto atualizado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Erro ao atualizar produto", data: null }
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

    .delete("/products/:id", async ({ params, user, set }) => {
        try {
            const allowed = checkPermission(user.role, "products", "delete")
            if (!allowed) {
                set.status = 403
                return { success: false, message: "Sem permissão para deletar produtos", data: null }
            }
            const data = await deleteProduct(params.id, user.id)
            return { success: true, message: "Produto deletado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: error.message || "Erro ao deletar produto", data: null }
        }
    }, {
        auth: true
    })
