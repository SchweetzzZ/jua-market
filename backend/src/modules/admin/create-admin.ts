import { db } from "../../db"
import { user } from "../../db/schemas/auth-schema"
import { eq } from "drizzle-orm"
import { auth } from "../auth/auth"

export const createAdmin = async () => {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
        console.log("email ou senha nao fornecidos")
        return
    }

    const existing = await db.select().from(user).where(
        eq(user.email, email)).limit(1)

    if (existing.length) {
        console.log("Admin já existe")
        return
    }

    await auth.api.createUser({
        body: {
            email,
            password,
            role: "admin",
            name: "Admin"
        }
    })

    return { message: "Admin criado com sucesso" }
}
