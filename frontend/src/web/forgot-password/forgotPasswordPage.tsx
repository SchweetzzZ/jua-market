import { useState } from "react"
import { authClient } from "../../../auth-client"
import { useNavigate } from "react-router-dom"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        try {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            })

            if (error) {
                throw new Error(error.message || "Erro ao solicitar redefinição de senha")
            }

            setMessage("Email de redefinição enviado com sucesso! Verifique sua caixa de entrada.")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img className="h-12 mx-auto mb-6 block object-contain"
                        src="/src/assets/logo-h.png"
                        alt="Logo"
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/200x50?text=Jua+Market")}
                    />
                    <h1 className="text-3xl font-bold text-slate-800">Recuperar Senha</h1>
                    <p className="text-slate-500 mt-2">Enviaremos um link para o seu e-mail</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">E-mail cadastrado*</label>
                            <input
                                className="p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 bg-slate-50/50"
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            className="py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                        >
                            Voltar para o Login
                        </button>
                    </form>

                    {message && (
                        <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100 flex items-start gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
