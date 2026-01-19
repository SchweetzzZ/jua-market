import { authClient, useSession } from "../../../auth-client"

export const login = async (email: string, password: string) => {
    try {
        const res = await authClient.signIn.email({ email, password })
        return res
    } catch (err: any) {
        throw new Error(err.message || "Erro ao logar")
    }
}
