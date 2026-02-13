import { db } from "../../db";
import { table_servicos } from "../../db/schemas/servicos_schema";
import { tablecategories } from "../../db/schemas/category_schema"
import { eq, and, ilike, sql } from "drizzle-orm"
import { deleteFromS3 } from "../../lib/s3";

interface createServicoInput {
    name: string;
    description: string;
    category: string
    imageUrl: string;
    imageKey?: string;
    price: string;
}

//*******create para admin******/
export const createServicoAdmin = async (userId: string, input: createServicoInput) => {
    const categoryExists = await db.select().from(tablecategories)
        .where(eq(tablecategories.name, input.category))
        .limit(1)

    if (!categoryExists.length) {
        throw new Error("Category not found")
    }

    const [servico] = await db.insert(table_servicos).values({
        user_id: userId,
        category: input.category,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
        price: input.price,
    }).returning()

    if (!servico) {
        throw new Error("Failed to create service")
    }

    return servico
}

export const createServico = async (userId: string, input: createServicoInput) => {
    const categoryExists = await db.select().from(tablecategories)
        .where(eq(tablecategories.name, input.category))
        .limit(1)

    if (!categoryExists.length) {
        throw new Error("Category not found")
    }

    const [servico] = await db.insert(table_servicos).values({
        user_id: userId,
        category: input.category,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
        price: input.price,
    }).returning()

    if (!servico) {
        throw new Error("Failed to create service")
    }

    return servico
}

//*******update para admin******/
export const updateServiceAdmin = async (id: string, input: Partial<createServicoInput>) => {
    // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
    if (input.imageKey) {
        const currentService = await db.query.table_servicos.findFirst({
            where: eq(table_servicos.id, id)
        })

        if (currentService?.imageKey && currentService.imageKey !== input.imageKey) {
            await deleteFromS3(currentService.imageKey)
        }
    }

    const updateData: Partial<typeof table_servicos.$inferInsert> = {}

    if (input.name !== undefined) { updateData.name = input.name }
    if (input.description !== undefined) { updateData.description = input.description }
    if (input.imageUrl !== undefined) { updateData.imageUrl = input.imageUrl }
    if (input.imageKey !== undefined) { updateData.imageKey = input.imageKey }
    if (input.price !== undefined) { updateData.price = input.price }
    if (input.category !== undefined) {
        const categoryExists = await db.select().from(tablecategories).where(
            eq(tablecategories.name, input.category)).limit(1)

        if (!categoryExists.length) {
            throw new Error("Category not found")
        }

        updateData.category = input.category
    }

    const [update] = await db.update(table_servicos).set({
        ...updateData
    }).where(eq(table_servicos.id, id)).returning()

    if (!update) {
        throw new Error("Failed to update service")
    }

    return update
}

export const updateService = async (id: string, userId: string, input: Partial<createServicoInput>) => {
    // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
    if (input.imageKey) {
        const currentService = await db.query.table_servicos.findFirst({
            where: and(
                eq(table_servicos.id, id),
                eq(table_servicos.user_id, userId)
            )
        })

        if (currentService?.imageKey && currentService.imageKey !== input.imageKey) {
            await deleteFromS3(currentService.imageKey)
        }
    }

    const updateData: Partial<typeof table_servicos.$inferInsert> = {}

    if (input.name !== undefined) { updateData.name = input.name }
    if (input.description !== undefined) { updateData.description = input.description }
    if (input.imageUrl !== undefined) { updateData.imageUrl = input.imageUrl }
    if (input.imageKey !== undefined) { updateData.imageKey = input.imageKey }
    if (input.price !== undefined) { updateData.price = input.price }
    if (input.category !== undefined) {
        const categoryExists = await db.select().from(tablecategories).where(
            eq(tablecategories.name, input.category)).limit(1)

        if (!categoryExists.length) {
            throw new Error("Category not found")
        }

        updateData.category = input.category
    }

    const [update] = await db.update(table_servicos).set({
        ...updateData
    }).where(and(eq(table_servicos.id, id), eq(table_servicos.user_id, userId))).returning()

    if (!update) {
        throw new Error("Failed to update service")
    }

    return update
}

export const deletService = async (id: string, userId: string) => {
    const [deleteService] = await db.delete(table_servicos).where(and(
        eq(table_servicos.id, id),
        eq(table_servicos.user_id, userId)
    )).returning()

    if (!deleteService) {
        throw new Error("Failed to delete service")
    }

    if (deleteService && deleteService.imageKey) {
        await deleteFromS3(deleteService.imageKey)
    }

    return deleteService
}

export const getByUserId = async (userId: string, options?: { search?: string; limit?: number; offset?: number }) => {
    const { search = "", limit = 10, offset = 0 } = options || {}

    let query = db.select().from(table_servicos).where(eq(table_servicos.user_id, userId))

    if (search) {
        // @ts-ignore
        query = query.where(and(eq(table_servicos.user_id, userId), ilike(table_servicos.name, `%${search}%`)))
    }

    const servicesRows = await query.limit(limit).offset(offset)

    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_servicos).where(eq(table_servicos.user_id, userId))
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(and(eq(table_servicos.user_id, userId), ilike(table_servicos.name, `%${search}%`)))
    }
    const [totalCount] = await countQuery

    return {
        services: servicesRows,
        total: Number(totalCount.count)
    }
}

export const getAllServices = async (options?: { search?: string; limit?: number; offset?: number }) => {
    const { search = "", limit = 10, offset = 0 } = options || {}

    let query = db.select().from(table_servicos)

    if (search) {
        // @ts-ignore
        query = query.where(ilike(table_servicos.name, `%${search}%`))
    }

    const servicesRows = await query.limit(limit).offset(offset)

    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_servicos)
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(ilike(table_servicos.name, `%${search}%`))
    }
    const [totalCount] = await countQuery

    return {
        services: servicesRows,
        total: Number(totalCount.count)
    }
}

export const getServiceById = async (id: string) => {
    const [service] = await db.select().from(table_servicos).where(
        eq(table_servicos.id, id)
    ).limit(1)

    if (!service) {
        throw new Error("Service not found")
    }

    return service
}
