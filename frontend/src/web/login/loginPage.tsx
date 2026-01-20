import { useState } from "react"
import { login } from "./hooks"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await login(email, password)
            navigate("/home")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-slate-50 h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <img className="h-14 mx-auto mb-8 block object-contain"
                    src="src/assets/logo-h.png"
                    alt="Logo"
                />
                <form className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-10 flex flex-col gap-6"
                    onSubmit={handleSubmit}
                >
                    <div className="text-center mb-2">
                        <h1 className="text-3xl font-bold text-slate-800">Bem-vindo</h1>
                        <p className="text-slate-500 mt-2">Faça login para continuar</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">E-mail*</label>
                        <input className="p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2
                         focus:ring-blue-200 outline-none transition-all text-slate-800"
                            id="email" type="email" placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-slate-700 ml-1"
                        >
                            Senha*
                        </label>
                        <input className="p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2
                         focus:ring-blue-200 outline-none transition-all text-slate-800"
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="mt-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-lg
                         hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200
                          disabled:opacity-70 disabled:pointer-events-none"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 italic">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
