import { createProduct, updateProduct, deleteProduct, getByUserId, getAllProducts }
    from "./service"
import { Elysia } from "elysia"
import { auth } from "../../modules/auth/auth"
import { t } from "elysia"

export const productsRoutes = (app: Elysia) => app
    .post("/products", async ({ body, set, request }) => {
        const session = await auth.api.getSession({
            headers: request.headers
        })
        if (!session) {
            set.status = 401
            return { success: false, message: "Unauthorized" }
        }
        const userId = session.user.id

        const data = await createProduct(userId, body)
        set.status = 201
        return { success: true, data }
    }, {
        body: t.Object({
            nome: t.String(),
            description: t.String(),
            image: t.String(),
            price: t.String(),
            history: t.String(),
        })
    })
    .put("/products/:id", async ({ body, params, set, request }) => {
        const session = await auth.api.getSession({
            headers: request.headers
        })
        if (!session) {
            set.status = 401
            return { success: false, message: "Unauthorized" }
        }
        const userId = session.user.id

        const data = await updateProduct(params.id, userId, body)
        set.status = 201
        return { success: true, data }
    }, {
        body: t.Object({
            nome: t.String(),
            description: t.String(),
            image: t.String(),
            price: t.String(),
            history: t.String(),
        })
    })
    .delete("/products/:id", deleteProduct)
    .get("/products/:id", getByUserId)
    .get("/products", getAllProducts)