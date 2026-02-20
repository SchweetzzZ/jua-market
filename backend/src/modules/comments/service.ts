import { table_comments } from "../../db/schemas/comments_schema";
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { table_products } from "../../db/schemas/products_schemas";
import { table_servicos } from "../../db/schemas/servicos_schema";
import { user as userTable } from "../../db/schemas/auth-schema";

interface createCommentInput {
    comment: string;
    product_id?: string;
    service_id?: string;
}

export const createComment = async (input: createCommentInput, user_id: string) => {

    if (input.product_id && input.service_id) {
        throw new Error("Você não pode criar um comentário para um produto e um serviço")
    }
    if (!input.product_id && !input.service_id) {
        throw new Error("Você precisa especificar um produto ou um serviço")
    }


    if (input.product_id) {
        const product = await db.select().from(table_products).where(eq(table_products.id, input.product_id)).limit(1)

        if (product.length === 0) {
            throw new Error("Produto não encontrado")
        }
    }
    if (input.service_id) {
        const service = await db.select().from(table_servicos).where(eq(table_servicos.id, input.service_id)).limit(1)

        if (service.length === 0) {
            throw new Error("Serviço não encontrado")
        }
    }

    const [comment] = await db.insert(table_comments).values({
        comment: input.comment,
        user_id: user_id,
        product_id: input.product_id ?? null,
        service_id: input.service_id ?? null,
    }).returning()

    if (!comment) {
        throw new Error("Comment not created")
    }

    return comment
}
export const deleteComment = async (comment_id: string, user_id: string) => {
    const comment = await db.select().from(table_comments).where(eq(table_comments.id, comment_id)).limit(1)

    if (comment.length === 0) {
        throw new Error("Comment not found")
    }

    const isOwner = comment[0].user_id === user_id

    if (!isOwner) {
        throw new Error("You are not authorized to delete this comment")
    }

    const [deleted] = await db.delete(table_comments).where(eq(table_comments.id, comment_id)).returning()

    if (!deleted) {
        throw new Error("Comment not deleted")
    }

    return deleted
}

export const getCommentsByProductId = async (product_id: string) => {
    const comments = await db.select({
        id: table_comments.id,
        comment: table_comments.comment,
        user_id: table_comments.user_id,
        product_id: table_comments.product_id,
        service_id: table_comments.service_id,
        created_at: table_comments.createdAt,
        user: {
            name: userTable.name,
            image: userTable.image,
        }
    })
        .from(table_comments)
        .leftJoin(userTable, eq(table_comments.user_id, userTable.id))
        .where(eq(table_comments.product_id, product_id))

    return comments
}

export const getCommentsByServiceId = async (service_id: string) => {
    const comments = await db.select({
        id: table_comments.id,
        comment: table_comments.comment,
        user_id: table_comments.user_id,
        product_id: table_comments.product_id,
        service_id: table_comments.service_id,
        created_at: table_comments.createdAt,
        user: {
            name: userTable.name,
            image: userTable.image,
        }
    })
        .from(table_comments)
        .leftJoin(userTable, eq(table_comments.user_id, userTable.id))
        .where(eq(table_comments.service_id, service_id))

    return comments
}
