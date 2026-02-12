import { Elysia, t } from "elysia";
import { db } from "../../db";
import { favorites } from "../../db/index-schema";
import { eq, and } from "drizzle-orm";
import { table_products } from "../../db/schemas/products_schemas";
import { table_servicos } from "../../db/schemas/servicos_schema";
import { authMacro } from "../auth/macro";

export const favoritesRoutes = new Elysia({ prefix: "/favorites" })
    .use(authMacro)

    .post(
        "/",
        async ({ body, user }) => {
            if (!user) {
                throw new Error("Unauthorized");
            }

            const { itemId, itemType } = body;

            const existing = await db.select().from(favorites).where(
                and(
                    eq(favorites.userId, user.id),
                    eq(favorites.itemId, itemId),
                    eq(favorites.itemType, itemType)
                )
            )
                .limit(1);

            if (existing.length > 0) {
                return { message: "Item já está nos favoritos", favorite: existing[0] };
            }

            const [favorite] = await db.insert(favorites).values({
                userId: user.id,
                itemId,
                itemType,
            })
                .returning();

            return { message: "Adicionado aos favoritos", favorite };
        },
        {
            auth: true,
            body: t.Object({
                itemId: t.String(),
                itemType: t.Union([t.Literal("product"), t.Literal("service")]),
            }),
        }
    )

    .delete(
        "/:id",
        async ({ params, user }) => {
            if (!user) {
                throw new Error("Unauthorized");
            }

            await db.delete(favorites).where(and(eq(favorites.id, params.id), eq(favorites.userId, user.id)));

            return { message: "Removido dos favoritos" };
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
            }),
        }
    )

    .delete(
        "/item/:itemId/:itemType",
        async ({ params, user }) => {
            if (!user) {
                throw new Error("Unauthorized");
            }

            await db.delete(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.itemId,
                params.itemId), eq(favorites.itemType, params.itemType)));

            return { message: "Removido dos favoritos" };
        },
        {
            auth: true,
            params: t.Object({
                itemId: t.String(),
                itemType: t.Union([t.Literal("product"), t.Literal("service")]),
            }),
        }
    )

    .get("/", async ({ user }) => {
        if (!user) {
            throw new Error("Unauthorized");
        }

        const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, user.id))
            .orderBy(favorites.createdAt);

        const favoriteProducts = [];
        const favoriteServices = [];

        for (const fav of userFavorites) {
            if (fav.itemType === "product") {
                const [product] = await db.select().from(table_products).where(
                    eq(table_products.id, fav.itemId)).limit(1);

                if (product) {
                    favoriteProducts.push({
                        ...product,
                        favoriteId: fav.id,
                    });
                }
            } else if (fav.itemType === "service") {
                const [service] = await db.select().from(table_servicos).where(
                    eq(table_servicos.id, fav.itemId)).limit(1);

                if (service) {
                    favoriteServices.push({
                        ...service,
                        favoriteId: fav.id,
                    });
                }
            }
        }

        return {
            products: favoriteProducts,
            services: favoriteServices,
        };
    }, { auth: true })

    // Verificar se um item está nos favoritos
    .get(
        "/check/:itemId/:itemType",
        async ({ params, user }: { params: { itemId: string; itemType: "product" | "service" }; user?: any }) => {
            if (!user) {
                return { isFavorite: false };
            }

            const [favorite] = await db.select().from(favorites).where(
                and(
                    eq(favorites.userId, user.id),
                    eq(favorites.itemId, params.itemId),
                    eq(favorites.itemType, params.itemType)
                )
            )
                .limit(1);

            return { isFavorite: !!favorite, favoriteId: favorite?.id };
        },
        {
            params: t.Object({
                itemId: t.String(),
                itemType: t.Union([t.Literal("product"), t.Literal("service")]),
            }),
        }
    );
