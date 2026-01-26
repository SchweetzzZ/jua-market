import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useDetails } from "./detalshooks"

export default function DetailsPage() {
    const { id } = useParams<{ id: string }>()
    console.log("ID from params:", id)
    const { product, isLoading, error, fetchProductById } = useDetails()

    useEffect(() => {
        if (id) {
            fetchProductById(id)
        }
    }, [id, fetchProductById])

    if (isLoading) return <p>Carregando...</p>
    if (error) return <p>{error}</p>
    if (!product) return <p>Produto não encontrado</p>

    return (
        <div>
            <p>oi</p>
            <h1>{product?.name}</h1>
            <p>{product?.description}</p>
            <p>{product?.price}</p>
        </div>
    )
}
