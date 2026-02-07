import { db } from "../../db"
import { user } from "../../db/schemas/auth-schema"
import { eq } from "drizzle-orm"
import { auth } from "../auth/auth"

type Role = "user" | "admin" | "seller"

export const createAdmin = async () => {
    const email = process.env.ADMIN_EMAIL
    const name = process.env.ADMIN_NAME
    const password = process.env.ADMIN_PASSWORD


    if (!email || !password || !name) {
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
            name,
            email,
            password,
            role: "admin",
        }
    })

    return { message: "Admin criado com sucesso" }
}

