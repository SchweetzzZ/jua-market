import { Elysia, t } from "elysia"
import { createCategory, updateCatgory, deleteCategory, getCategory, getAllCategories } from "./service"
import { adminGuard } from "../admin/admin-guard"

export const categoryRoutes = new Elysia()
    .use(adminGuard)
    .post("/category", async ({ body, set }) => {
        const data = await createCategory(body)
        set.status = 201
        return { success: true, data }
    }, {
        body: t.Object({
            name: t.String(),
            description: t.String(),
        })
    })
    .put("/category/:id", async ({ body, params, set }) => {
        const data = await updateCatgory(params.id, body)
        set.status = 200
        return { success: true, data }
    }, {
        body: t.Partial(
            t.Object({
                name: t.String(),
                description: t.String(),
            })
        )
    })
    .delete("/category/:id", async ({ params, set }) => {
        const data = await deleteCategory(params.id)
        set.status = 200
        return { success: true, data }
    })
    .get("/category/:id", async ({ params, set }) => {
        const data = await getCategory(params.id)
        set.status = 200
        return { success: true, data }
    })
    .get("/category", async ({ set }) => {
        const data = await getAllCategories()
        set.status = 200
        return { success: true, data }
    })