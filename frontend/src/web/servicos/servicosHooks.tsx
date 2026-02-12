import { useState, useCallback } from "react"
import { api } from "../../lib/api"
import { unwrap } from "../../lib/api-utils"

type Servico = {
    id: string
    name: string
    description?: string
    price?: string
    imageUrl?: string
}

export const useServicos = () => {
    const [servicos, setServicos] = useState<Servico[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchServicos = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await unwrap(api.servicos.all.get() as any)
            setServicos(data)
        } catch (err: any) {
            setError(err.message || "Erro ao buscar serviços")
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        servicos,
        isLoading,
        error,
        fetchServicos
    }
}