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

    const fetchProducts = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const { data, error } = await api.admin.products.get()

            if (error) {
                const errorMessage = typeof error.value === 'string'
                    ? error.value
                    : (error.value as any)?.message || "Erro ao buscar produtos"
                setError(errorMessage)
                return
            }

            if (data?.success && data.data) {
                setProducts(data.data)
            } else {
                setProducts([])
            }
        } catch (err) {
            console.error(err)
            setError("Erro inesperado ao buscar produtos")
        } finally {
            setIsLoading(false)
        }
    }, [])

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
        fetchProducts,
        deleteProduct: deleteAdminProduct
    }
}
