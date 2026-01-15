import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./modules/auth/auth";
import { authMacro } from "./modules/auth/macro";
import { productsRoutes } from "./modules/products/routes";
import { servicesRoutes } from "./modules/servicos/routes";
import { categoryRoutes } from "./modules/category/routes";
import { adminRoutes } from "./modules/admin/routes";
import { createAdmin } from "./modules/admin/create-admin";

async function createAdm() {
  await createAdmin()
}


const app = new Elysia()
  .use(cors(
    {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }
  ))
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404
      return { success: false, message: 'Rota não encontrada' }
    }

    if (code === 'VALIDATION') {
      set.status = 400
      return {
        success: false,
        message: 'Dados inválidos',
        errors: error.all
      }
    }

    console.error("ERRO CRÍTICO:", error)

    set.status = 500
    return {
      success: false,
      message: "Ocorreu um erro interno no servidor."
    }
  })
  .mount(auth.handler)
  .use(authMacro)
  .use(adminRoutes)
  .use(productsRoutes)
  .use(categoryRoutes)
  .use(servicesRoutes)
  .get("/teste", () => "Hello Elysia")
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

createAdm()