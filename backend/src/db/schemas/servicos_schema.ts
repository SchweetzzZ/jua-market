import { pgTable, uuid, timestamp, text, numeric } from "drizzle-orm/pg-core";
import { user } from "../../db/schemas/auth-schema"
import { tablecategories } from "./category_schema"

export const table_servicos = pgTable("servicos", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    user_id: uuid("user_id").notNull().references(() => user.id),
    description: text("description").notNull(),
    category: text("category").notNull().references(() => tablecategories.name),
    imageUrl: text("image_url").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})