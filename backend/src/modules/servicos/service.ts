import { db } from "../../db";
import { table_servicos } from "../../db/schemas/servicos_schema";
import { table_service_image } from "../../db/schemas/service_image_schema";
import { tablecategories } from "../../db/schemas/category_schema"
import { user } from "../../db/schemas/auth-schema"
import { eq, and, ilike, sql, asc } from "drizzle-orm"
import { deleteFromS3 } from "../../lib/s3";

interface createServicoInput {
    name: string;
    description: string;
    category: string
    price: string;
    images: {
        imageUrl: string
        imageKey: string
    }[]
}
interface createServicoInputAdmin extends createServicoInput {
    ownerUserId?: string
}

//*******create para admin******/
export const createServicoAdmin = async (adminUserId: string, input: createServicoInputAdmin) => {
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
        const categoryExists = await db.select().from(tablecategories)
            .where(eq(tablecategories.name, input.category))
            .limit(1)

        if (!categoryExists.length) {
            throw new Error("Category not found")
        }

        const [servico] = await db.insert(table_servicos).values({
            user_id: ownerId,
            category: input.category,
            name: input.name,
            description: input.description,
            price: input.price,
        }).returning()

        if (!servico) {
            throw new Error("Failed to create service")
        }
        if (input.images?.length) {
            await tx.insert(table_service_image).values(
                input.images.map((img, index) => ({
                    service_id: servico.id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return servico
    })
}

export const createServico = async (userId: string, input: createServicoInput) => {
    return await db.transaction(async (tx) => {
        const categoryExists = await tx.select().from(tablecategories)
            .where(eq(tablecategories.name, input.category))
            .limit(1)

        if (!categoryExists.length) {
            throw new Error("Category not found")
        }

        const [servico] = await tx.insert(table_servicos).values({
            user_id: userId,
            category: input.category,
            name: input.name,
            description: input.description,
            price: input.price,
        }).returning()

        if (!servico) {
            throw new Error("Failed to create service")
        }
        if (input.images?.length) {
            await tx.insert(table_service_image).values(
                input.images.map((img, index) => ({
                    service_id: servico.id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return servico
    })
}

//*******update para admin******/
export const updateServiceAdmin = async (id: string, input: Partial<createServicoInput>) => {
    return await db.transaction(async (tx) => {
        // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
        const currentService = await tx.query.table_servicos.findFirst({
            where: eq(table_servicos.id, id),
        })
        if (!currentService) {
            throw new Error("Serviço não encontrado")
        }

        const updateData: Partial<typeof table_servicos.$inferInsert> = {}

        if (input.name !== undefined) { updateData.name = input.name }
        if (input.description !== undefined) { updateData.description = input.description }
        if (input.price !== undefined) { updateData.price = input.price }
        if (input.category !== undefined) {
            const categoryExists = await tx.select().from(tablecategories).where(
                eq(tablecategories.name, input.category)).limit(1)

            if (!categoryExists.length) {
                throw new Error("Category not found")
            }

            updateData.category = input.category
        }

        const [update] = await tx.update(table_servicos).set({
            ...updateData
        }).where(eq(table_servicos.id, id)).returning()

        if (!update) {
            throw new Error("Failed to update service")
        }
        //1 buscar imagens atuais
        if (input.images) {
            //pegar imagens atuais
            const currentImages = await tx.select().from(table_service_image).where(
                eq(table_service_image.service_id, id)
            )

            const newKeys = new Set(input.images.map(img => img.imageKey));

            //2 deletar do S3 apenas as que não estão no novo conjunto
            for (const img of currentImages) {
                if (!newKeys.has(img.image_key)) {
                    await deleteFromS3(img.image_key)
                }
            }
            //3deletar do banco para reinserir com novas posições
            await tx.delete(table_service_image).where(eq(table_service_image.service_id, id))
        }
        if (input.images?.length) {
            //4 inserir novas imagens
            await tx.insert(table_service_image).values(
                input.images.map((img, index) => ({
                    service_id: id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return update
    })
}
//para seller
export const updateService = async (id: string, userId: string, input: Partial<createServicoInput>) => {
    return await db.transaction(async (tx) => {
        // Se estivermos atualizando a imagem, vamos deletar a antiga do S3
        const currentService = await tx.query.table_servicos.findFirst({
            where: eq(table_servicos.id, id)
        })
        if (!currentService) {
            throw new Error("Serviço não encontrado")
        }

        const updateData: Partial<typeof table_servicos.$inferInsert> = {}

        if (input.name !== undefined) { updateData.name = input.name }
        if (input.description !== undefined) { updateData.description = input.description }
        if (input.price !== undefined) { updateData.price = input.price }
        if (input.category !== undefined) {
            const categoryExists = await tx.select().from(tablecategories).where(
                eq(tablecategories.name, input.category)).limit(1)

            if (!categoryExists.length) {
                throw new Error("Category not found")
            }

            updateData.category = input.category
        }

        const [update] = await tx.update(table_servicos).set({
            ...updateData
        }).where(eq(table_servicos.id, id)).returning()

        if (!update) {
            throw new Error("Failed to update service")
        }
        //1 buscar imagens atuais
        if (input.images) {
            //pegar imagens atuais
            const currentImages = await tx.select().from(table_service_image).where(
                eq(table_service_image.service_id, id)
            )

            const newKeys = new Set(input.images.map(img => img.imageKey));

            //2 deletar do S3 apenas as que não estão no novo conjunto
            for (const img of currentImages) {
                if (!newKeys.has(img.image_key)) {
                    await deleteFromS3(img.image_key)
                }
            }
            //3deletar do banco para reinserir com novas posições
            await tx.delete(table_service_image).where(eq(table_service_image.service_id, id))
        }
        if (input.images?.length) {
            //4 inserir novas imagens
            await tx.insert(table_service_image).values(
                input.images.map((img, index) => ({
                    service_id: id,
                    image_url: img.imageUrl,
                    image_key: img.imageKey,
                    position: index,
                }))
            )
        }
        return update
    })
}

export const deletService = async (id: string, userId: string) => {
    return await db.transaction(async (tx) => {
        const images = await tx.select().from(table_service_image).where(
            eq(table_service_image.service_id, id)
        )
        for (const img of images) {
            await deleteFromS3(img.image_key)
        }
        await tx.delete(table_service_image).where(eq(table_service_image.service_id, id))
        const [deleteService] = await tx.delete(table_servicos).where(and(
            eq(table_servicos.id, id),
            eq(table_servicos.user_id, userId)
        )).returning()

        if (!deleteService) {
            throw new Error("Failed to delete service")
        }

        return deleteService
    })
}

export const getByUserId = async (userId: string, options?: { search?: string; limit?: number; offset?: number }) => {
    const { search = "", limit = 9, offset = 0 } = options || {}

    let query = db.select().from(table_servicos).where(eq(table_servicos.user_id, userId))

    if (search) {
        // @ts-ignore
        query = query.where(and(eq(table_servicos.user_id, userId), ilike(table_servicos.name, `%${search}%`)))
    }

    const servicesRows = await query.limit(limit).offset(offset)

    const servicesWithImages = await Promise.all(
        servicesRows.map(async (service) => {
            const images = await db
                .select()
                .from(table_service_image)
                .where(eq(table_service_image.service_id, service.id))
                .orderBy(asc(table_service_image.position))

            return {
                ...service,
                images: images.map(img => ({
                    imageUrl: img.image_url,
                    imageKey: img.image_key
                })),
                imageUrl: images[0]?.image_url || null
            }
        })
    )

    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_servicos).where(eq(table_servicos.user_id, userId))
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(and(eq(table_servicos.user_id, userId), ilike(table_servicos.name, `%${search}%`)))
    }
    const [totalCount] = await countQuery

    return {
        services: servicesWithImages,
        total: Number(totalCount.count)
    }
}

export const getAllServices = async (options?: { search?: string; limit?: number; offset?: number }) => {
    const { search = "", limit = 9, offset = 0 } = options || {}

    let query = db.select().from(table_servicos)

    if (search) {
        // @ts-ignore
        query = query.where(ilike(table_servicos.name, `%${search}%`))
    }

    const servicesRows = await query.limit(limit).offset(offset)

    const servicesWithImages = await Promise.all(
        servicesRows.map(async (service) => {
            const images = await db
                .select()
                .from(table_service_image)
                .where(eq(table_service_image.service_id, service.id))
                .orderBy(asc(table_service_image.position))

            return {
                ...service,
                images: images.map(img => ({
                    imageUrl: img.image_url,
                    imageKey: img.image_key
                })),
                imageUrl: images[0]?.image_url || null
            }
        })
    )

    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(table_servicos)
    if (search) {
        // @ts-ignore
        countQuery = countQuery.where(ilike(table_servicos.name, `%${search}%`))
    }
    const [totalCount] = await countQuery

    return {
        services: servicesWithImages,
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

    const images = await db
        .select()
        .from(table_service_image)
        .where(eq(table_service_image.service_id, service.id))
        .orderBy(asc(table_service_image.position))

    return {
        ...service,
        images: images.map(img => ({
            imageUrl: img.image_url,
            imageKey: img.image_key
        })),
        imageUrl: images[0]?.image_url || null
    }
}
