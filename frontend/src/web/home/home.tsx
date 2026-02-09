import { useEffect, useState, useMemo } from "react";
import { useHome } from "./homeHooks";
import { useServicos } from "../servicos/servicosHooks";
import { useNavigate } from "react-router-dom";
import { useSession, authClient } from "../../../auth-client";
import { useFavorites } from "../favorites/favoritesHooks";

interface Product {
    id: string | number;
    name: string;
    description?: string;
    price?: number | string;
    imageUrl?: string;
    category_name?: string;
}

interface Servico {
    id: string | number;
    name: string;
    description?: string;
    price?: number | string;
    imageUrl?: string;
}

type Tab = "produtos" | "servicos";

export default function Home() {
    const { products, isLoading, error, fetchProducts } = useHome();
    const { servicos, isLoading: isLoadingServicos, error: errorServicos, fetchServicos } = useServicos();
    const { data: session, isPending: sessionPending } = useSession();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("produtos");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchServicos();
    }, [fetchProducts, fetchServicos]);

    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products;
        return products.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));
    }, [products, search]);

    const filteredServicos = useMemo(() => {
        if (!search.trim()) return servicos;
        return servicos.filter((s: Servico) => s.name.toLowerCase().includes(search.toLowerCase()));
    }, [servicos, search]);

    const role = session?.user?.role;
    const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"));
    const isSeller = role === "seller" || (Array.isArray(role) && role.includes("seller"));

    if (isLoading || isLoadingServicos || sessionPending) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-slate-600 font-medium">Carregando Market Jua...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">M</div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                Market Jua
                            </span>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <span className="text-2xl">{isMobileMenuOpen ? "✕" : "☰"}</span>
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            {isAdmin && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 transition"
                                >
                                    Painel Admin
                                </button>
                            )}

                            {!session ? (
                                <>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 transition"
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        onClick={() => navigate("/sign-up")}
                                        className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                    >
                                        Cadastrar
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-4">
                                    {/* User Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="flex items-center gap-3 bg-slate-100 p-1 pr-4 rounded-full hover:bg-slate-200 transition"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                                                {session.user.name?.[0] || "U"}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{session.user.name}</span>
                                            <svg className={`w-4 h-4 text-slate-600 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {userDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                                                {/* Opção Vendedor */}
                                                {(isSeller || isAdmin) && (
                                                    <button
                                                        onClick={() => {
                                                            navigate("/seller");
                                                            setUserDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-bold transition flex items-center gap-2 border-b border-slate-50 mb-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        Painel do Vendedor
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        navigate("/favoritos");
                                                        setUserDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                    </svg>
                                                    Favoritos
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={async () => {
                                            await authClient.signOut();
                                            window.location.reload();
                                        }}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm px-2 py-1 transition"
                                    >
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-4 shadow-xl">
                        {isAdmin && (
                            <button
                                onClick={() => { navigate("/admin"); setIsMobileMenuOpen(false); }}
                                className="block w-full text-left text-slate-600 font-medium py-2"
                            >
                                Painel Admin
                            </button>
                        )}
                        {!session ? (
                            <div className="space-y-4">
                                <button
                                    onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                                    className="block w-full text-left text-slate-600 font-medium py-2"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => { navigate("/sign-up"); setIsMobileMenuOpen(false); }}
                                    className="block w-full text-center bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                                >
                                    Cadastrar
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold uppercase">
                                        {session.user.name?.[0] || "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{session.user.name}</p>
                                        <p className="text-xs text-slate-500">{session.user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { navigate("/favoritos"); setIsMobileMenuOpen(false); }}
                                    className="w-full text-left text-slate-700 hover:text-indigo-600 font-medium py-2 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    Meus Favoritos
                                </button>
                                {(isSeller || isAdmin) && (
                                    <button
                                        onClick={() => { navigate("/seller"); setIsMobileMenuOpen(false); }}
                                        className="w-full text-left text-indigo-600 hover:bg-indigo-50 font-bold py-2 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Painel do Vendedor
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        await authClient.signOut();
                                        window.location.reload();
                                    }}
                                    className="w-full text-center text-red-500 font-bold py-2"
                                >
                                    Sair da conta
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white pt-16 pb-32 border-b border-slate-100">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Encontre tudo o que <span className="text-indigo-600">você precisa</span> aqui.
                        </h1>
                        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                            O melhor marketplace regional para serviços e produtos exclusivos. Qualidade e confiança em um só lugar.
                        </p>

                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <span className="text-slate-400 group-focus-within:text-indigo-500 transition-colors text-xl"></span>
                            </div>
                            <input
                                type="text"
                                placeholder={`Procurar ${activeTab === "produtos" ? "um produto incrível..." : "um serviço profissional..."}`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 text-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Tabs & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex bg-slate-200/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("produtos")}
                            className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === "produtos" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Produtos
                        </button>
                        <button
                            onClick={() => setActiveTab("servicos")}
                            className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === "servicos" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Serviços
                        </button>
                    </div>

                    <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                        Total: <span className="text-indigo-600">{activeTab === "produtos" ? filteredProducts.length : filteredServicos.length}</span> {activeTab}
                    </div>
                </div>

                {error || errorServicos ? (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
                        <p className="text-red-600 font-medium">Ops! {error || errorServicos}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {activeTab === "produtos" ? (
                            filteredProducts.length === 0 ? (
                                <EmptyState message="Nenhum produto encontrado" />
                            ) : (
                                filteredProducts.map((p: Product) => (
                                    <ProductCard key={p.id} item={p} navigate={navigate} />
                                ))
                            )
                        ) : (
                            filteredServicos.length === 0 ? (
                                <EmptyState message="Nenhum serviço encontrado" />
                            ) : (
                                filteredServicos.map((s: Servico) => (
                                    <ServiceCard key={s.id} item={s} navigate={navigate} />
                                ))
                            )
                        )}
                    </div>
                )}
            </div>

            <footer className="bg-white border-t border-slate-200 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-6 bg-slate-400 rounded flex items-center justify-center text-white font-bold text-sm">M</div>
                        <span className="font-bold text-slate-500">Market Jua</span>
                    </div>
                    <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

function ProductCard({ item, navigate }: { item: Product; navigate: any }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const { addFavorite, removeFavorite, checkFavorite } = useFavorites();
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            checkFavorite(String(item.id), "product").then((result) => {
                setIsFavorite(result.isFavorite);
            });
        }
    }, [item.id, session]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session) {
            navigate("/login");
            return;
        }

        try {
            if (isFavorite) {
                await removeFavorite(String(item.id), "product");
                setIsFavorite(false);
            } else {
                await addFavorite(String(item.id), "product");
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Erro ao gerenciar favorito:", error);
        }
    };

    return (
        <div
            onClick={() => navigate(`/produtos/${item.id}`)}
            className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative"
        >
            {/* Botão de favoritar */}
            <button
                onClick={handleFavoriteClick}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all hover:scale-110 ${isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500"
                    }`}
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
                <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>

            <div className="relative h-64 overflow-hidden">
                <img
                    src={item.imageUrl || "https://placehold.co/600x400?text=Sem+Imagem"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Indisponível")}
                />
                {item.category_name && (
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-indigo-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            {item.category_name}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                    {item.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">
                    {item.description || "Sem descrição disponível para este produto."}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">A partir de</span>
                        <p className="text-xl font-black text-indigo-600">
                            R$ {Number(item.price).toFixed(2)}
                        </p>
                    </div>
                    <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <span>→</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ServiceCard({ item, navigate }: { item: Servico; navigate: any }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const { addFavorite, removeFavorite, checkFavorite } = useFavorites();
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            checkFavorite(String(item.id), "service").then((result) => {
                setIsFavorite(result.isFavorite);
            });
        }
    }, [item.id, session]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session) {
            navigate("/login");
            return;
        }

        try {
            if (isFavorite) {
                await removeFavorite(String(item.id), "service");
                setIsFavorite(false);
            } else {
                await addFavorite(String(item.id), "service");
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Erro ao gerenciar favorito:", error);
        }
    };

    return (
        <div
            onClick={() => navigate(`/servicos/${item.id}`)}
            className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative"
        >
            {/* Botão de favoritar */}
            <button
                onClick={handleFavoriteClick}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all hover:scale-110 ${isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500"
                    }`}
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
                <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>

            <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                    src={item.imageUrl || "https://placehold.co/600x400?text=Serviço"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Serviço")}
                />
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                    {item.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">
                    {item.description || "Profissional altamente qualificado disponível agora."}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Investimento</span>
                        <p className="text-xl font-black text-indigo-600">
                            R$ {Number(item.price).toFixed(2)}
                        </p>
                    </div>
                    <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <span>→</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-medium text-slate-400">{message}</p>
        </div>
    );
}