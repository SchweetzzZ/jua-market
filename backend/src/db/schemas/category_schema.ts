import { PgTable, text, uuid, timestamp, pgTable } from "drizzle-orm/pg-core";
import { user } from "./auth-schema"

export const tablecategories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").notNull().references(() => user.id),
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
})