import { db } from "../../db";
import { pgTable, varchar, uuid, timestamp, text, boolean, index, numeric } from "drizzle-orm/pg-core";
import { table_products } from "../../db/schemas/products_schemas";
import { user } from "../../db/schemas/auth-schema"
import { eq, and } from "drizzle-orm"
import { tablecategories } from "./category_schema"

export const table_servicos = pgTable("servicos", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    user_id: uuid("user_id").notNull().references(() => user.id),
    description: text("description").notNull(),
    category_name: text("category_name").notNull().references(() => tablecategories.name),
    image: text("image").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})