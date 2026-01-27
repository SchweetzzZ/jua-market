import { useState } from "react"
import { register } from "./hooks"
import { useNavigate } from "react-router-dom"

export default function CadastroPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await register(email, password, name)
            navigate("/login")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="w-full max-w-md">
                <img className="h-14 mx-auto mb-8 block object-contain" src="src/assets/logo-h.png" alt="" />
                <form className="flex flex-col rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.30)] h-full gap-2 p-10"
                    onSubmit={handleSubmit}>
                    <label htmlFor="email">E-mail*</label>
                    <input
                        className="w-full rounded-xl border border-gray-300 p-3 outline-none 
                        focus:border-sky-600 focus:ring-2 focus:ring-sky-300 transition"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <label htmlFor="name">Nome*</label>
                    <input
                        className="w-full rounded-xl border border-gray-300 p-3 outline-none 
                        focus:border-sky-600 focus:ring-2 focus:ring-sky-300 transition"
                        type="text"
                        placeholder="Nome"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                    <label htmlFor="password">Senha*</label>
                    <input
                        className="w-full rounded-xl border border-gray-300 p-3 outline-none 
                        focus:border-sky-600 focus:ring-2 focus:ring-sky-300 transition"
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />


                    <button type="submit" disabled={isLoading}
                        className="w-full rounded-xl bg-blue-500 text-white font-bold py-3"
                    >
                        {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                {error && <p>{error}</p>}
            </div>
            <p>Torne-se um vendedor()</p>
        </div>
    )
}