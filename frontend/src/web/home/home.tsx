import { useEffect, useState } from "react";
import { useHome } from "./homeHooks";
import { useServicos } from "../servicos/servicosHooks";
import { useNavigate } from "react-router-dom";
import { useSession, authClient } from "../../../auth-client";
import { useFavorites } from "../favorites/favoritesHooks";
import facebookIcon from "../../assets/Facebook_logo_(square).png";
import instagramIcon from "../../assets/instagram-6338393_960_720.webp";


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
    const { products, isLoading, error, fetchProducts, totalProducts } = useHome();
    const { servicos, isLoading: isLoadingServicos, error: errorServicos, fetchServicos, totalServicos } = useServicos();
    const { data: session, isPending: sessionPending } = useSession();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("produtos");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Pagination states
    const [productPage, setProductPage] = useState(1);
    const [servicePage, setServicePage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setProductPage(1); // Reset to first page on search
            setServicePage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchProducts(productPage, ITEMS_PER_PAGE, debouncedSearch);
    }, [fetchProducts, productPage, debouncedSearch]);

    useEffect(() => {
        fetchServicos(servicePage, ITEMS_PER_PAGE, debouncedSearch);
    }, [fetchServicos, servicePage, debouncedSearch]);

    const totalPages = activeTab === "produtos"
        ? Math.ceil(totalProducts / ITEMS_PER_PAGE)
        : Math.ceil(totalServicos / ITEMS_PER_PAGE);

    const currentPage = activeTab === "produtos" ? productPage : servicePage;
    const setCurrentPage = activeTab === "produtos" ? setProductPage : setServicePage;

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
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/home")}>
                            <div className="h-10 w-10 bg-linear-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">J</div>
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-violet-600">
                                Juá Market
                            </span>
                        </div>
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">

                            {isAdmin && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="text-slate-600 hover:text-indigo-600 font-semibold transition-all hover:scale-105"
                                >
                                    Admin
                                </button>
                            )}

                            {!session ? (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => navigate("/login")} className="text-slate-700 hover:text-indigo-600 font-bold px-4 py-2 transition">
                                        Entrar</button>
                                    <button onClick={() => navigate("/sign-up")} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 hover:-translate-y-0.5">
                                        Cadastrar</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <button
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 pr-4 rounded-full hover:border-indigo-300 transition-all hover:shadow-md"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase ring-2 ring-white shadow-sm">
                                                {session.user.name?.[0] || "U"}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{session.user.name.split(' ')[0]}</span>
                                            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {userDropdownOpen && (
                                            <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 transform">
                                                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conta</p>
                                                    <p className="text-sm font-bold text-slate-800 truncate">{session.user.email}</p>
                                                </div>
                                                {isSeller && (
                                                    <button
                                                        onClick={() => { navigate("/seller"); setUserDropdownOpen(false); }}
                                                        className="w-full text-left px-4 py-2 text-indigo-600 hover:bg-slate-50 font-bold transition flex items-center gap-2"
                                                    >
                                                        <span className="text-lg">Painel Vendedor</span>
                                                    </button>
                                                )}
                                                <button onClick={() => { navigate("/favoritos"); setUserDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 font-bold transition flex items-center gap-2">
                                                    Favoritos
                                                </button>
                                                <div className="h-px bg-slate-100 my-1 mx-4"></div>
                                                <button
                                                    onClick={async () => {
                                                        await authClient.signOut();
                                                        window.location.reload();
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-slate-50 font-bold transition flex items-center gap-2"
                                                >
                                                    Sair
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden text-slate-600 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm active:scale-95 transition-all" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <span className="text-2xl font-bold">{isMobileMenuOpen ? "✕" : "☰"}</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 px-6 py-8 space-y-6 shadow-2xl h-[calc(100vh-80px)] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => { setActiveTab("produtos"); setIsMobileMenuOpen(false); }}
                                className={`p-4 rounded-2xl font-bold text-center transition-all ${activeTab === 'produtos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-600'}`}>Produtos</button>
                            <button onClick={() => { setActiveTab("servicos"); setIsMobileMenuOpen(false); }} className={`p-4 rounded-2xl font-bold text-center transition-all ${activeTab === 'servicos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-600'}`}>Serviços</button>
                        </div>

                        {!session ? (
                            <div className="space-y-4 pt-4">
                                <button onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }} className="w-full py-4 text-slate-700 font-bold border border-slate-200 rounded-2xl">Entrar</button>
                                <button onClick={() => { navigate("/sign-up"); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100">Criar conta</button>
                            </div>
                        ) : (
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100">
                                    <div className="h-14 w-14 rounded-2xl bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl font-black shadow-md">
                                        {session.user.name?.[0] || "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-900 truncate">{session.user.name}</p>
                                        <p className="text-xs font-medium text-slate-500 truncate">{session.user.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => { navigate("/favoritos"); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-slate-700 font-bold hover:bg-slate-50 rounded-2xl transition-colors">
                                        ❤️ Meus Favoritos
                                    </button>
                                    {(isSeller || isAdmin) && (
                                        <button onClick={() => { navigate("/seller"); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-indigo-600 font-bold bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl transition-colors">
                                            💼 Painel Vendedor
                                        </button>
                                    )}
                                    <button onClick={async () => { await authClient.signOut(); window.location.reload(); }} className="flex items-center gap-4 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors mt-4">
                                        🚪 Sair da conta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="relative pt-20 pb-40 overflow-hidden bg-white">
                {/* Decorative Blobs - Simplified with static opacity to avoid custom animation */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-visible">
                    <div className="absolute top-[10%] right-[-5%] w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px]"></div>
                    <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[0%] right-[20%] w-72 h-72 bg-blue-50 rounded-full blur-[80px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Marketplace de Juazeiro</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
                            Encontre o <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">melhor</span><br />
                            da sua região.
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                            Conectamos você aos serviços e produtos mais exclusivos do Juazeiro. Qualidade local com a praticidade digital.
                        </p>

                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-violet-500 rounded-[28px] blur-sm opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                            <div className="relative flex items-center bg-white rounded-[24px] shadow-2xl overflow-hidden border border-slate-100">
                                <input
                                    type="text"
                                    placeholder={`O que você busca hoje? (${activeTab})`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full py-6 px-4 focus:outline-none text-slate-800 text-lg font-semibold"
                                />
                                <div className="pr-4">
                                    <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-colors">
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                {/* Tabs & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Explore por <span className="text-indigo-600 capitalize">{activeTab}</span>
                        </h2>
                        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit border border-slate-200/50">
                            <button
                                onClick={() => setActiveTab("produtos")}
                                className={`px-10 py-3 rounded-xl font-black text-sm transition-all ${activeTab === "produtos" ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                PRODUTOS
                            </button>
                            <button
                                onClick={() => setActiveTab("servicos")}
                                className={`px-10 py-3 rounded-xl font-black text-sm transition-all ${activeTab === "servicos" ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                SERVIÇOS
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 bg-white px-6 py-4 rounded-4xl border border-slate-100 shadow-lg shadow-slate-200/40">
                        <div className="bg-indigo-50 p-3 rounded-2xl">
                            <div className="text-indigo-600 font-black text-2xl">{activeTab === "produtos" ? totalProducts : totalServicos}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Encontrados</div>
                            <div className="text-slate-800 font-bold text-lg capitalize">{activeTab} Ativos</div>
                        </div>
                    </div>
                </div>

                {error || errorServicos ? (
                    <div className="bg-red-50/50 border-2 border-red-100 p-12 rounded-[3rem] text-center max-w-2xl mx-auto transition-all">
                        <div className="text-5xl mb-6">⚠️</div>
                        <h3 className="text-2xl font-black text-red-800 mb-2">Ops! Algo deu errado</h3>
                        <p className="text-red-600 font-medium">{error || errorServicos}</p>
                        <button onClick={() => window.location.reload()} className="mt-8 bg-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all">Tentar novamente</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-16">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {activeTab === "produtos" ? (
                                products.length === 0 ? (
                                    <EmptyState message="Desculpe, não encontramos este produto no momento." />
                                ) : (
                                    products.map((p: Product) => (
                                        <div key={p.id} className="transition-all duration-300">
                                            <ProductCard item={p} navigate={navigate} />
                                        </div>
                                    ))
                                )
                            ) : (
                                servicos.length === 0 ? (
                                    <EmptyState message="Nenhum profissional disponível para esta busca." />
                                ) : (
                                    servicos.map((s: Servico) => (
                                        <div key={s.id} className="transition-all duration-300">
                                            <ServiceCard item={s} navigate={navigate} />
                                        </div>
                                    ))
                                )
                            )}
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                                >
                                    Anterior
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-12 h-12 rounded-xl border font-bold transition-all ${currentPage === page
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <footer className="bg-white border-t border-slate-100 pt-24 pb-12 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-indigo-600 via-violet-600 to-blue-500"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-slate-50 pb-16 mb-12">
                        <div className="flex flex-col items-center md:items-start max-w-sm">
                            <div className="flex items-center gap-3 mb-6 bg-slate-50 p-2 pr-6 rounded-2xl border border-slate-100 w-fit">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">J</div>
                                <span className="text-2xl font-black text-slate-800 tracking-tight">Market Juá</span>
                            </div>
                            <p className="text-slate-500 text-center md:text-left font-medium leading-relaxed">
                                Transformando a economia local através da tecnologia. O seu marketplace de confiança no coração do Juazeiro.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
                            <div className="space-y-4">
                                <p className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Marketplace</p>
                                <ul className="space-y-3 font-bold text-slate-500">
                                    <li><button onClick={() => setActiveTab('produtos')} className="hover:text-indigo-600 transition-colors">Produtos</button></li>
                                    <li><button onClick={() => setActiveTab('servicos')} className="hover:text-indigo-600 transition-colors">Serviços</button></li>
                                    <li><button onClick={() => navigate("/favoritos")} className="hover:text-indigo-600 transition-colors cursor-pointer">FavoritosTESTE</button></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <p className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Legal</p>
                                <ul className="space-y-3 font-bold text-slate-500">
                                    <li className="hover:text-indigo-600 transition-colors cursor-pointer">Privacidade</li>
                                    <li className="hover:text-indigo-600 transition-colors cursor-pointer">Termos de uso</li>
                                </ul>
                            </div>
                            <div className="col-span-2 sm:col-span-1 space-y-4">
                                <p className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Comunidade</p>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 transition-all cursor-pointer overflow-hidden">
                                        <a href="https://www.facebook.com/juazeirooficial/?locale=pt_BR"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-full block"
                                        >
                                            <img src={facebookIcon} alt="Facebook" className="w-full h-full object-cover" />
                                        </a>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 transition-all cursor-pointer overflow-hidden">
                                        <a href="https://www.instagram.com/prefeituradejuazeiro/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-full block"
                                        >
                                            <img src={instagramIcon} alt="Instagram" className="w-full h-full object-cover" />
                                        </a>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 transition-all cursor-pointer">t</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-400 text-sm font-bold">© {new Date().getFullYear()} Juá Marketplace Tecnologia LTDA.</p>
                        <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <span className="hover:text-indigo-500 cursor-pointer transition-colors">Segurança</span>
                            <span className="hover:text-indigo-500 cursor-pointer transition-colors">Acessibilidade</span>
                            <span className="hover:text-indigo-500 cursor-pointer transition-colors">Suporte</span>
                        </div>
                    </div>
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