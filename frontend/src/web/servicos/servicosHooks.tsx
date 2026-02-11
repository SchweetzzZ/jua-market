import { useState, useCallback } from "react"

type Servico = {
    id: string
    name: string
    description?: string
    price?: string
    image?: string
}

export const useServicos = () => {
    const [servicos, setServicos] = useState<Servico[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchServicos = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                "http://localhost:3000/servicos/all",
                {
                    credentials: "include",
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }

            const result = await response.json()

            if (result?.success && Array.isArray(result.data)) {
                setServicos(result.data)
            } else {
                setServicos([])
                if (result?.message && !result.success) {
                    setError(result.message)
                }
            }

        } catch (err) {
            setError("Erro ao buscar servicos")
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