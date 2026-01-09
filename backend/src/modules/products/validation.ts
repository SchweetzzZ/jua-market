import { t } from "elysia"

export const validationProduct = t.Object({
    nome: t.String(),
    description: t.String(),
    image: t.String(),
    price: t.String(),
    history: t.String(),
})