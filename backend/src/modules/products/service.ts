import { db } from "../../db";
import { table_products } from "../../db/schemas/products_schemas";
import { tablecategories } from "../../db/schemas/category_schema"
import { eq, and } from "drizzle-orm"

interface createProductInput {
    name: string;
    description: string;
    category: string
    image: string;
    price: string;

}

export const createProduct = async (user_id: string, input: createProductInput) => {
    const categoryExists = await db.select()
        .from(tablecategories)
        .where(eq(tablecategories.name, input.category))
        .limit(1)

    if (!categoryExists.length) {
        return { success: false, message: "Categoria não encontrada" }
    }
    const existingProduct = await db.select().from(table_products).where(
        eq(table_products.user_id, user_id)).limit(1)

    if (existingProduct.length) {
        return { success: false, message: "Usuário já possui um produto" }
    }

    const [create] = await db.insert(table_products).values({
        user_id: user_id,
        category_name: input.category,
        name: input.name,
        description: input.description,
        image: input.image,
        price: input.price,
    }).returning()
    if (!create) {
        return { success: false, message: "Erro ao criar produto" }
    }
    return { success: true, message: "Produto criado com sucesso", data: create }
}

export const updateProduct = async (id: string, user_id: string,
    input: Partial<createProductInput>) => {

    const updateData: Partial<typeof table_products.$inferInsert> = {}

    if (input.name !== undefined) { updateData.name = input.name }
    if (input.description !== undefined) { updateData.description = input.description }
    if (input.image !== undefined) { updateData.image = input.image }
    if (input.price !== undefined) { updateData.price = input.price }
    if (input.category !== undefined) {
        const categoryExists = await db.select().from(tablecategories)
            .where(eq(tablecategories.name, input.category))
            .limit(1)

        if (!categoryExists.length) {
            return { success: false, message: "Categoria não encontrada" }
        }

        updateData.category_name = input.category
    }

    const update = await db.update(table_products).set({
        ...updateData
    }).where(and(eq(table_products.id, id),
        eq(table_products.user_id, user_id))).returning()

    if (!update || update.length === 0) {
        return { success: false, message: "Erro ao atualizar produto" }
    }
    return {
        success: true,
        message: "Produto atualizado com sucesso",
        data: update
    }
}

export const deleteProduct = async (id: string, user_id: string) => {
    const deleteProduct = await db.delete(table_products).where(and(
        eq(table_products.id, id),
        eq(table_products.user_id, user_id)
    )).returning()
    if (!deleteProduct || deleteProduct.length === 0) {
        return { success: false, message: "Erro ao deletar produto" }
    }
    return { success: true, message: "Produto deletado com sucesso" }
}

export const getByUserId = async (user_id: string) => {
    const getByUserIdProducts = await db.select().from(table_products).where(
        eq(table_products.user_id, user_id))

    return {
        success: true,
        message: "Produtos buscados com sucesso",
        data: getByUserIdProducts
    }
}

export const getAllProducts = async () => {
    try {
        console.log('Buscando produtos do banco...')
        const getProducts = await db.select().from(table_products)

        console.log('Produtos encontrados no banco:', getProducts)

        if (!getProducts || getProducts.length === 0) {
            console.log('Nenhum produto encontrado no banco')
            return {
                success: true,
                message: "Nenhum produto encontrado",
                data: []
            }
        }

        return {
            success: true,
            message: "Produtos buscados com sucesso",
            data: getProducts
        }
    } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        return {
            success: false,
            message: "Erro ao buscar produtos"
        }
    }
}


