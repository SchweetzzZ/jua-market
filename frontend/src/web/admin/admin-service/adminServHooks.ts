import { useState, useCallback } from "react"
import { api } from "../../../lib/api"

export interface AdminService {
    id: string
    name: string
    description: string
    category: string
    imageUrl: string
    imageKey?: string
    price: string
    createdAt: Date
    updatedAt: Date
}

export const useAdminServices = () => {
    const [services, setServices] = useState<AdminService[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalServices, setTotalServices] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchServices = useCallback(async (options?: { page?: number; search?: string }) => {
        setIsLoading(true)
        setError(null)

        const currentPage = options?.page ?? page
        const currentSearch = options?.search ?? searchQuery
        const offset = (currentPage - 1) * limit

        try {
            // @ts-ignore
            const { data, error } = await api.admin.services.get({
                query: {
                    limit,
                    offset,
                    search: currentSearch
                }
            })

            if (error) {
                const errorMessage = (error.value as any)?.message || "erro ao buscar serviços"
                setError(errorMessage)
                return
            }
            if (data?.success && data.data) {
                setServices(data.data as AdminService[])
                if ('total' in data) {
                    setTotalServices(data.total as number)
                }
            } else if (data && typeof data === 'object' && 'success' in data && !(data as any).success) {
                setError((data as any).message || "Acesso negado")
                setServices([])
            } else {
                setServices([])
                setTotalServices(0)
            }
        } catch (err) {
            console.error(err)
            setError("Erro inesperado ao buscar serviços")
        } finally {
            setIsLoading(false)
        }
    }, [page, limit, searchQuery])

    const uploadImage = async (file: File) => {
        const { data, error } = await api.upload.presigned.post({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size
        })

        if (error || !data?.success) {
            throw new Error((error?.value as any)?.message || (data as any)?.message || "Erro ao obter URL de upload")
        }

        const uploadData = (data as any).data
        const { uploadUrl, imageUrl, imageKey } = uploadData

        const response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type
            }
        })

        if (!response.ok) {
            throw new Error("Erro ao fazer upload da imagem para o S3")
        }

        return { imageUrl, imageKey }
    }

    const deleteAdminService = async (serviceId: string): Promise<void> => {
        const { data, error } = await api.admin.services({ id: serviceId }).delete()

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao deletar serviço"
            throw new Error(errorMessage)
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao deletar serviço")
        }

        await fetchServices()
    }

    const createService = async (serviceData: {
        name: string
        description: string
        category: string
        imageUrl: string
        imageKey?: string
        price: string
        userId?: string
    }, imageFile?: File): Promise<void> => {
        let finalData = { ...serviceData }

        if (imageFile) {
            const uploaded = await uploadImage(imageFile)
            finalData.imageUrl = uploaded.imageUrl
            finalData.imageKey = uploaded.imageKey
        }

        const { data, error } = await api.admin.services.post(finalData)

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao criar serviço"
            throw new Error(errorMessage)
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao criar serviço")
        }

        await fetchServices()
    }

    const updateService = async (serviceId: string, serviceData: {
        name: string
        description: string
        category: string
        imageUrl: string
        imageKey?: string
        price: string
    }, imageFile?: File): Promise<void> => {
        let finalData = { ...serviceData }

        if (imageFile) {
            const uploaded = await uploadImage(imageFile)
            finalData.imageUrl = uploaded.imageUrl
            finalData.imageKey = uploaded.imageKey
        }

        const { data, error } = await api.admin.services({ id: serviceId }).put(finalData)

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao atualizar serviço"
            throw new Error(errorMessage)
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao atualizar serviço")
        }

        await fetchServices()
    }

    return {
        services,
        isLoading,
        error,
        totalServices,
        page,
        setPage,
        searchQuery,
        setSearchQuery,
        fetchServices,
        deleteService: deleteAdminService,
        createService,
        updateService
    }
}
