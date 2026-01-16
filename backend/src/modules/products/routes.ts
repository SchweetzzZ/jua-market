import { createProduct, updateProduct, deleteProduct, getByUserId, getAllProducts } from "./service"
import { Elysia, t } from "elysia"
import { authMacro } from "../../modules/auth/macro"
import { checkPermission } from "../../modules/access-control/access-control"
import { auth } from "../../modules/auth/auth"

type User = typeof auth.$Infer.Session.user

export const productsRoutes = new Elysia()
    .use(authMacro)
    .post("/products", async ({ body, set, user }) => {
        const allowed = checkPermission(user.role, "products", "create")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para criar produtos" }
        }
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
        const allowed = checkPermission(user.role, "products", "update")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para atualizar produtos" }
        }
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
        const allowed = checkPermission(user.role, "products", "delete")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para deletar produtos" }
        }
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
        const allowed = checkPermission(user.role, "products", "read")
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

    .get("/products/all", async ({ set, user }: { set: any, user: User }) => {
        const allowed = checkPermission(user.role, "products", "read")
        if (!allowed) {
            set.status = 403
            return { success: false, message: "Sem permissão para ver produtos" }
        }
        const data = await getAllProducts()
        if (!data) {
            set.status = 404
            return { success: false, message: "Nenhum produto encontrado" }
        }
        set.status = 200
        return { success: true, data }
    }, {
        auth: true
    })