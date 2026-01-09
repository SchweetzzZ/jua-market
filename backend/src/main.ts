import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./modules/auth/auth";

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
  .get("/teste", () => "Hello Elysia")
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
