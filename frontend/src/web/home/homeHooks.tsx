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

    const fetchProducts = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                "http://localhost:3000/products/all",
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
            } else {
                setProducts([])
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
        fetchProducts
    }
}