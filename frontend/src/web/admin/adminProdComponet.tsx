import React from "react"
import { useAdminProducts } from "./adminProductsHooks"
import type { AdminProduct } from "./adminProductsHooks"

interface AdminProductTableProps {
    products: AdminProduct[]
    isLoading: boolean
    error: string | null
    fetchProducts: () => Promise<void>
    deleteProduct: (productId: string) => Promise<void>
}

export const AdminProductTable = ({ products, isLoading, error, fetchProducts, deleteProduct }: AdminProductTableProps) => {
    return (
        <div>
            <h2>ProdutosDAsilva</h2>
            {error && <p>{error}</p>}
            {isLoading ? (
                <p>Carregando produtos...</p>
            ) : (
                <ul>
                    {products.map((product) => (
                        <li key={product.id}>
                            {product.name} - {product.price}
                            <button onClick={() => deleteProduct(product.id)}>Deletar</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

