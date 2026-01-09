import { db } from "../../db";
import { table_products } from "../../db/schemas/products_schemas";
import { eq } from "drizzle-orm"
import { auth } from "../../modules/auth/auth";

interface createProductInput {
    nome: string;
    description: string;
    image: string;
    price: string;
}

export const createProduct = async (user_id: string, input: createProductInput) => {
    const [create] = await db.insert(table_products).values({
        user_id,
        ...input
    }).returning()
    if (!create) {
        throw new Error("Erro ao criar produto")
    }
    return create
}

export const updateProduct = async (id: string, user_id: string,
    input: Partial<createProductInput>) => {
    const [update] = await db.update(table_products).set({
        ...input
    }).where(eq(table_products.id, id)).returning()
    if (!update) {
        throw new Error("Erro ao atualizar produto")
    }
    return update
}

export const delet

export const getByUserId

export const getAll
