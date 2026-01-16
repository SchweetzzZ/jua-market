import { db } from "../../db"
import { tablecategories } from "../../db/schemas/category_schema"
import { eq } from "drizzle-orm"

interface createCategoryInput {
    name: string;
    description: string;
}

export const createCategory = async (input: createCategoryInput) => {
    const existingCategory = await db.select().from(tablecategories).where(
        eq(tablecategories.name, input.name)).limit(1)

    if (existingCategory.length) {
        return { success: false, message: "Categoria já existe" }
    }

    const [create] = await db.insert(tablecategories).values({
        name: input.name,
        description: input.description,
    }).returning()

    if (!create) {
        return { success: false, message: "Erro ao criar categoria" }
    }
    return { success: true, message: "Categoria criada com sucesso", data: create }
}
export const updateCatgory = async (id: string, input: Partial<createCategoryInput>) => {
    const updateData: Partial<typeof tablecategories.$inferInsert> = {}

    if (input.name !== undefined) {
        updateData.name = input.name
    }
    if (input.description !== undefined) {
        updateData.description = input.description
    }

    const [update] = await db.update(tablecategories)
        .set(updateData)
        .where(eq(tablecategories.id, id))
        .returning()
    if (!update) {
        return { success: false, message: "Erro ao atualizar categoria" }
    }
    return { success: true, message: "Categoria atualizada com sucesso", data: update }
}

export const deleteCategory = async (id: string) => {
    const catDelet = await db.delete(tablecategories)
        .where(eq(tablecategories.id, id))
        .returning()
    if (!catDelet) {
        return { success: false, message: "Erro ao deletar categoria" }
    }
    return { success: true, message: "Categoria deletada com sucesso", data: catDelet }
}

export const getCategory = async (id: string) => {
    const catGet = await db.select().from(tablecategories).where(eq(tablecategories.id, id)).limit(1)
    if (!catGet) {
        return { success: false, message: "Erro ao buscar categoria" }
    }
    return { success: true, message: "Categoria buscada com sucesso", data: catGet }
}

export const getAllCategories = async () => {
    const catGetAll = await db.select().from(tablecategories)
    if (!catGetAll) {
        return { success: false, message: "Erro ao buscar categorias" }
    }
    return { success: true, message: "Categorias buscadas com sucesso", data: catGetAll }
}
