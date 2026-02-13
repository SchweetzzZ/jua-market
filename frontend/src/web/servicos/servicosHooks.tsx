import { useState, useCallback } from "react"
import { api } from "../../lib/api"


export interface SellerService {
    id: string
    name: string
    description: string
    price: string
    imageUrl: string
    category: string
    createdAt: Date
    updatedAt: Date
}

export const useSellerProducts = () => {
    const [services, setServices] = useState<SellerService[]>([])
    const [isLoading, setIsLoading] = useState(false)
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
            const { data, error } = await api.servicos.get({
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

            if (data?.success && data.data) {
                setServices(data.data as SellerService[])
                if ('total' in data) {
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

    const deletSellerService = async (serviceId: string): Promise<void> => {
        const { data, error } = await api.servicos({ id: serviceId }).delete()

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
        price: string
        userId?: string
    }): Promise<void> => {
        const { data, error } = await api.servicos.post(serviceData)

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao criar produto"
            throw new Error(errorMessage)
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao criar produto")
        }

        await fetchServices()
    }

    const updateService = async (serviceId: string, serviceData: {
        name: string
        description: string
        category: string
        imageUrl: string
        price: string
    }): Promise<void> => {
        const { data, error } = await api.servicos({ id: serviceId }).put(serviceData)

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao atualizar produto"
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
        deleteService: deletSellerService,
        createService,
        updateService
    }
}

export const useServicos = () => {
    const [servicos, setServicos] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchServicos = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("http://localhost:3000/servicos/all")
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            const result = await response.json()
            if (result.success) {
                setServicos(result.data)
            } else {
                setError(result.message || "Erro ao buscar serviços")
            }
        } catch (err) {
            setError("Erro ao se conectar com o servidor")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        servicos,
        fetchServicos,
        isLoading,
        error
    }
}
