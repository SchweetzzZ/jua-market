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

    const fetchServices = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const { data, error } = await api.admin.services.get()

            if (error) {
                const errorMessage = typeof error.value === "string" ? error.value :
                    (error.value as any)?.message || "erro ao buscar serviços"
                setError(errorMessage)
                return
            }
            if (data?.success && data.data) {
                setServices(data.data)
            } else {
                setServices([])
            }
        } catch (err) {
            console.error(err)
            setError("Erro inesperado ao buscar produtos")
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { services, isLoading, error, fetchServices }
}
