import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServicoDetails } from "./servicoHooks";
import { useUsers } from "./listUsers"
import { useSession } from "../../../auth-client"

export default function ServicosDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { servico, isLoading, error, fetchServicoById } = useServicoDetails()
    const { user, fetchUser } = useUsers()
    const { data: session } = useSession()

    useEffect(() => {
        if (id) {
            fetchServicoById(id)
        }
    }, [id, fetchServicoById])

    useEffect(() => {
        if (servico?.user_id) {
            fetchUser(servico.user_id)
        }
    }, [servico, fetchUser])

    const role = session?.user?.role;
    const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"));

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-slate-600 font-medium font-sans">Carregando detalhes do serviço...</p>
            </div>
        )
    }

    if (error || !servico) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
                <div className="text-6xl mb-4">🔧</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 font-sans">Serviço não encontrado</h2>
                <p className="text-slate-500 mb-6 font-sans">{error || "Não conseguimos encontrar o serviço que você está procurando."}</p>
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

                            <div className="relative aspect-4/5 overflow-hidden rounded-4xl bg-white shadow-2xl ring-1 ring-slate-200 transition-transform duration-700 group-hover:scale-[1.01]">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    src={itemImageUrl(servico.imageUrl)}
                                    alt={servico.name}
                                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x800?text=Servico")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information layers */}
                    <div className="lg:col-span-6 flex flex-col pt-4">
                        <div className="mb-10">
                            <header className="mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Serviço Verificado</span>
                                </div>

                                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                                    {servico.name}
                                </h1>

                                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Orçamento Base</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-slate-900">
                                                R$ {Number(servico.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 mb-10">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                                    Sobre o Especialista
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {servico.description || "Este profissional é um parceiro verificado do Juá Market. Entre em contato diretamente para solicitar um orçamento personalizado e tirar dúvidas."}
                                </p>
                            </div>
                        </div>

                        {/* Professional Elevation Card */}
                        {user && (
                            <div className="relative group/seller">
                                <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-violet-500 rounded-[2.5rem] blur opacity-0 group-hover/seller:opacity-10 transition-opacity duration-500"></div>
                                <div className="relative bg-white rounded-4xl p-8 ring-1 ring-slate-200 shadow-xl shadow-slate-200/50">
                                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 text-2xl font-bold shadow-inner">
                                            {user.name?.[0] || "P"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-xl font-bold text-slate-900">{user.name}</h4>
                                                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {user.history && (
                                        <div className="mb-10 text-slate-500 italic text-sm leading-relaxed relative px-6">
                                            <div className="absolute left-0 top-0 text-3xl text-indigo-100 font-serif leading-none italic select-none">“</div>
                                            {user.history}
                                        </div>
                                    )}

                                    <a
                                        href={`https://wa.me/${user.phone}?text=${encodeURIComponent(
                                            `Olá ${user.name}! Vi seu serviço "${servico.name}" no Market Jua e gostaria de fazer um orçamento.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full bg-green-700 text-white font-bold px-8 py-5 rounded-[1.25rem] hover:bg-green-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] group/btn"
                                    >
                                        <svg className="w-5 h-5 fill-current transform group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        Solicitar orçamento no WhatsApp
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

function itemImageUrl(url?: string) {
    if (!url) return "https://placehold.co/600x800?text=Serviço";
    return url;
}
