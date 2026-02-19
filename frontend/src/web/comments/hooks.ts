import { useState, useCallback } from "react"

export type Comment = {
    id: string
    comment: string
    user_id: string
    product_id?: string
    service_id?: string
    created_at?: string
    user?: {
        name: string
        image?: string
    }
}

export const useComments = () => {
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCommentsByProductId = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `http://localhost:3000/comments/product/${id}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                }
            )

            if (!response.ok) {
                if (response.status === 404) {
                    setComments([])
                    return
                }
                throw new Error(`Erro HTTP: ${response.status}`)
            }

            const result = await response.json()
            if (result?.success) {
                setComments(result.data as Comment[])
            } else {
                setComments([])
            }
        } catch (err) {
            console.error("Fetch product comments error:", err)
            setError("Erro ao buscar comentários")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchCommentsByServiceId = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `http://localhost:3000/comments/service/${id}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                }
            )

            if (!response.ok) {
                if (response.status === 404) {
                    setComments([])
                    return
                }
                throw new Error(`Erro HTTP: ${response.status}`)
            }

            const result = await response.json()
            if (result?.success) {
                setComments(result.data as Comment[])
            } else {
                setComments([])
            }
        } catch (err) {
            console.error("Fetch service comments error:", err)
            setError("Erro ao buscar comentários")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createComment = useCallback(async (data: { comment: string, product_id?: string, service_id?: string }) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`http://localhost:3000/comments`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || `Erro HTTP: ${response.status}`)
            }

            if (result.success) {
                // Refresh comments after adding a new one
                if (data.product_id) fetchCommentsByProductId(data.product_id)
                else if (data.service_id) fetchCommentsByServiceId(data.service_id)
                return result.data
            } else {
                setError(result.message || "Erro ao criar comentário")
                return null
            }
        } catch (err: any) {
            console.error("Create comment error:", err)
            setError(err.message || "Erro ao criar comentário")
            return null
        } finally {
            setIsLoading(false)
        }
    }, [fetchCommentsByProductId, fetchCommentsByServiceId])

    const deleteComment = useCallback(async (id: string, refetchId: { product_id?: string, service_id?: string }) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`http://localhost:3000/comments/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || `Erro HTTP: ${response.status}`)
            }

            if (result.success) {
                if (refetchId.product_id) fetchCommentsByProductId(refetchId.product_id)
                else if (refetchId.service_id) fetchCommentsByServiceId(refetchId.service_id)
                return true
            }
            return false
        } catch (err: any) {
            console.error("Delete comment error:", err)
            setError(err.message || "Erro ao deletar comentário")
            return false
        } finally {
            setIsLoading(false)
        }
    }, [fetchCommentsByProductId, fetchCommentsByServiceId])

    return {
        comments,
        isLoading,
        error,
        fetchCommentsByProductId,
        fetchCommentsByServiceId,
        createComment,
        deleteComment,
    }
}