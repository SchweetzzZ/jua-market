import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useServicoDetails } from "./servicoHooks"
import { useUsers } from "./listUsers"
import { useSession } from "../../../auth-client"
import CommentsSection from "../comments/CommentsSection"

export default function ServicosDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { servico, isLoading, error, fetchServicoById } = useServicoDetails()
    const { user, fetchUser } = useUsers()
    const { data: session } = useSession()

    useEffect(() => {
        if (id) fetchServicoById(id)
    }, [id, fetchServicoById])

    useEffect(() => {
        if (servico?.user_id) fetchUser(servico.user_id)
    }, [servico, fetchUser])

    const role = session?.user?.role
    const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"))

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400">Carregando...</p>
                </div>
            </div>
        )
    }

    if (error || !servico) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center gap-4">
                <p className="text-slate-400 text-sm">Serviço não encontrado</p>
                <button
                    onClick={() => navigate("/home")}
                    className="text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600 transition-colors"
                >
                    Voltar para a vitrine
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">

            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center gap-2 text-slate-900 font-semibold text-sm hover:opacity-70 transition-opacity"
                    >
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded flex items-center justify-center text-xs font-bold">J</span>
                        Juá Market
                    </button>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate("/home")}
                            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Vitrine
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Admin
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* Voltar */}
                <button
                    onClick={() => navigate("/home")}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar
                </button>

                {/* Layout principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* Imagem */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-slate-200 transition-transform duration-700 hover:scale-[1.01] group">
                            <img
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                src={servico.imageUrl || "https://placehold.co/600x800?text=Serviço"}
                                alt={servico.name}
                                onError={(e) => (e.currentTarget.src = "https://placehold.co/600x800?text=Serviço")}
                            />
                        </div>
                    </div>

                    {/* Informações */}
                    <div className="flex flex-col gap-8">

                        {/* Cabeçalho */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Serviço</span>
                            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 leading-snug">
                                {servico.name}
                            </h1>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">A partir de</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    R$ {Number(servico.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Divisor */}
                        <hr className="border-slate-100" />

                        {/* Descrição */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Sobre o serviço</p>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {servico.description || "Nenhuma descrição fornecida pelo profissional."}
                            </p>
                        </div>

                        {/* Divisor */}
                        <hr className="border-slate-100" />

                        {/* Profissional */}
                        {user && (
                            <div className="flex flex-col gap-5">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Profissional</p>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                                        {user.name?.[0]?.toUpperCase() || "P"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-400">Profissional verificado</p>
                                    </div>
                                </div>

                                {user.history && (
                                    <p className="text-sm text-slate-500 leading-relaxed pl-1 border-l-2 border-slate-200">
                                        {user.history}
                                    </p>
                                )}

                                <a
                                    href={`https://wa.me/${user.phone}?text=${encodeURIComponent(
                                        `Olá ${user.name}! Vi seu serviço "${servico.name}" no Juá Market e gostaria de fazer um orçamento.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Solicitar orçamento
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comentários */}
                <div className="mt-20 pt-10 border-t border-slate-100">
                    <CommentsSection serviceId={id} />
                </div>
            </main>
        </div>
    )
}
