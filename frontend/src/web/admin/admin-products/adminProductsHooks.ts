import { useState, useCallback } from "react"
import { api } from "../../../lib/api"

export interface AdminProduct {
    id: string
    name: string
    description: string
    price: string
    imageUrl: string
    imageKey?: string
    images: { imageUrl: string; imageKey: string }[]
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

    const uploadImage = async (file: File) => {
        const { data, error } = await api.upload.presigned.post({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size
        })

        if (error || !data?.success) {
            throw new Error((error?.value as any)?.message || (data as any)?.message || "Erro ao obter URL de upload")
        }

        const uploadData = (data as any).data
        const { uploadUrl, imageUrl, imageKey } = uploadData

        const response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type
            }
        })

        if (!response.ok) {
            throw new Error("Erro ao fazer upload da imagem para o S3")
        }

        return { imageUrl, imageKey }
    }

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
        price: string
        userId?: string
    }, imageFiles?: File[]): Promise<void> => {
        const finalImages: { imageUrl: string; imageKey: string }[] = []

        if (imageFiles && imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file => uploadImage(file))
            const uploadedResults = await Promise.all(uploadPromises)
            uploadedResults.forEach(res => {
                finalImages.push({ imageUrl: res.imageUrl, imageKey: res.imageKey })
            })
        }

        const { data, error } = await api.admin.products.post({
            ...productData,
            images: finalImages
        } as any)

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
        price: string
        images?: { imageUrl: string; imageKey: string }[]
    }, imageFiles?: File[]): Promise<void> => {
        let finalImages = productData.images || []

        if (imageFiles && imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file => uploadImage(file))
            const uploadedResults = await Promise.all(uploadPromises)
            const newImages = uploadedResults.map(res => ({
                imageUrl: res.imageUrl,
                imageKey: res.imageKey
            }))
            finalImages = [...finalImages, ...newImages]
        }

        const { data, error } = await api.admin.products({ id: productId }).put({
            ...productData,
            images: finalImages
        } as any)

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
