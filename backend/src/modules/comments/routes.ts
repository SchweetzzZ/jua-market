import { Elysia, t } from "elysia"
import { createComment, deleteComment, getCommentsByProductId, getCommentsByServiceId } from "./service"
import { authMacro } from "../auth/macro"

export const commentsRoutes = new Elysia()
    .use(authMacro)
    .post("/comments", async ({ body, set, user }) => {
        try {
            const data = await createComment(body, user.id)
            return { success: true, message: "Comentário criado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao criar comentário", data: null }
        }
    }, {
        auth: true,
        body: t.Object({
            product_id: t.Optional(t.String()),
            service_id: t.Optional(t.String()),
            comment: t.String(),
        })
    })
    .delete("/comments/:id", async ({ params, set, user }) => {
        try {
            const data = await deleteComment(params.id, user.id)
            return { success: true, message: "Comentário deletado com sucesso", data }
        } catch (error: any) {
            set.status = 400
            return { success: false, message: "Erro ao deletar comentário", data: null }
        }
    }, {
        auth: true
    })
    .get("/comments/product/:id", async ({ params, set }) => {
        try {
            const data = await getCommentsByProductId(params.id)
            return { success: true, message: "Comentários encontrados com sucesso", data }
        } catch (error: any) {
            set.status = 404
            return { success: false, message: "Comentários não encontrados", data: null }
        }
    })
    .get("/comments/service/:id", async ({ params, set }) => {
        try {
            const data = await getCommentsByServiceId(params.id)
            return { success: true, message: "Comentários encontrados com sucesso", data }
        } catch (error: any) {
            set.status = 404
            return { success: false, message: "Comentários não encontrados", data: null }
        }
    })

