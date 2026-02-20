import { eq, and, ilike, sql, asc } from "drizzle-orm";
import { db } from "../../db";
import { table_products } from "../../db/schemas/products_schemas";
import { table_product_image } from "../../db/schemas/products_image_schema";
import { user } from "../../db/schemas/auth-schema";
import { tablecategories } from "../../db/schemas/category_schema";
import { deleteFromS3 } from "../../lib/s3";

interface createProductInput {
    name: string
    description: string
    category: string
    price: string
    images: {
        imageUrl: string
        imageKey: string
    }[]
}
interface createProductInputAdmin extends createProductInput {
    ownerUserId?: string
}

//******create para admin*******
export const createProductAdmin = async (input: createProductInputAdmin, adminUserId: string) => {
    return await db.transaction(async (tx) => {
        const ownerId = input.ownerUserId ?? adminUserId
        if (input.ownerUserId) {
            const userExists = await tx.query.user.findFirst({
                where: eq(user.id, input.ownerUserId)
            })
            if (!userExists) {
                throw new Error("Usuario não encontrado")
            }
        }

        const categoryExists = await tx.select()
            .from(tablecategories)
            .where(eq(tablecategories.name, input.category))
            .limit(1)

        if (!categoryExists.length) {
            throw new Error("Categoria não encontrada")
        }

        const [create] = await tx.insert(table_products).values({
            user_id: ownerId,
            category: input.category,
            name: input.name,
            description: input.description,
            price: input.price,
        }).returning()

        if (!create) {
            throw new Error("Erro ao criar produto")
        }
        if (input.images?.length) {
            await tx.insert(table_product_image).values(
                input.images.map((img, index) => ({
                    product_id: create.id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return create
    })
}

//******create para vendedor/seller******
export const createProduct = async (user_id: string, input: createProductInput) => {
    return await db.transaction(async (tx) => {
        const categoryExists = await tx.select()
            .from(tablecategories)
            .where(eq(tablecategories.name, input.category))
            .limit(1)

        if (!categoryExists.length) {
            throw new Error("Categoria não encontrada")
        }

        const [create] = await tx.insert(table_products).values({
            user_id: user_id,
            category: input.category,
            name: input.name,
            description: input.description,
            price: input.price,
        }).returning()

        if (!create) {
            throw new Error("Erro ao criar produto")
        }
        if (input.images?.length) {
            await tx.insert(table_product_image).values(
                input.images.map((img, index) => ({
                    product_id: create.id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return create
    })
}

//*******update para admin********//
export const updateProductAdmin = async (id: string, input: Partial<createProductInput>) => {
    // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
    return await db.transaction(async (tx) => {
        const currentProduct = await tx.query.table_products.findFirst({
            where: eq(table_products.id, id)
        })
        if (!currentProduct) {
            throw new Error("Produto não encontrado")
        }

        const updateData: Partial<typeof table_products.$inferInsert> = {}

        if (input.name !== undefined) { updateData.name = input.name }
        if (input.description !== undefined) { updateData.description = input.description }
        if (input.price !== undefined) { updateData.price = input.price }
        if (input.category !== undefined) {
            const categoryExists = await tx.select().from(tablecategories)
                .where(eq(tablecategories.name, input.category))
                .limit(1)

            if (!categoryExists.length) {
                throw new Error("Categoria não encontrada")
            }

            updateData.category = input.category
        }

        const update = await tx.update(table_products).set({
            ...updateData
        }).where(eq(table_products.id, id)).returning()

        if (!update || update.length === 0) {
            throw new Error("Erro ao atualizar produto")
        }
        //1 buscar imagens atuais
        if (input.images) {
            //pegar imagens atuais
            const currentImages = await tx.select().from(table_product_image).where(
                eq(table_product_image.product_id, id)
            )

            const newKeys = new Set(input.images.map(img => img.imageKey));

            //2 deletar do S3 apenas as que não estão no novo conjunto
            for (const img of currentImages) {
                if (!newKeys.has(img.image_key)) {
                    await deleteFromS3(img.image_key)
                }
            }
            //3deletar do banco para reinserir com novas posições
            await tx.delete(table_product_image).where(eq(table_product_image.product_id, id))
        }
        if (input.images?.length) {
            //4 inserir novas imagens
            await tx.insert(table_product_image).values(
                input.images.map((img, index) => ({
                    product_id: id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return update[0]
    })
}

//*******update para vendedor*******/
export const updateProduct = async (id: string, user_id: string, input: Partial<createProductInput>) => {
    // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
    return await db.transaction(async (tx) => {
        const currentProduct = await tx.query.table_products.findFirst({
            where: and(
                eq(table_products.id, id),
                eq(table_products.user_id, user_id)
            )
        })
        if (!currentProduct) {
            throw new Error("Produto não encontrado")
        }

        const updateData: Partial<typeof table_products.$inferInsert> = {}

        if (input.name !== undefined) { updateData.name = input.name }
        if (input.description !== undefined) { updateData.description = input.description }
        if (input.price !== undefined) { updateData.price = input.price }
        if (input.category !== undefined) {
            const categoryExists = await tx.select().from(tablecategories)
                .where(eq(tablecategories.name, input.category))
                .limit(1)

            if (!categoryExists.length) {
                throw new Error("Categoria não encontrada")
            }

            updateData.category = input.category
        }


        const update = await tx.update(table_products).set({
            ...updateData
        }).where(and(
            eq(table_products.id, id),
            eq(table_products.user_id, user_id))).returning()

        if (!update || update.length === 0) {
            throw new Error("Erro ao atualizar produto")
        }
        //1 buscar imagens atuais
        if (input.images) {
            //pegar imagens atuais
            const currentImages = await tx.select().from(table_product_image).where(
                eq(table_product_image.product_id, id)
            )

            const newKeys = new Set(input.images.map(img => img.imageKey));

            //2 deletar do S3 apenas as que não estão no novo conjunto
            for (const img of currentImages) {
                if (!newKeys.has(img.image_key)) {
                    await deleteFromS3(img.image_key)
                }
            }
            //3deletar do banco para reinserir com novas posições
            await tx.delete(table_product_image).where(eq(table_product_image.product_id, id))
        }
        if (input.images?.length) {
            //4 inserir novas imagens
            await tx.insert(table_product_image).values(
                input.images.map((img, index) => ({
                    product_id: id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return update
    })
}

//delete para admin
export const deleteProductAdmin = async (id: string) => {
    return await db.transaction(async (tx) => {
        //1 Buscar imagens do produto
        const images = await tx.select().from(table_product_image).where(
            eq(table_product_image.product_id, id)
        )
        //2 deletar imagens do S3
        for (const img of images) {
            await deleteFromS3(img.image_key)
        }
        //3 deletar imagens do banco
        await tx.delete(table_product_image).where(eq(table_product_image.product_id, id))

        //4 deletar produto
        const deleted = await tx
            .delete(table_products)
            .where(eq(table_products.id, id))
            .returning()

        if (!deleted || deleted.length === 0) {
            throw new Error("Erro ao deletar produto")
        }

        return deleted
    })
}

export const deleteProduct = async (id: string, user_id: string) => {
    return await db.transaction(async (tx) => {
        const images = await tx.select().from(table_product_image).where(
            eq(table_product_image.product_id, id)
        )
        for (const img of images) {
            await deleteFromS3(img.image_key)
        }
        await tx.delete(table_product_image).where(eq(table_product_image.product_id, id))

        const deleteProduct = await tx.delete(table_products).where(and(
            eq(table_products.id, id),
            eq(table_products.user_id, user_id)
        )).returning()

        if (!deleteProduct || deleteProduct.length === 0) {
            throw new Error("Erro ao deletar produto")
        }
    })
}

export const getByUserId = async (user_id: string, options?: { search?: string; limit?: number; offset?: number }) => {
    const { search = "", limit = 9, offset = 0 } = options || {}

    let query = db.select().from(table_products).where(eq(table_products.user_id, user_id))

    if (search) {
        // @ts-ignore
        query = query.where(and(eq(table_products.user_id, user_id), ilike(table_products.name, `%${search}%`)))
    }

    const productsRows = await query.limit(limit).offset(offset)

    const productsWithImages = await Promise.all(
        productsRows.map(async (product) => {
            const images = await db
                .select()
                .from(table_product_image)
                .where(eq(table_product_image.product_id, product.id))
                .orderBy(asc(table_product_image.position))

            return {
                ...product,
                images: images.map(img => ({
                    imageUrl: img.image_url,
                    imageKey: img.image_key
                })),
                imageUrl: images[0]?.image_url || null
            }
        })
    )

    // Get total count for this user
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_products).where(eq(table_products.user_id, user_id))
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(and(eq(table_products.user_id, user_id), ilike(table_products.name, `%${search}%`)))
    }
    const [totalCount] = await countQuery

    return {
        products: productsWithImages,
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

    const productsWithImages = await Promise.all(
        productsRows.map(async (product) => {
            const images = await db
                .select()
                .from(table_product_image)
                .where(eq(table_product_image.product_id, product.id))
                .orderBy(asc(table_product_image.position))

            return {
                ...product,
                images: images.map(img => ({
                    imageUrl: img.image_url,
                    imageKey: img.image_key
                })),
                imageUrl: images[0]?.image_url || null
            }
        })
    )

    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_products)
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(ilike(table_products.name, `%${search}%`))
    }
    const [totalCount] = await countQuery

    return {
        products: productsWithImages,
        total: Number(totalCount.count)
    }
}

export const getProductById = async (id: string) => {
    const [product] = await db.select().from(table_products).where(eq(table_products.id, id)).limit(1)

    if (!product) {
        throw new Error("Produto não encontrado")
    }

    const images = await db
        .select()
        .from(table_product_image)
        .where(eq(table_product_image.product_id, product.id))
        .orderBy(asc(table_product_image.position))

    return {
        ...product,
        images: images.map(img => ({
            imageUrl: img.image_url,
            imageKey: img.image_key
        })),
        imageUrl: images[0]?.image_url || null
    }
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
