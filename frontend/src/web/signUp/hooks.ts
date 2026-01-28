import { authClient } from "../../../auth-client"

export const register = async (email: string, password: string, name: string) => {
    try {
        const res = await authClient.signUp.email({
            email,
            password,
            name,
            fetchOptions: {
                onError(context) {
                    throw context.error
                }
            }
        })

        // Verificar se há erro na resposta
        if (res.error) {
            throw new Error(res.error.message || "Erro ao criar conta")
        }

        // Verificar se o cadastro foi bem-sucedido
        if (!res.data) {
            throw new Error("Erro ao criar conta. Tente novamente.")
        }

        return res
    } catch (err: any) {
        // Capturar erros de rede ou do servidor
        const errorMessage = err.message || "Erro ao conectar com o servidor"
        throw new Error(errorMessage)
    }
}