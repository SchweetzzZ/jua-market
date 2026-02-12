import { useState, useCallback, useEffect } from "react"
import { api } from "../../../lib/api"

export interface SellerService {
    id: string
    name: string
    description: string
    category: string
    imageUrl: string
    price: string
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

    const deleteSellerService = async (serviceId: string): Promise<void> => {
        const { data, error } = await api.servicos({ id: serviceId }).delete()

        if (error) {
            throw new Error((error.value as any)?.message || "Erro ao deletar serviço")
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
        price: string
        userId?: string
    }): Promise<void> => {
        const { data, error } = await api.servicos.post(serviceData)

        if (error) {
            throw new Error((error.value as any)?.message || "Erro ao criar serviço")
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao criar serviço")
        }

        await fetchServices()
    }

    const updateService = async (
        serviceId: string,
        serviceData: {
            name: string
            description: string
            category: string
            imageUrl: string
            price: string
        }
    ): Promise<void> => {
        const { data, error } = await api.servicos({ id: serviceId }).put(serviceData)

        if (error) {
            throw new Error((error.value as any)?.message || "Erro ao atualizar serviço")
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
        deleteService: deleteSellerService,
        createService,
        updateService
    }
}
