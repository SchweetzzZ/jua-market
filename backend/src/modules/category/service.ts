import { db } from "../../db"
import { tablecategories } from "../../db/schemas/category_schema"
import { eq } from "drizzle-orm"

interface createCategoryInput {
    name: string;
    description: string;
}

export const createCategory = async (user_id: string, input: createCategoryInput) => {
    const existingCategory = await db.select().from(tablecategories).where(
        eq(tablecategories.userId, user_id))

    if (existingCategory) {
        return { success: false, message: "User already has a category" }
    }

    const [create] = await db.insert(tablecategories).values({
        userId: user_id,
        name: input.name,
        description: input.description,
    }).returning()
    if (!create) {
        return { success: false, message: "Erro ao criar categoria" }
    }
    return { success: true, message: "Categoria criada com sucesso", data: create }
}