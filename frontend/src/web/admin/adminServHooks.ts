import { useState, useCallback } from "react"
import { api } from "../../lib/api"

export interface AdminService {
    id: string
    name: string
    description: string
    category: string
    imageUrl: string
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
                const errorMessage = typeof error.value === "string" ? error.value :
                    (error.value as any)?.message || "erro ao buscar serviços"
                setError(errorMessage)
                return
            }
            if (data?.success && data.data) {
                setServices(data.data as AdminService[])
                if ('total' in data) {
                    setTotalServices(data.total as number)
                }
            } else {
                setServices([])
                setTotalServices(0)
            }
        } catch (err) {
            console.error(err)
            setError("Erro inesperado ao buscar produtos")
        } finally {
            setIsLoading(false)
        }
    }, [page, limit, searchQuery])

    const deleteAdminService = async (serviceId: string): Promise<void> => {
        const { error } = await api.admin.services({ id: serviceId }).delete()

        if (error) {
            const errorMessage =
                typeof error.value === "string"
                    ? error.value
                    : (error.value as any)?.message || "Erro ao deletar serviço"
            throw new Error(errorMessage)
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
        deleteService: deleteAdminService
    }
}
