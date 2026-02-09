import { pgTable, uuid, timestamp, text, index, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const favorites = pgTable(
    "favorites",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        itemId: uuid("item_id").notNull(),
        itemType: text("item_type").notNull(), // 'product' or 'service'
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("favorites_userId_idx").on(table.userId),
        index("favorites_itemId_idx").on(table.itemId),
        unique("unique_user_item").on(table.userId, table.itemId, table.itemType),
    ]
);

export const favoritesRelations = relations(favorites, ({ one }) => ({
    user: one(user, {
        fields: [favorites.userId],
        references: [user.id],
    }),
}));
