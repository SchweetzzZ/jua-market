import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useDetails } from "./detalshooks"
import { useUsers } from "./listUsers"

export default function DetailsPage() {
    const { id } = useParams<{ id: string }>()

    const { product, isLoading, error, fetchProductById } = useDetails()
    const { user, fetchUser } = useUsers()


    useEffect(() => {
        if (id) {
            fetchProductById(id)
        }
    }, [id, fetchProductById])

    useEffect(() => {
        if (product?.user_id) {
            fetchUser(product.user_id)
        }
    }, [product, fetchUser])

    if (isLoading) return <p>Carregando...</p>
    if (error) return <p>{error}</p>
    if (!product) return <p>Produto não encontrado</p>

    return (
        <div className="min-h-screen px-40 py-30 flex items-start">
            <div className="flex flex-row gap-12">

                <img
                    className="h-170 w-150 object-cover rounded-xl"
                    src={product.image} alt={product.name}
                />

                <div className="flex flex-col gap-6 max-w-md">
                    <h1 className="text-3xl font-semibold">{product.name}</h1>

                    <p className="text-xl font-bold text-green-600">
                        R$ {product.price}
                    </p>

                    <p className="text-gray-600">
                        {product.description}
                    </p>

                    {user && (
                        <p className="text-gray-500 text-sm">
                            Vendido por: <strong>{user.name}</strong>
                        </p>
                    )}

                    {user?.history && (
                        <p className="text-gray-500 text-sm italic">
                            "{user.history}"
                        </p>
                    )}
                    <a
                        href={`https://wa.me/${user?.phone}?text=${encodeURIComponent(
                            `Olá, tenho interesse no produto "${product.name}". Ainda está disponível?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition text-center"
                    >
                        Compre diretamente com o vendedor
                    </a>

                </div>
            </div>
        </div>
    )
}
