import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { table_servicos } from "./servicos_schema";

export const table_service_image = pgTable("service_image", {
    id: uuid("id").primaryKey().defaultRandom(),
    service_id: uuid("service_id").notNull().references(() => table_servicos.id),
    image_url: text("image_url").notNull(),
    image_key: text("image_key").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})