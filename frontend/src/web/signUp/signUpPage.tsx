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
        <div>
            <h1>Cadastro</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>

            {error && <p>{error}</p>}
        </div>
    )
}