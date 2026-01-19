import { useEffect, useState, useMemo } from "react"
import { useHome } from "./homeHooks"

export default function Home() {
    const { products, isLoading, error, fetchProducts } = useHome()
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products

        return products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [products, search])

    if (isLoading) return <p>Carregando produtos...</p>

    if (error) {
        return (
            <div>
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="p-5">
            {/* Search */}
            <div className="flex justify-center mb-5">
                <input
                    type="text"
                    placeholder="Procurar produto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[500px] p-2 border rounded"
                />
            </div>

            {/* Contador */}
            <div className="text-sm text-gray-500 mb-5">
                Total de produtos: {filteredProducts.length}
            </div>

            {filteredProducts.length === 0 ? (
                <p>Nenhum produto encontrado</p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                    {filteredProducts.map((product: any) => (
                        <div
                            key={product.id}
                            className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                            {product.image && (
                                <div className="w-full h-52 mb-4 overflow-hidden rounded">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/300x200?text=Sem+Imagem"
                                        }}
                                    />
                                </div>
                            )}

                            <h3 className="mb-2 font-semibold">{product.name}</h3>

                            {product.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                    {product.description}
                                </p>
                            )}

                            {product.price && (
                                <p className="text-lg font-bold text-green-700 mb-2">
                                    R$ {Number(product.price).toFixed(2)}
                                </p>
                            )}

                            {product.category_name && (
                                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                    {product.category_name}
                                </span>
                            )}

                            <button
                                className="w-full mt-4 py-2 bg-blue-600 text-white rounded 
                                hover:bg-blue-700 transition"
                            >
                                Ver Detalhes
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
