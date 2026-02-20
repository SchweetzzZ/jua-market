import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { table_products } from "./products_schemas";

export const table_product_image = pgTable("product_image", {
    id: uuid("id").primaryKey().defaultRandom(),
    product_id: uuid("product_id").notNull().references(() => table_products.id),
    image_url: text("image_url").notNull(),
    image_key: text("image_key").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})