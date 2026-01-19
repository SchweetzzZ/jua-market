import { useState, useCallback } from "react";

export const useUser = () => {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUser = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("http://localhost:3000/users")
            const result = await response.json()

            if (result.success) {
                setUsers(result.data)
            } else {
                setUsers([])
            }
        } catch (error) {
            setError("Erro ao buscar usuários")
        } finally {
            setIsLoading(false)
        }

    }, [])

    return {
        users,
        isLoading,
        error,
        fetchUser
    }
}