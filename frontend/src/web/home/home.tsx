import { useEffect, useState, useMemo } from "react";
import { useHome } from "./homeHooks";
import { useServicos } from "../servicos/servicosHooks";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSession } from "../../../auth-client";

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

    const { data: session } = useSession();

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
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-10 mb-8 border-b border-blue-800">
                <div className="max-w-6xl mx-auto relative">
                    <div className="flex justify-center mb-6">
                        <input
                            type="text"
                            placeholder={`Procurar ${activeTab === "produtos" ? "produto" : "serviço"}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full max-w-[500px] p-4 rounded-xl border border-blue-300 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-black"
                        />
                    </div>

                    <div className="absolute top-0 right-0 flex gap-3">
                        {(() => {
                            const role = session?.user?.role;
                            const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"));
                            return isAdmin && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="px-4 py-2 bg-slate-800 text-white font-semibold hover:bg-slate-900 rounded-lg transition shadow-md"
                                >
                                    Admin
                                </button>
                            );
                        })()}
                        <button
                            onClick={() => navigate("/sign-up")}
                            className="px-4 py-2 bg-blue-700 text-white font-semibold hover:bg-blue-900 rounded-lg transition shadow-md"
                        >
                            Cadastrar
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-900 rounded-lg shadow-md transition"
                        >
                            Login
                        </button>
                    </div>

                    <div className="flex justify-center gap-8 mt-4">
                        <button
                            onClick={() => setActiveTab("produtos")}
                            className={`pb-2 px-4 transition-all border-b-2 font-semibold ${activeTab === "produtos" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-400"}`}
                        >
                            Produtos
                        </button>

                        <button
                            onClick={() => setActiveTab("servicos")}
                            className={`pb-2 px-4 transition-all border-b-2 font-semibold ${activeTab === "servicos" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-400"}`}
                        >
                            Serviços
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-10">
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

                                        <Link to={`/produtos/${product.id}`} className="w-full">
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

                {activeTab === "servicos" && (<> {filteredServicos.length === 0 ? (
                    <p>Nenhum serviço encontrado</p>) : (
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
                                <Link to={`/servicos/${servico.id}`} className="w-full">
                                    <button className="w-full mt-auto py-2 bg-blue-400 text-white rounded hover:bg-blue-700 transition">
                                        Ver Detalhes
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    );
}