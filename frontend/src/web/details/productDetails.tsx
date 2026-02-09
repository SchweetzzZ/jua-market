import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDetails } from "./detalshooks"
import { useUsers } from "./listUsers"
import { useSession } from "../../../auth-client"

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { product, isLoading, error, fetchProductById } = useDetails()
    const { user, fetchUser } = useUsers()
    const { data: session } = useSession()

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

    const role = session?.user?.role;
    const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"));

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-slate-600 font-medium font-sans">Carregando detalhes...</p>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 font-sans">Produto não encontrado</h2>
                <p className="text-slate-500 mb-6 font-sans">{error || "Não conseguimos encontrar o produto que você está procurando."}</p>
                <button
                    onClick={() => navigate("/")}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-sans"
                >
                    Voltar para a Home
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
            {/* Simple Navbar for Details */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">M</div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                Market Jua
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {isAdmin && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 transition"
                                >
                                    Painel Admin
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/")}
                                className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 transition"
                            >
                                Início
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Image Section */}
                    <div className="relative group">
                        <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-slate-100">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={itemImageUrl(product.imageUrl)}
                                alt={product.name}
                                onError={(e) => (e.currentTarget.src = "https://placehold.co/600x800?text=Indisponível")}
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest mb-4">
                                Produto
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Investimento:</span>
                                <span className="text-4xl font-black text-indigo-600">
                                    R$ {Number(product.price).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-lg text-slate-600 leading-relaxed bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-8">
                                {product.description || "Este produto ainda não possui uma descrição detalhada."}
                            </p>
                        </div>

                        {/* Seller Card */}
                        {user && (
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200">
                                        {user.name?.[0] || "V"}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Vendedor Parceiro</p>
                                        <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                                    </div>
                                </div>
                                {user.history && (
                                    <div className="bg-slate-50 p-4 rounded-2xl mb-6 relative italic text-slate-600 text-sm break-words">
                                        <span className="absolute -top-3 -left-1 text-4xl text-indigo-200 opacity-50 font-serif">“</span>
                                        {user.history}
                                    </div>
                                )}
                                <a
                                    href={`https://wa.me/${user.phone}?text=${encodeURIComponent(
                                        `Olá ${user.name}! Vi seu produto "${product.name}" no Market Jua e gostaria de saber mais informações.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-emerald-500 text-white font-black px-6 py-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    <span className="text-xl">💬</span>
                                    <span>Negociar no WhatsApp</span>
                                </a>
                            </div>
                        )}

                        <button
                            onClick={() => navigate("/home")}
                            className="text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-2 transition px-4 py-2 self-start"
                        >
                            ← Voltar para listagem
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

function itemImageUrl(url?: string) {
    if (!url) return "https://placehold.co/600x800?text=Sem+Imagem";
    return url;
}
