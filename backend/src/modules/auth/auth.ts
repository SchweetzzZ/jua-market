import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";
import { authSchema } from "../../db/schemas/auth-schema";

export const auth = betterAuth({
    basePath: "api/auth",
    trustHost: true,
    trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    secret: process.env.BETTER_AUTH_SECRET,
    advanced: {
        database: {
            generateId: false
        }
    }
})