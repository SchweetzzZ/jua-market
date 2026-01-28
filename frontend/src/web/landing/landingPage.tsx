import { useNavigate } from "react-router-dom"

export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 
                        flex items-center justify-center p-10">
            <div className="max-w-4xl w-full text-center">

                <img src="src/assets/logo-h.png" alt="Market Jua" className="h-20 mx-auto mb-8" />

                <h1 className="text-5xl font-bold text-gray-800 mb-4">Market Jua</h1>

                <p className="text-xl text-gray-600 mb-12">Conectando compradores e vendedores em sua região</p>

                <div className="flex gap-6 justify-center mb-12">
                    <button
                        onClick={() => navigate('/home')}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 
                                   transition shadow-lg">
                        🛍️ Ver Produtos e Serviços
                    </button>

                    <button
                        onClick={() => navigate('/sign-up')}
                        className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 
                                   transition shadow-lg border-2 border-blue-600"
                    >
                        💼 Quero Ser Vendedor
                    </button>
                </div>

                <div className="flex gap-8 justify-center text-gray-700">
                    <div>
                        <p className="text-3xl font-bold">100+</p>
                        <p className="text-sm">Produtos</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">50+</p>
                        <p className="text-sm">Serviços</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">200+</p>
                        <p className="text-sm">Usuários</p>
                    </div>
                </div>
            </div>
        </div>
    )
}