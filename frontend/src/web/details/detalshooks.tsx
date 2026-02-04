import { useState, useCallback } from "react"

type Product = {
    id: string
    name: string
    description: string
    price: string
    imageUrl: string
    user_id: string
}

export const useDetails = () => {
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchProductById = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `http://localhost:3000/productsId/${id}`,
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
                setProduct(result.data as Product)
            } else {
                setError(result?.message ?? "Produto não encontrado")
            }
        } catch {
            setError("Erro ao buscar produto")
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        product,
        isLoading,
        error,
        fetchProductById,
    }
}
