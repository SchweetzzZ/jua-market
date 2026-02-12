import { useState, useCallback } from "react";

const API_URL = "http://localhost:3000";

export interface FavoriteItem {
    id: string;
    name: string;
    description?: string;
    price?: number | string;
    imageUrl?: string;
    category_name?: string;
    favoriteId?: string;
}

export interface FavoritesData {
    products: FavoriteItem[];
    services: FavoriteItem[];
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoritesData>({ products: [], services: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/favorites`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Erro ao buscar favoritos");
            }

            const data = await response.json();
            setFavorites(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addFavorite = useCallback(async (itemId: string, itemType: "product" | "service") => {
        try {
            const response = await fetch(`${API_URL}/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ itemId, itemType }),
            });

            if (!response.ok) {
                throw new Error("Erro ao adicionar favorito");
            }

            const data = await response.json();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
            throw err;
        }
    }, []);

    const removeFavorite = useCallback(async (itemId: string, itemType: "product" | "service") => {
        try {
            const response = await fetch(`${API_URL}/favorites/item/${itemId}/${itemType}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Erro ao remover favorito");
            }

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
            throw err;
        }
    }, []);

    const checkFavorite = useCallback(async (itemId: string, itemType: "product" | "service") => {
        try {
            const response = await fetch(`${API_URL}/favorites/check/${itemId}/${itemType}`, {
                credentials: "include",
            });

            if (!response.ok) {
                return { isFavorite: false };
            }

            return await response.json();
        } catch (err) {
            return { isFavorite: false };
        }
    }, []);

    return {
        favorites,
        isLoading,
        error,
        fetchFavorites,
        addFavorite,
        removeFavorite,
        checkFavorite,
    };
}