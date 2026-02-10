import { createProduct, updateProduct, deleteProduct, getByUserId, getAllProducts, getProductById, getUsers, getUserById } from "./service"
import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { checkPermission } from "../../modules/access-control/access-control"
import { sellerGuard } from "../admin/seller-guard"

export const productsRoutes = new Elysia()
    .use(authMacro)
    .get("/products", async ({ set, user, query }) => {
        const { limit = 10, offset = 0, search = "" } = query as any
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
        if (!result || !result.success) {
            set.status = 404
            return { success: false, message: "Erro ao buscar produtos", data: null }
        }
        set.status = 200
        return result
    }, {
        auth: true
    })
    .post("/products", async ({ body, set, user }) => {
        const allowed = checkPermission(user.role, "products", "create")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para criar produtos", data: null }
        }
        const data = await createProduct(user.id, body)
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Erro ao criar produto", data: null }
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

    .put("/products/:id", async ({ body, params, set, user }) => {
        const allowed = checkPermission(user.role, "products", "update")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para atualizar produtos", data: null }
        }
        const data = await updateProduct(params.id, user.id, body)
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Erro ao atualizar produto", data: null }
        }
        set.status = 200
        return data
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

    .delete("/products/:id", async ({ params, user, set }) => {
        const allowed = checkPermission(user.role, "products", "delete")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para deletar produtos", data: null }
        }
        const data = await deleteProduct(params.id, user.id)
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Produto não encontrado", data: null }
        }
        set.status = 200
        return data
    }, {
        auth: true
    })


    .get("/products/all", async ({ set }) => {
        const data = await getAllProducts()
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Nenhum produto encontrado", data: null }

        }
        set.status = 200
        return data
    })
    .get("/products/:id", async ({ params, set }) => {
        const data = await getProductById(params.id)
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Produto não encontrado", data: null }
        }
        set.status = 200
        return data
    })
    .get("/productsId/:id", async ({ params, set }) => {
        console.log("teste")
        const data = await getProductById(params.id)
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Produto não encontrado", data: null }
        }
        set.status = 200
        return data
    })
    //rota para pegar usuarios(nao era pra estar aqui mas ok)
    .get("/users", async ({ set }) => {
        const data = await getUsers()
        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Nenhum usuário encontrado", data: null }
        }
        set.status = 200
        return data
    })
    .get("/users/:id", async ({ params, set }) => {
        const { id } = params

        const data = await getUserById(id)

        if (!data || !data.success) {
            set.status = 404
            return { success: false, message: "Usuário não encontrado", data: null }
        }

        set.status = 200
        return data
    })
