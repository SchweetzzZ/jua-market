import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./modules/auth/auth";
import { authMacro } from "./modules/auth/macro";
import { productsRoutes } from "./modules/products/routes";
import { servicesRoutes } from "./modules/servicos/routes";
import { categoryRoutes } from "./modules/category/routes";

const app = new Elysia()
  .use(cors(
    {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }
  ))
  .mount(auth.handler)
  .use(authMacro)
  .use(productsRoutes)
  .use(categoryRoutes)
  .use(servicesRoutes)
  .get("/teste", () => "Hello Elysia")
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
