import { useEffect, useState } from 'react'
import { api } from './lib/api'
import { useSession } from '../auth-client'
import { authClient } from '../auth-client'

type Product = {
  id: string
  name: string
  description: string
  image: string
  price: string
  category_name: string
}

type Service = {
  id: string
  name: string
  description: string
  image: string
  price: string
  category_name: string
}

function App() {
  const { data: session, isPending } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // LOG 1: Estado da sessão
  console.log('🔵 APP RENDER - Estado da sessão:', {
    session: !!session,
    isPending,
    isLoggingIn,
    loaded,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    userRole: (session?.user as any)?.role // Pode estar em user.data
  })

  // Efeito para fazer login automaticamente se não houver sessão
  useEffect(() => {
    console.log('🔄 useEffect[login] - session:', !!session, 'isPending:', isPending, 'isLoggingIn:', isLoggingIn)

    if (!session && !isPending && !isLoggingIn) {
      console.log('🔐 Nenhuma sessão encontrada, fazendo login automático...')
      setIsLoggingIn(true)

      const autoLogin = async () => {
        try {
          const result = await authClient.signIn.email({
            email: 'jonatasadmin@email.com',
            password: 'polegadas5000',
          })

          console.log('✅ Login automático bem-sucedido:', result)
        } catch (error) {
          console.error('❌ Erro no login automático:', error)
          setIsLoggingIn(false)
        }
      }

      autoLogin()
    }
  }, [session, isPending, isLoggingIn])

  const loadData = async () => {
    console.log('📥 loadData chamado - session:', !!session, 'loaded:', loaded)
    setApiError(null)

    if (!session) {
      console.log('⚠️  Não há sessão, não posso carregar dados')
      return
    }

    console.log('🔵 Iniciando loadData, sessão:', {
      email: session.user?.email,
      id: session.user?.id,
      role: (session.user as any)?.role,
      rawUser: session.user
    })

    try {
      // ==================== BUSCAR PRODUTOS ====================
      console.log('🟡 ========== BUSCANDO PRODUTOS ==========')
      console.log('🟡 Usando api.products.all.get() para /products/all')

      const prodRes = await api.products.all.get()
      console.log('📦 Resposta produtos:', prodRes)

      // Verificar se há erro de permissão (403)
      if ((prodRes.data as any)?.success === false) {
        const errorMsg = (prodRes.data as any)?.message || 'Erro ao buscar produtos'
        console.log('❌ API retornou erro:', errorMsg)
        setApiError(`Produtos: ${errorMsg}`)

        // Verificar se é erro de permissão
        if (errorMsg.includes('permissão') || errorMsg.includes('Acesso negado')) {
          console.log('⚠️  Possível problema de permissão. Verificando role do usuário...')
          console.log('📋 User completo:', session.user)
        }
      }

      // Extrair dados - baseado na estrutura do seu backend
      let productsData: Product[] = []

      // Estrutura 1: { success: true, data: [...] }
      if ((prodRes.data as any)?.success === true && Array.isArray((prodRes.data as any)?.data)) {
        productsData = (prodRes.data as any).data
        console.log(`📊 ${productsData.length} produtos encontrados (estrutura 1)`)
      }
      // Estrutura 2: { data: [...] } (sem success)
      else if (Array.isArray((prodRes.data as any)?.data)) {
        productsData = (prodRes.data as any).data
        console.log(`📊 ${productsData.length} produtos encontrados (estrutura 2)`)
      }
      // Estrutura 3: Array direto
      else if (Array.isArray(prodRes.data)) {
        productsData = prodRes.data
        console.log(`📊 ${productsData.length} produtos encontrados (estrutura 3)`)
      }
      // Estrutura 4: { products: [...] }
      else if (Array.isArray((prodRes.data as any)?.products)) {
        productsData = (prodRes.data as any).products
        console.log(`📊 ${productsData.length} produtos encontrados (estrutura 4)`)
      }
      else {
        console.log('⚠️  Estrutura de dados desconhecida:', prodRes.data)
      }

      setProducts(productsData)

      // Log dos primeiros produtos
      if (productsData.length > 0) {
        console.log('📦 Primeiros produtos:', productsData.slice(0, 3).map(p => ({
          id: p.id?.substring(0, 8),
          name: p.name,
          price: p.price
        })))
      }

      console.log('🟡 ========== FIM PRODUTOS ==========')

      // ==================== BUSCAR SERVIÇOS ====================
      console.log('🛠️  ========== BUSCANDO SERVIÇOS ==========')
      console.log('🛠️  Usando api.servicos.all.get() para /servicos/all')

      const servRes = await api.servicos.all.get()
      console.log('🛠️  Resposta serviços:', servRes)

      // Extrair dados de serviços
      let servicesData: Service[] = []

      if ((servRes.data as any)?.success === true && Array.isArray((servRes.data as any)?.data)) {
        servicesData = (servRes.data as any).data
        console.log(`📊 ${servicesData.length} serviços encontrados (estrutura 1)`)
      }
      else if (Array.isArray((servRes.data as any)?.data)) {
        servicesData = (servRes.data as any).data
        console.log(`📊 ${servicesData.length} serviços encontrados (estrutura 2)`)
      }
      else if (Array.isArray(servRes.data)) {
        servicesData = servRes.data
        console.log(`📊 ${servicesData.length} serviços encontrados (estrutura 3)`)
      }
      else if (Array.isArray((servRes.data as any)?.servicos)) {
        servicesData = (servRes.data as any).servicos
        console.log(`📊 ${servicesData.length} serviços encontrados (estrutura 4)`)
      }
      else {
        console.log('⚠️  Estrutura de serviços desconhecida:', servRes.data)
      }

      setServices(servicesData)
      console.log('🛠️  ========== FIM SERVIÇOS ==========')

      setLoaded(true)
      console.log('✅ loadData concluído')

    } catch (err: any) {
      console.error('❌ ERRO no loadData:', err)
      setApiError(`Erro: ${err.message}`)
    }
  }

  useEffect(() => {
    console.log('🔄 useEffect[dados] - session:', !!session, 'loaded:', loaded)

    if (!session || loaded) {
      console.log(`⏭️  Pulando loadData: session=${!!session}, loaded=${loaded}`)
      return
    }

    console.log('🔄 Executando loadData...')
    loadData()
  }, [session, loaded])

  // Testar endpoint de produtos com fetch direto
  const testProductsAllDirect = async () => {
    console.log('🧪 ========== TESTE DIRETO /products/all ==========')
    setApiError(null)

    try {
      const response = await fetch('http://localhost:3000/products/all', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })

      console.log('📡 Status:', response.status, response.statusText)
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()))

      const text = await response.text()
      console.log('📡 Resposta texto:', text)

      if (response.status === 403) {
        const errorMsg = 'Acesso proibido (403). Verifique permissões do usuário.'
        console.error('❌', errorMsg)
        setApiError(errorMsg)
        return
      }

      if (response.status === 404) {
        const errorMsg = 'Endpoint não encontrado (404)'
        console.error('❌', errorMsg)
        setApiError(errorMsg)
        return
      }

      try {
        const data = JSON.parse(text)
        console.log('📡 Resposta JSON:', data)

        if (data.success === false) {
          setApiError(`API: ${data.message}`)
        } else if (Array.isArray(data.data)) {
          setProducts(data.data)
          console.log(`✅ ${data.data.length} produtos carregados`)
        } else if (Array.isArray(data)) {
          setProducts(data)
          console.log(`✅ ${data.length} produtos carregados`)
        }
      } catch (e) {
        console.log('⚠️  Não é JSON válido')
        setApiError('Resposta não é JSON válido')
      }

    } catch (error: any) {
      console.error('❌ Erro fetch:', error)
      setApiError(`Fetch error: ${error.message}`)
    }

    console.log('🧪 ========== FIM TESTE ==========')
  }

  // Testar endpoint de serviços com fetch direto
  const testServicesAllDirect = async () => {
    console.log('🧪 ========== TESTE DIRETO /servicos/all ==========')

    try {
      const response = await fetch('http://localhost:3000/servicos/all', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })

      console.log('📡 Status:', response.status)
      const text = await response.text()
      console.log('📡 Resposta:', text)

      try {
        const data = JSON.parse(text)
        console.log('📡 JSON:', data)
      } catch (e) {
        console.log('⚠️  Não é JSON')
      }

    } catch (error: any) {
      console.error('❌ Erro:', error)
    }
  }

  // Verificar permissões do usuário
  const checkUserPermissions = () => {
    console.log('🔐 ========== VERIFICANDO PERMISSÕES ==========')
    console.log('Usuário completo:', session?.user)
    console.log('Role do usuário:', (session?.user as any)?.role)
    console.log('Dados do usuário:', (session?.user as any)?.data)
    console.log('🔐 ========== FIM VERIFICAÇÃO ==========')
  }

  // Login como outro usuário para teste
  const loginAsSeller = async () => {
    console.log('👤 Tentando login como vendedor...')
    setIsLoggingIn(true)
    try {
      const result = await authClient.signIn.email({
        email: 'vendedor1@test.com',
        password: 'password123',
      })
      console.log('✅ Login como vendedor:', result)
      setLoaded(false) // Forçar recarregar dados
    } catch (error: any) {
      console.error('❌ Erro login vendedor:', error)
      setApiError(`Login failed: ${error.message}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleReload = () => {
    console.log('🔄 Recarregando dados...')
    setLoaded(false)
    setApiError(null)
  }

  if (isPending || isLoggingIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-lg mb-4">
          {isLoggingIn ? 'Fazendo login...' : 'Carregando sessão...'}
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-6">Jua Market</h1>
        <p className="text-gray-600 mb-6">Você não está logado</p>

        <button
          onClick={() => authClient.signIn.email({
            email: 'jonatasadmin@email.com',
            password: 'polegadas5000',
          })}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Login como Admin
        </button>

        <button
          onClick={loginAsSeller}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Login como Vendedor 1
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Jua Market</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Recarregar
          </button>
          <button
            onClick={testProductsAllDirect}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            🧪 Testar /products/all
          </button>
          <button
            onClick={testServicesAllDirect}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🧪 Testar /servicos/all
          </button>
          <button
            onClick={checkUserPermissions}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🔐 Verificar Permissões
          </button>
          <button
            onClick={loginAsSeller}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            👤 Trocar para Vendedor
          </button>
          <div className="px-4 py-2 bg-gray-100 rounded">
            <div className="font-semibold">{session.user?.email}</div>
            <div className="text-xs text-gray-500">
              Role: {(session.user as any)?.role || 'Não definido'}
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 font-semibold">⚠️ Erro na API</div>
          <div className="text-red-600 text-sm mt-1">{apiError}</div>
          <div className="text-red-500 text-xs mt-2">
            Verifique as permissões do usuário no console
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex gap-4 mb-2">
            <span>📦 Produtos: <strong>{products.length}</strong></span>
            <span>🛠️ Serviços: <strong>{services.length}</strong></span>
            <span>👤 Role: <strong>{(session.user as any)?.role || 'Não definido'}</strong></span>
          </div>
          <div className="text-xs text-gray-400">
            Endpoints: <code>GET /products/all</code> | <code>GET /servicos/all</code>
          </div>
        </div>
      </div>

      <section className="mb-14">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Produtos</h2>
        {products.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
            <p className="text-gray-400 text-sm mt-2">
              {apiError ? `Erro: ${apiError}` : 'Use os botões acima para testar'}
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={testProductsAllDirect}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Testar Endpoint
              </button>
              <button
                onClick={checkUserPermissions}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Verificar Permissões
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{p.category_name}</p>
                  <p className="text-green-600 font-bold mb-2">R$ {p.price}</p>
                  <p className="text-gray-700 text-sm">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Serviços</h2>
        {services.length === 0 ? (
          <p className="text-gray-500">Nenhum serviço encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <img src={s.image} alt={s.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{s.category_name}</p>
                  <p className="text-blue-600 font-bold mb-2">R$ {s.price}</p>
                  <p className="text-gray-700 text-sm">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App