import { useState, useCallback } from "react"

type Product = {
    id: string
    name: string
    description?: string
    price?: string
    image?: string
}

export const useHome = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [totalProducts, setTotalProducts] = useState(0)

    const fetchProducts = useCallback(async (page: number = 1, limit: number = 20, search: string = "") => {
        setIsLoading(true)
        setError(null)

        try {
            const offset = (page - 1) * limit
            const url = new URL("http://localhost:3000/products/all")
            url.searchParams.append("limit", String(limit))
            url.searchParams.append("offset", String(offset))
            if (search) url.searchParams.append("search", search)

            const response = await fetch(
                url.toString(),
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
                setProducts(result.data)
                setTotalProducts(result.total || 0)
            } else {
                setProducts([])
                setTotalProducts(0)
                if (result?.message && !result.success) {
                    setError(result.message)
                }
            }

        } catch (err) {
            setError("Erro ao buscar produtos")
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        products,
        isLoading,
        error,
        totalProducts,
        fetchProducts
    }
}