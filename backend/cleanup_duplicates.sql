-- Script para remover favoritos duplicados
-- Mantém apenas o favorito mais antigo (menor created_at) de cada combinação userId + itemId + itemType

DELETE FROM favorites
WHERE id NOT IN (
    SELECT MIN(id)
    FROM favorites
    GROUP BY user_id, item_id, item_type
);
