import { Elysia } from "elysia"
import { swagger } from "@elysiajs/swagger"

export const swaggerModules = (app: Elysia) => app
    .use(swagger({
        documentation: {
            info: {
                title: "Jua Market API",
                description: "API para o Jua Market",
                version: "1.0.0",
            }
        }
    }))