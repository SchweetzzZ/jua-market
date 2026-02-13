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
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Split Background Effect for Depth */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-slate-50 to-white pointer-events-none border-b border-slate-100"></div>

            {/* Sophisticated Navbar */}
            <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/home")}>
                            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-100 transition-all group-hover:rotate-6">J</div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">
                                Juá Market
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate("/")}
                                className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                Início
                            </button>
                            {isAdmin && (
                                <div className="h-4 w-px bg-slate-200"></div>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    Admin
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <button
                    onClick={() => navigate("/home")}
                    className="group flex items-center gap-3 text-slate-400 hover:text-indigo-600 text-xs font-black uppercase tracking-widest transition-all mb-12"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    Voltar para a vitrine
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Image Stack */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative group">
                            {/* Decorative backing for the image card */}
                            <div className="absolute -inset-4 bg-indigo-50/50 rounded-[2.5rem] -rotate-1 scale-[0.98] blur-sm pointer-events-none group-hover:rotate-0 transition-transform duration-700"></div>

                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200 transition-transform duration-700 group-hover:scale-[1.01]">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    src={itemImageUrl(product.imageUrl)}
                                    alt={product.name}
                                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x800?text=Indisponivel")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-6 flex flex-col pt-2">
                        <div className="max-w-xl w-full space-y-8">

                            <header className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                                        Venda Local em Juazeiro
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-end gap-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Preço
                                    </span>
                                    <span className="text-3xl md:text-4xl font-bold text-indigo-600">
                                        R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </header>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
                                    Descrição
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-base">
                                    {product.description || "Este item está sendo anunciado por um vendedor local no Juá Market. Entre em contato para mais detalhes do produto."}
                                </p>
                            </div>

                            {user && (
                                <div className="bg-white rounded-2xl p-6 ring-1 ring-slate-200 shadow-sm space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 text-lg font-bold">
                                            {user.name?.[0] || "V"}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900">{user.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                Anunciante
                                            </p>
                                        </div>
                                    </div>

                                    {user.history && (
                                        <p className="text-sm text-slate-500 italic">
                                            {user.history}
                                        </p>
                                    )}

                                    <a
                                        href={`https://wa.me/${user.phone}?text=${encodeURIComponent(
                                            `Olá ${user.name}! Vi seu produto "${product.name}" no Market Jua e gostaria de saber mais informações.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-semibold px-6 py-4 rounded-xl hover:bg-green-700 transition"
                                    >
                                        Negociar no WhatsApp
                                    </a>
                                </div>
                            )}

                        </div>
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