import { useState } from "react"
import { authClient } from "../../../auth-client"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get("token") || ""

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("As senhas não coincidem")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const { error } = await authClient.resetPassword({
                newPassword: password,
                token: token,
            })

            if (error) {
                throw new Error(error.message || "Erro ao redefinir senha. O link pode ter expirado.")
            }

            alert("Senha redefinida com sucesso!")
            navigate("/login")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
                <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-slate-100 max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Inválido</h1>
                    <p className="text-slate-500 mb-6">Este link de redefinição de senha é inválido ou já foi utilizado.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                        Voltar para o Login
                    </button>
                </div>
            </div>
        )
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
                    <h1 className="text-3xl font-bold text-slate-800">Nova Senha</h1>
                    <p className="text-slate-500 mt-2">Crie uma senha forte e segura</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">Nova Senha*</label>
                            <input
                                className="p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 bg-slate-50/50"
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 ml-1">Confirmar Nova Senha*</label>
                            <input
                                className="p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 bg-slate-50/50"
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 italic">
                                {error}
                            </div>
                        )}

                        <button
                            className="mt-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
