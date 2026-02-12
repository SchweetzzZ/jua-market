import { useState, useCallback } from "react"
import { api } from "../../../lib/api"

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
                const errorMessage = (error.value as any)?.message || "Erro ao buscar produtos"
                setError(errorMessage)
                return
            }

            if (data?.success && data.data) {
                setProducts(data.data as AdminProduct[])
                if ('total' in data) {
                    setTotalProducts(data.total as number)
                }
            } else if (data && typeof data === 'object' && 'success' in data && !(data as any).success) {
                setError((data as any).message || "Acesso negado")
                setProducts([])
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
        const { data, error } = await api.admin.products({ id: productId }).delete()

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao deletar produto"
            throw new Error(errorMessage)
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao deletar produto")
        }

        await fetchProducts()
    }

    const createProduct = async (productData: {
        name: string
        description: string
        category: string
        imageUrl: string
        price: string
        userId?: string
    }): Promise<void> => {
        const { data, error } = await api.admin.products.post(productData)

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao criar produto"
            throw new Error(errorMessage)
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao criar produto")
        }

        await fetchProducts()
    }

    const updateProduct = async (productId: string, productData: {
        name: string
        description: string
        category: string
        imageUrl: string
        price: string
    }): Promise<void> => {
        const { data, error } = await api.admin.products({ id: productId }).put(productData)

        if (error) {
            const errorMessage = (error.value as any)?.message || "Erro ao atualizar produto"
            throw new Error(errorMessage)
        }

        if (data?.success === false) {
            throw new Error(data.message || "Erro ao atualizar produto")
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
        deleteProduct: deleteAdminProduct,
        createProduct,
        updateProduct
    }
}
