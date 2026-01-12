import { text, uuid, pgTable } from "drizzle-orm/pg-core";

export const tablecategories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
})