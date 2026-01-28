import { useState, useCallback } from "react"
import { api } from "../../lib/api"

export interface AdminUser {
    id: string
    name: string | null
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
    role: string | null
    banned: boolean | null
    banReason: string | null
    banExpires: number | null
}

export const useAdminUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await api.admin.users.get()

            if (error) {
                console.error("Error fetching users:", error)
                setError((error.value as any)?.message || "Erro ao buscar usuários")
                return
            }

            // Type guard to ensure data has the users property
            if (data && typeof data === 'object' && 'users' in data && Array.isArray(data.users)) {
                setUsers(data.users as unknown as AdminUser[])
            } else if (data && typeof data === 'object' && 'success' in data && !(data as any).success) {
                setError((data as any).message || "Acesso negado")
                setUsers([])
            } else {
                setUsers([])
            }
        } catch (err) {
            console.error("Unexpected error fetching users:", err)
            setError("Erro inesperado ao buscar usuários")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const banUser = async (userId: string, reason?: string) => {
        try {
            const { data, error } = await api.admin["ban-user"].post({
                userId,
                reason
            })

            if (error) {
                throw new Error(error.value?.message || "Erro ao banir usuário")
            }

            // Refresh list or update local state
            await fetchUsers()
            return data
        } catch (err: any) {
            throw new Error(err.message || "Erro ao banir usuário")
        }
    }

    const unbanUser = async (userId: string) => {
        try {
            const { data, error } = await api.admin["unban-user"].post({
                userId
            })

            if (error) {
                throw new Error(error.value?.message || "Erro ao desbanir usuário")
            }

            // Refresh list or update local state
            await fetchUsers()
            return data
        } catch (err: any) {
            throw new Error(err.message || "Erro ao desbanir usuário")
        }
    }

    return {
        users,
        isLoading,
        error,
        fetchUsers,
        banUser,
        unbanUser
    }
}
