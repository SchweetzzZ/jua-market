import { useState, useCallback } from "react"

type Servico = {
    id: string
    name: string
    description: string
    price: string
    imageUrl: string
    images?: { imageUrl: string; imageKey: string }[]
    user_id: string
}

export const useServicoDetails = () => {
    const [servico, setServico] = useState<Servico | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchServicoById = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `http://localhost:3000/servicos/${id}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                }
            )

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }

            const result = await response.json()

            if (result?.success) {
                setServico(result.data as Servico)
            } else {
                setError(result?.message ?? "Servico não encontrado")
            }
        } catch {
            setError("Erro ao buscar servico")
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        servico,
        isLoading,
        error,
        fetchServicoById,
    }
}
