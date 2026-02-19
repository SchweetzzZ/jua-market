import { useState, useEffect } from "react"
import { useComments } from "./hooks"
import { useSession } from "../../../auth-client"

interface CommentsSectionProps {
    productId?: string
    serviceId?: string
}

export default function CommentsSection({ productId, serviceId }: CommentsSectionProps) {
    const { comments, isLoading, error, fetchCommentsByProductId, fetchCommentsByServiceId, createComment, deleteComment } = useComments()
    const { data: session } = useSession()
    const [newComment, setNewComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (productId) {
            fetchCommentsByProductId(productId)
        } else if (serviceId) {
            fetchCommentsByServiceId(serviceId)
        }
    }, [productId, serviceId, fetchCommentsByProductId, fetchCommentsByServiceId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsSubmitting(true)
        const success = await createComment({
            comment: newComment,
            product_id: productId,
            service_id: serviceId,
        })

        if (success) {
            setNewComment("")
        }
        setIsSubmitting(false)
    }

    const handleDelete = async (commentId: string) => {
        if (window.confirm("Deseja realmente excluir este comentário?")) {
            await deleteComment(commentId, { product_id: productId, service_id: serviceId })
        }
    }

    return (
        <div className="mt-12 space-y-8 bg-white rounded-2xl p-6 lg:p-8 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Comentários ({comments.length})
                </h3>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* Comment Form */}
            {session ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="O que você achou deste item? Deixe sua dúvida ou comentário..."
                            className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none text-slate-700 bg-slate-50/50"
                            required
                        />
                        <div className="absolute inset-0 rounded-xl pointer-events-none group-focus-within:ring-2 group-focus-within:ring-indigo-100 transition-all opacity-0 group-focus-within:opacity-100"></div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Enviando...
                                </>
                            ) : "Publicar comentário"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-indigo-50 rounded-xl p-6 text-center border border-indigo-100">
                    <p className="text-indigo-800 font-medium mb-3">Deseja comentar?</p>
                    <p className="text-indigo-600 text-sm mb-4">Faça login para compartilhar sua opinião ou tirar dúvidas.</p>
                    <a href="/login" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm">
                        Entrar agora
                    </a>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {isLoading && comments.length === 0 ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="group relative flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex-shrink-0">
                                {comment.user?.image ? (
                                    <img src={comment.user.image} alt={comment.user.name} className="w-10 h-10 rounded-full border border-slate-200" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                                        {comment.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{comment.user?.name || "Usuário"}</span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500">
                                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : ""}
                                        </span>
                                    </div>
                                    {session?.user?.id === comment.user_id && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Excluir comentário"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <p className="text-slate-600 leading-relaxed text-[15px]">
                                    {comment.comment}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
                        <div className="text-4xl mb-3 opacity-20">💬</div>
                        <p className="text-slate-400 font-medium">Nenhum comentário ainda.</p>
                        <p className="text-xs text-slate-300 mt-1">Seja o primeiro a deixar uma opinião!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
