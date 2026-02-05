import { useState, useCallback } from "react"
import { api } from "../../lib/api"

export interface AdminProduct {
    id: string
    name: string
    description: string
    price: string
    imageUrl: string
    category: string
    createdAt: Date
    updatedAt: Date
}

export const useAdminProducts = () => {
    const [products, setProducts] = useState<AdminProduct[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [totalProducts, setTotalProducts] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchProducts = useCallback(async (options?: { page?: number; search?: string }) => {
        setIsLoading(true)
        setError(null)

        const currentPage = options?.page ?? page
        const currentSearch = options?.search ?? searchQuery
        const offset = (currentPage - 1) * limit

        try {
            // @ts-ignore
            const { data, error } = await api.admin.products.get({
                query: {
                    limit,
                    offset,
                    search: currentSearch
                }
            })

            if (error) {
                const errorMessage = typeof error.value === 'string'
                    ? error.value
                    : (error.value as any)?.message || "Erro ao buscar produtos"
                setError(errorMessage)
                return
            }

            if (data?.success && data.data) {
                setProducts(data.data as AdminProduct[])
                if ('total' in data) {
                    setTotalProducts(data.total as number)
                }
            } else {
                setProducts([])
                setTotalProducts(0)
            }
        } catch (err) {
            console.error(err)
            setError("Erro inesperado ao buscar produtos")
        } finally {
            setIsLoading(false)
        }
    }, [page, limit, searchQuery])

    const deleteAdminProduct = async (productId: string): Promise<void> => {
        const { error } = await api.admin.products({ id: productId }).delete()

        if (error) {
            const errorMessage =
                typeof error.value === "string"
                    ? error.value
                    : (error.value as any)?.message || "Erro ao deletar produto"
            throw new Error(errorMessage)
        }

        await fetchProducts()
    }

    return {
        products,
        isLoading,
        error,
        totalProducts,
        page,
        setPage,
        searchQuery,
        setSearchQuery,
        fetchProducts,
        deleteProduct: deleteAdminProduct
    }
}
