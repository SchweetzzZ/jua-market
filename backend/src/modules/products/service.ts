import { db } from "../../db";
import { table_products } from "../../db/schemas/products_schemas";
import { tablecategories } from "../../db/schemas/category_schema"
import { eq, and, ilike, sql } from "drizzle-orm"
import { user } from "../../db/schemas/auth-schema"
import { deleteFromS3 } from "../../lib/s3";

interface createProductInput {
    name: string;
    description: string;
    category: string
    imageUrl: string;
    imageKey?: string;
    price: string;
}

//******create para admin*******
export const createProductAdmin = async (input: createProductInput, user_id: string) => {
    const categoryExists = await db.select()
        .from(tablecategories)
        .where(eq(tablecategories.name, input.category))
        .limit(1)

    if (!categoryExists.length) {
        throw new Error("Categoria não encontrada")
    }

    const [create] = await db.insert(table_products).values({
        user_id: user_id,
        category: input.category,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
        price: input.price,
    }).returning()

    if (!create) {
        throw new Error("Erro ao criar produto")
    }
    return create
}

//******create para vendedor/seller******
export const createProduct = async (user_id: string, input: createProductInput) => {
    const categoryExists = await db.select()
        .from(tablecategories)
        .where(eq(tablecategories.name, input.category))
        .limit(1)

    if (!categoryExists.length) {
        throw new Error("Categoria não encontrada")
    }

    const [create] = await db.insert(table_products).values({
        user_id: user_id,
        category: input.category,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
        price: input.price,
    }).returning()

    if (!create) {
        throw new Error("Erro ao criar produto")
    }
    return create
}

//*******update para admin********/
export const updateProductAdmin = async (id: string, input: Partial<createProductInput>) => {
    // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
    if (input.imageKey) {
        const currentProduct = await db.query.table_products.findFirst({
            where: eq(table_products.id, id)
        })

        if (currentProduct?.imageKey && currentProduct.imageKey !== input.imageKey) {
            await deleteFromS3(currentProduct.imageKey)
        }
    }

    const updateData: Partial<typeof table_products.$inferInsert> = {}

    if (input.name !== undefined) { updateData.name = input.name }
    if (input.description !== undefined) { updateData.description = input.description }
    if (input.imageUrl !== undefined) { updateData.imageUrl = input.imageUrl }
    if (input.imageKey !== undefined) { updateData.imageKey = input.imageKey }
    if (input.price !== undefined) { updateData.price = input.price }
    if (input.category !== undefined) {
        const categoryExists = await db.select().from(tablecategories)
            .where(eq(tablecategories.name, input.category))
            .limit(1)

        if (!categoryExists.length) {
            throw new Error("Categoria não encontrada")
        }

        updateData.category = input.category
    }

    const update = await db.update(table_products).set({
        ...updateData
    }).where(eq(table_products.id, id)).returning()

    if (!update || update.length === 0) {
        throw new Error("Erro ao atualizar produto")
    }
    return update
}

//*******update para vendedor*******/
export const updateProduct = async (id: string, user_id: string, input: Partial<createProductInput>) => {
    // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
    if (input.imageKey) {
        const currentProduct = await db.query.table_products.findFirst({
            where: and(
                eq(table_products.id, id),
                eq(table_products.user_id, user_id)
            )
        })

        if (currentProduct?.imageKey && currentProduct.imageKey !== input.imageKey) {
            await deleteFromS3(currentProduct.imageKey)
        }
    }

    const updateData: Partial<typeof table_products.$inferInsert> = {}

    if (input.name !== undefined) { updateData.name = input.name }
    if (input.description !== undefined) { updateData.description = input.description }
    if (input.imageUrl !== undefined) { updateData.imageUrl = input.imageUrl }
    if (input.imageKey !== undefined) { updateData.imageKey = input.imageKey }
    if (input.price !== undefined) { updateData.price = input.price }
    if (input.category !== undefined) {
        const categoryExists = await db.select().from(tablecategories)
            .where(eq(tablecategories.name, input.category))
            .limit(1)

        if (!categoryExists.length) {
            throw new Error("Categoria não encontrada")
        }

        updateData.category = input.category
    }

    const update = await db.update(table_products).set({
        ...updateData
    }).where(and(eq(table_products.id, id), eq(table_products.user_id, user_id))).returning()

    if (!update || update.length === 0) {
        throw new Error("Erro ao atualizar produto")
    }
    return update
}

//delete para admin
export const deleteProductAdmin = async (id: string) => {
    const deleted = await db
        .delete(table_products)
        .where(eq(table_products.id, id))
        .returning()

    if (!deleted || deleted.length === 0) {
        throw new Error("Erro ao deletar produto")
    }

    if (deleted && deleted[0]?.imageKey) {
        await deleteFromS3(deleted[0].imageKey)
    }

    return deleted
}

export const deleteProduct = async (id: string, user_id: string) => {
    const deleteProduct = await db.delete(table_products).where(and(
        eq(table_products.id, id),
        eq(table_products.user_id, user_id)
    )).returning()

    if (!deleteProduct || deleteProduct.length === 0) {
        throw new Error("Erro ao deletar produto")
    }
    if (deleteProduct && deleteProduct[0]?.imageKey) {
        await deleteFromS3(deleteProduct[0].imageKey)
    }
    return deleteProduct
}

export const getByUserId = async (user_id: string, options?: { search?: string; limit?: number; offset?: number }) => {
    const { search = "", limit = 9, offset = 0 } = options || {}

    let query = db.select().from(table_products).where(eq(table_products.user_id, user_id))

    if (search) {
        // @ts-ignore
        query = query.where(and(eq(table_products.user_id, user_id), ilike(table_products.name, `%${search}%`)))
    }

    const productsRows = await query.limit(limit).offset(offset)

    // Get total count for this user
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_products).where(eq(table_products.user_id, user_id))
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(and(eq(table_products.user_id, user_id), ilike(table_products.name, `%${search}%`)))
    }
    const [totalCount] = await countQuery

    return {
        products: productsRows,
        total: Number(totalCount.count)
    }
}

export const getAllProducts = async (options?: { search?: string; limit?: number; offset?: number }) => {
    const { search = "", limit = 9, offset = 0 } = options || {}

    let query = db.select().from(table_products)

    if (search) {
        // @ts-ignore
        query = query.where(ilike(table_products.name, `%${search}%`))
    }

    const productsRows = await query.limit(limit).offset(offset)

    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_products)
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(ilike(table_products.name, `%${search}%`))
    }
    const [totalCount] = await countQuery

    return {
        products: productsRows,
        total: Number(totalCount.count)
    }
}

export const getProductById = async (id: string) => {
    const [product] = await db.select().from(table_products).where(eq(table_products.id, id)).limit(1)

    if (!product) {
        throw new Error("Produto não encontrado")
    }

    return product
}

export const getUsers = async () => {
    const getUsers = await db.select().from(user)

    if (!getUsers || getUsers.length === 0) {
        return []
    }

    return getUsers
}

export const getUserById = async (id: string) => {
    const [getuser] = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1)

    if (!getuser) {
        throw new Error("Usuário não encontrado")
    }

    return getuser
}
