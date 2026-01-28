import { authClient } from "../../../auth-client"

export const login = async (email: string, password: string) => {
    try {
        const res = await authClient.signIn.email({
            email,
            password,
            fetchOptions: {
                onError(context) {
                    throw context.error
                }
            }
        })

        // Verificar se há erro na resposta
        if (res.error) {
            throw new Error(res.error.message || "Credenciais inválidas")
        }

        // Verificar se o login foi bem-sucedido
        if (!res.data) {
            throw new Error("Erro ao fazer login. Verifique suas credenciais.")
        }

        return res
    } catch (err: any) {
        // Capturar erros de rede ou do servidor
        const errorMessage = err.message || "Erro ao conectar com o servidor"
        throw new Error(errorMessage)
    }
}
