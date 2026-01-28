import { useState, useCallback } from "react"

export type User = {
    id: string
    name: string
    history: string
    phone: string
}

export const useUsers = () => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUser = useCallback(async (userId: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `http://localhost:3000/users/${userId}`,
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
                setUser(result.data)
            } else {
                setError(result?.message ?? "Usuário não encontrado")
            }
        } catch {
            setError("Erro ao buscar usuário")
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        user,
        isLoading,
        error,
        fetchUser,
    }
}