import { authClient } from "../../../auth-client"

export const register = async (email: string, password: string, name: string) => {
    try {
        const res = await authClient.signUp.email({ email, password, name })
        return res
    } catch (err: any) {
        throw new Error(err.message || "Erro ao registrar")
    }
}