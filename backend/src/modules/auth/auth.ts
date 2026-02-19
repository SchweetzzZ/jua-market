import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";
import { authSchema } from "../../db/schemas/auth-schema";
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
    basePath: "/api/auth",
    trustHost: true,
    trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        async sendResetPassword({ user, url }) {
            // Importação dinâmica para evitar loops e garantir carregamento limpo
            const { sendResetPasswordEmail } = await import("../../lib/email");
            await sendResetPasswordEmail(user.email, user.name, url);
        },
    },
    advanced: {
        database: {
            generateId: false
        }
    },
    plugins: [
        admin()
    ],
    secret: process.env.BETTER_AUTH_SECRET,
})