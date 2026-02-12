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
    const [totalUsers, setTotalUsers] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchUsers = useCallback(async (options?: { page?: number; search?: string }) => {
        setIsLoading(true)
        setError(null)

        const currentPage = options?.page ?? page
        const currentSearch = options?.search ?? searchQuery
        const offset = (currentPage - 1) * limit

        try {
            // @ts-ignore - a api tipagem as vezes não reconhece queries customizadas se não estiverem no schema
            const { data, error } = await api.admin.users.get({
                query: {
                    limit,
                    offset,
                    search: currentSearch
                }
            })

            if (error) {
                console.error("Error fetching users:", error)
                setError((error.value as any)?.message || "Erro ao buscar usuários")
                return
            }

            if (data?.success && data.data) {
                setUsers(data.data as AdminUser[])
                if ('total' in data) {
                    setTotalUsers(data.total as number)
                }
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
    }, [page, limit, searchQuery])

    const banUser = async (userId: string, reason?: string) => {
        try {
            const { data, error } = await api.admin["ban-user"].post({
                userId,
                reason
            })
            if (error) {
                throw new Error((error.value as any)?.message || "Erro ao banir usuário")
            }
            if (data?.success === false) {
                throw new Error(data.message || "Erro ao banir usuário")
            }

            await fetchUsers()
            return { success: true, message: data?.message || "Usuário banido com sucesso", data }
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
                throw new Error((error.value as any)?.message || "Erro ao desbanir usuário")
            }

            if (data?.success === false) {
                throw new Error(data.message || "Erro ao desbanir usuário")
            }

            await fetchUsers()
            return { success: true, message: data?.message || "Usuário desbanido com sucesso", data }
        } catch (err: any) {
            throw new Error(err.message || "Erro ao desbanir usuário")
        }
    }

    return {
        users,
        isLoading,
        error,
        totalUsers,
        page,
        setPage,
        searchQuery,
        setSearchQuery,
        fetchUsers,
        banUser,
        unbanUser
    }
}
