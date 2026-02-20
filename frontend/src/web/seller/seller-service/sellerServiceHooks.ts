import { useState, useCallback, useEffect } from "react"
import { api } from "../../../lib/api"

export interface SellerService {
    id: string
    name: string
    description: string
    price: string
    images: { imageUrl: string; imageKey: string }[]
    category: string
    createdAt: Date
    updatedAt: Date
}

export const useSellerServices = () => {
    const [services, setServices] = useState<SellerService[]>([])
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
            const { data, error } = await api.servicos.me.get({
                query: {
                    limit,
                    offset,
                    search: currentSearch
                }
            })

            if (error) {
                const errorMessage = (error.value as any)?.message || "Erro ao buscar serviços"
                setError(errorMessage)
                return
            }

            if (data?.success && 'data' in data && Array.isArray(data.data)) {
                setServices(data.data as SellerService[])
                if ("total" in data) {
                    setTotalServices(data.total as number)
                }
            } else if (data && typeof data === 'object' && 'success' in data && !(data as any).success) {
                setError((data as any).message || "Erro ao buscar serviços")
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

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

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

    const deleteSellerService = async (serviceId: string): Promise<void> => {
        const { data, error } = await api.servicos({ id: serviceId }).delete()

        if (error) {
            throw new Error((error.value as any)?.message || "Erro ao deletar serviço")
        }

        if (data && typeof data === 'object' && 'success' in data && (data as any).success === false) {
            throw new Error((data as any).message || "Erro ao deletar serviço")
        }

        await fetchServices()
    }

    const createService = async (serviceData: {
        name: string
        description: string
        category: string
        price: string
        userId?: string
    }, imageFiles?: File[]): Promise<void> => {
        const finalImages: { imageUrl: string; imageKey: string }[] = []

        if (imageFiles && imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file => uploadImage(file))
            const uploadedResults = await Promise.all(uploadPromises)
            uploadedResults.forEach(res => {
                finalImages.push({ imageUrl: res.imageUrl, imageKey: res.imageKey })
            })
        }

        const { data, error } = await api.servicos.post({
            ...serviceData,
            images: finalImages
        } as any)

        if (error) {
            throw new Error((error.value as any)?.message || "Erro ao criar serviço")
        }

        if (data && typeof data === 'object' && 'success' in data && (data as any).success === false) {
            throw new Error((data as any).message || "Erro ao criar serviço")
        }

        await fetchServices()
    }

    const updateService = async (
        serviceId: string,
        serviceData: {
            name: string
            description: string
            category: string
            price: string
            images?: { imageUrl: string; imageKey: string }[]
        },
        imageFiles?: File[]
    ): Promise<void> => {
        let finalImages = serviceData.images || []

        if (imageFiles && imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file => uploadImage(file))
            const uploadedResults = await Promise.all(uploadPromises)
            const newImages = uploadedResults.map(res => ({
                imageUrl: res.imageUrl,
                imageKey: res.imageKey
            }))
            finalImages = [...finalImages, ...newImages]
        }

        const { data, error } = await api.servicos({ id: serviceId }).put({
            ...serviceData,
            images: finalImages
        } as any)

        if (error) {
            throw new Error((error.value as any)?.message || "Erro ao atualizar serviço")
        }

        if (data && typeof data === 'object' && 'success' in data && (data as any).success === false) {
            throw new Error((data as any).message || "Erro ao atualizar serviço")
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
        deleteService: deleteSellerService,
        createService,
        updateService
    }
}
