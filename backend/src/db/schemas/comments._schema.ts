import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { table_products } from "./products_schemas";
import { table_servicos } from "./servicos_schema";

export const table_comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    comment: text("comment").notNull(),
    user_id: uuid("user_id").notNull().references(() => user.id),
    product_id: uuid("product_id").references(() => table_products.id),
    service_id: uuid("service_id").references(() => table_servicos.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})