import { createProduct, updateProduct, deleteProduct, getByUserId, getAllProducts } from "./service"
import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"

export const productsRoutes = new Elysia()
    .use(authMacro)
    .post("/products", async ({ body, set, user }) => {
        const data = await createProduct(user.id, body)
        if (!data) {
            set.status = 404
            return { success: false, message: "Erro ao criar produto" }
        }
        set.status = 201
        return { success: true, data }
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
    .put("/products/:id", async ({ body, params, set, user }) => {
        const data = await updateProduct(params.id, user.id, body)
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
    .delete("/products/:id", async ({ params, user, set }) => {
        const data = await deleteProduct(params.id, user.id)
        if (!data) {
            set.status = 404
            return { success: false, message: "Produto não encontrado" }
        }
        set.status = 200
        return { success: true, data }
    }, {
        auth: true
    })
    //para admin
    .get("/products", async ({ set, user }) => {
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
    .get("/products/all", async ({ set }) => {
        const data = await getAllProducts()
        if (!data) {
            set.status = 404
            return { success: false, message: "Nenhum produto encontrado" }
        }
        set.status = 200
        return { success: true, data }
    })