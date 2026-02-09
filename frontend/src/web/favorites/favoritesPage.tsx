import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "./favoritesHooks";
import { useSession, authClient } from "../../../auth-client";

export default function FavoritesPage() {
    const navigate = useNavigate();
    const { favorites, isLoading, fetchFavorites, removeFavorite } = useFavorites();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"produtos" | "servicos">("produtos");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleRemoveFavorite = async (itemId: string, itemType: "product" | "service") => {
        try {
            await removeFavorite(itemId, itemType);
            fetchFavorites(); // Recarregar favoritos
        } catch (error) {
            console.error("Erro ao remover favorito:", error);
        }
    };

    const role = session?.user?.role;
    const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"));

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-slate-600 font-medium">Carregando favoritos...</p>
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

                            {session && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-slate-100 p-1 pr-4 rounded-full">
                                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                                            {session.user.name?.[0] || "U"}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{session.user.name}</span>
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
                        {session && (
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
            <div className="relative overflow-hidden bg-white pt-16 pb-20 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Meus <span className="text-indigo-600">Favoritos</span> ❤️
                        </h1>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Aqui estão todos os produtos e serviços que você salvou.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="flex bg-slate-200/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("produtos")}
                            className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === "produtos" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Produtos ({favorites.products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("servicos")}
                            className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === "servicos" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Serviços ({favorites.services.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {activeTab === "produtos" ? (
                        favorites.products.length === 0 ? (
                            <EmptyState message="Nenhum produto favoritado ainda" />
                        ) : (
                            favorites.products.map((item) => (
                                <FavoriteCard
                                    key={item.id}
                                    item={item}
                                    type="product"
                                    onRemove={() => handleRemoveFavorite(item.id, "product")}
                                    navigate={navigate}
                                />
                            ))
                        )
                    ) : (
                        favorites.services.length === 0 ? (
                            <EmptyState message="Nenhum serviço favoritado ainda" />
                        ) : (
                            favorites.services.map((item) => (
                                <FavoriteCard
                                    key={item.id}
                                    item={item}
                                    type="service"
                                    onRemove={() => handleRemoveFavorite(item.id, "service")}
                                    navigate={navigate}
                                />
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

interface FavoriteCardProps {
    item: any;
    type: "product" | "service";
    onRemove: () => void;
    navigate: any;
}

function FavoriteCard({ item, type, onRemove, navigate }: FavoriteCardProps) {
    return (
        <div className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
            {/* Botão de remover */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-500 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                title="Remover dos favoritos"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            </button>

            <div
                onClick={() => navigate(type === "product" ? `/produtos/${item.id}` : `/servicos/${item.id}`)}
                className="cursor-pointer flex flex-col flex-1"
            >
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
                        {item.description || "Sem descrição disponível."}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                {type === "product" ? "A partir de" : "Investimento"}
                            </span>
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
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-xl font-medium text-slate-400">{message}</p>
        </div>
    );
}
