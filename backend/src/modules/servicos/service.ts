import { db } from "../../db";
import { table_servicos } from "../../db/schemas/servicos_schema";
import { eq, and } from "drizzle-orm"

interface createServicoInput {
    nome: string;
    description: string;
    category: string
    image: string;
    price: string;
    history: string;
}

export const createServico = async (userId: string, input: createServicoInput) => {
    const existingServico = await db.select().from(table_servicos).where(
        eq(table_servicos.user_id, userId))

    if (existingServico.length > 0) {
        return { success: false, message: "User already has a service" }
    }

    const servico = await db.insert(table_servicos).values({
        ...input,
        category_id: input.category,
        user_id: userId,
    }).returning()

    if (!servico || servico.length === 0) {
        return { success: false, message: "Failed to create service" }
    }

    return { success: true, message: "Service created successfully", data: servico }
}

export const updateService = async (id: string, userId: string, input: Partial<createServicoInput>) => {
    const updateData: Partial<createServicoInput> = {}

    if (input.nome !== undefined) { updateData.nome = input.nome }
    if (input.description !== undefined) { updateData.description = input.description }
    if (input.category !== undefined) { updateData.category = input.category }
    if (input.image !== undefined) { updateData.image = input.image }
    if (input.price !== undefined) { updateData.price = input.price }

    const update = await db.update(table_servicos).set({
        ...updateData
    }).where(and(eq(table_servicos.id, id),
        eq(table_servicos.user_id, userId))).returning()

    if (!update || update.length === 0) {
        return { success: false, message: "Failed to update service" }
    }

    return { success: true, message: "Service updated successfully", data: update }
}

export const deletService = async (id: string, userId: string) => {
    const deleteService = await db.delete(table_servicos).where(and(
        eq(table_servicos.id, id),
        eq(table_servicos.user_id, userId)
    )).returning()

    if (!deleteService || deleteService.length === 0) {
        return { success: false, message: "Failed to delete service" }
    }

    return { success: true, message: "Service deleted successfully" }
}

export const getByUserId = async (userId: string) => {
    const getByUserId = await db.select().from(table_servicos).where(
        eq(table_servicos.user_id, userId))

    if (!getByUserId || getByUserId.length === 0) {
        return { success: false, message: "Failed to get service" }
    }

    return { success: true, message: "Service retrieved successfully", data: getByUserId }
}

export const getAllServices = async () => {
    const getAllServices = await db.select().from(table_servicos)

    if (!getAllServices || getAllServices.length === 0) {
        return { success: false, message: "Failed to get services" }
    }

    return { success: true, message: "Services retrieved successfully", data: getAllServices }
}