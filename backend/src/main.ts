import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./modules/auth/auth";
import { authMacro } from "./modules/auth/macro";
import { productsRoutes } from "./modules/products/routes";
import { servicesRoutes } from "./modules/servicos/routes";
import { categoryRoutes } from "./modules/category/routes";
import { adminRoutes } from "./modules/admin/routes";
import { createAdmin } from "./modules/admin/create-admin";
import { swaggerModules } from "./modules/swagger";
import { favoritesRoutes } from "./modules/favorites/favorites";
import { uploadRoutes } from "./modules/upload/routes";

async function createAdm() {
  await createAdmin()
}

export const createCoreApi = () => {
  const app = new Elysia()
    .use(cors(
      {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }
    ))
    .onError(({ code, error, set }) => {
      if (code === 'NOT_FOUND') {
        set.status = 404
        return { success: false, message: 'Rota não encontrada', data: null }
      }

      if (code === 'VALIDATION') {
        set.status = 400
        return {
          success: false,
          message: 'Dados inválidos',
          data: error.all
        }
      }

      console.error("ERRO CRÍTICO:", error)

      set.status = 500
      return {
        success: false,
        message: "Ocorreu um erro interno no servidor.",
        data: null
      }
    })
    .mount(auth.handler)
    .use(authMacro)
    .use(swaggerModules)
    .use(adminRoutes)
    .use(productsRoutes)
    .use(categoryRoutes)
    .use(servicesRoutes)
    .use(favoritesRoutes)
    .use(uploadRoutes)
    .get("/teste", () => "Hello Elysia")
    .get("/", () => "Hello Elysia")

  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );

  createAdm()

  return app
}
export type CoreApi = Awaited<ReturnType<typeof createCoreApi>>