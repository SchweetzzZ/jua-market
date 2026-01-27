import { useEffect, useState, useMemo } from "react";
import { useHome } from "./homeHooks";
import { useServicos } from "../servicos/servicosHooks";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface Product {
    id: string | number;
    name: string;
    description?: string;
    price?: number | string;
    image?: string;
    category_name?: string;
}

interface Servico {
    id: string | number;
    name: string;
    description?: string;
    price?: number | string;
    image?: string;
}

type Tab = "produtos" | "servicos";

export default function Home() {
    const { products, isLoading, error, fetchProducts } = useHome();
    const { servicos, isLoading: isLoadingServicos, error: errorServicos, fetchServicos, }
        = useServicos();

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("produtos");

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchServicos();
    }, [fetchProducts, fetchServicos]);

    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products;
        return products.filter((product: Product) =>
            product.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [products, search]);

    const filteredServicos = useMemo(() => {
        if (!search.trim()) return servicos;
        return servicos.filter((servico: Servico) =>
            servico.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [servicos, search]);

    if (isLoading || isLoadingServicos) {
        return <p>Carregando...</p>;
    }

    if (error || errorServicos) {
        return (
            <div>
                <p className="text-red-500">{error || errorServicos}</p>
            </div>
        );
    }

    return (
        <div className="p-10 relative">
            <div className="flex justify-center">
                <input
                    type="text"
                    placeholder={`Procurar ${activeTab === "produtos" ? "produto" : "serviço"}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[500px] p-3 rounded-lg border border-black text-black placeholder-black"
                />
            </div>

            <div className="absolute top-10 right-10 flex gap-4">
                <button
                    onClick={() => navigate("/sign-up")}
                    className="px-4 py-2 text-blue-800 font-bold hover:bg-blue-400 rounded transition"
                >
                    Cadastrar
                </button>
                <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 text-blue-800 font-bold hover:bg-blue-400 rounded transition"
                >
                    Login
                </button>
            </div>


            <div className="flex justify-center mb-7 mt-5">
                <p
                    className={`mr-10 cursor-pointer ${activeTab === "produtos" ? "font-bold text-blue-600" : ""}`}
                    onClick={() => setActiveTab("produtos")}>produtos</p>

                <p
                    className={`cursor-pointer ${activeTab === "servicos" ? "font-bold text-blue-600" : ""}`}
                    onClick={() => setActiveTab("servicos")}>serviços</p>
            </div>

            <div className="text-sm text-gray-500 mb-4">
                {activeTab === "produtos" ? `Total de produtos: ${filteredProducts.length}` : `Total de serviços: ${filteredServicos.length}`}
            </div>

            {activeTab === "produtos" && (
                <>
                    {filteredProducts.length === 0 ? (
                        <p>Nenhum produto encontrado</p>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                            {filteredProducts.map((product: Product) => (
                                <div
                                    key={product.id}
                                    className="border rounded-lg p-4 bg-white shadow-sm flex flex-col"
                                >
                                    {product.image && (
                                        <div className="w-full h-52 mb-4 overflow-hidden rounded">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) =>
                                                (e.currentTarget.src =
                                                    "https://placehold.co/300x200?text=Sem+Imagem")
                                                }
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
                                        <p className="text-lg font-bold mb-2">
                                            R$ {Number(product.price).toFixed(2)}
                                        </p>
                                    )}

                                    {product.category_name && (
                                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mb-2">
                                            {product.category_name}
                                        </span>
                                    )}

                                    <Link to={`/details/${product.id}`} className="w-full">
                                        <button className="w-full mt-auto py-2 bg-blue-400 text-white rounded hover:bg-blue-700 transition">
                                            Ver Detalhe
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === "servicos" && (
                <>
                    {filteredServicos.length === 0 ? (
                        <p>Nenhum serviço encontrado</p>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                            {filteredServicos.map((servico: Servico) => (
                                <div
                                    key={servico.id}
                                    className="border rounded-lg p-4 bg-white shadow-sm flex flex-col"
                                >
                                    {servico.image && (
                                        <div className="w-full h-52 mb-4 overflow-hidden rounded">
                                            <img
                                                src={servico.image}
                                                alt={servico.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) =>
                                                (e.currentTarget.src =
                                                    "https://placehold.co/300x200?text=Sem+Imagem")
                                                }
                                            />
                                        </div>
                                    )}

                                    <h3 className="mb-2 font-semibold">{servico.name}</h3>

                                    {servico.description && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {servico.description}
                                        </p>
                                    )}

                                    {servico.price && (
                                        <p className="text-lg font-bold mb-2">
                                            R$ {Number(servico.price).toFixed(2)}
                                        </p>
                                    )}

                                    <button className="w-full mt-auto py-2 bg-blue-400 text-white rounded hover:bg-blue-700 transition">
                                        Ver Serviço
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}