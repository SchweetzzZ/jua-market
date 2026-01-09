import { pgTable, varchar, uuid, timestamp, text, boolean, index, numeric }
    from "drizzle-orm/pg-core";
import { user } from "./auth-schema"

export const table_products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    user_id: uuid("user_id").notNull().references(() => user.id),
    description: text("description").notNull(),
    image: text("image").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})