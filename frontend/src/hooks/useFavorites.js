import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchFavoritesRequest,
  getFavoriteKey,
  isFavoritesAuthenticated,
  toggleFavoriteRequest,
} from '../utils/favorites';

const FAVORITES_UPDATED_EVENT = 'favorites:updated';

const isSameFavorite = (favorite, itemType, itemId) =>
  favorite.item_type === itemType && getFavoriteKey(favorite.item_id) === getFavoriteKey(itemId);

export const useFavorites = (itemType = null) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(isFavoritesAuthenticated());

  const refreshFavorites = useCallback(async () => {
    if (!isFavoritesAuthenticated()) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchFavoritesRequest(itemType);
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [itemType]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  useEffect(() => {
    const syncFavorites = () => {
      refreshFavorites();
    };

    window.addEventListener('focus', syncFavorites);
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorites);

    return () => {
      window.removeEventListener('focus', syncFavorites);
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorites);
    };
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(async ({ itemType: nextType, itemId, itemData }) => {
    const response = await toggleFavoriteRequest({ itemType: nextType, itemId, itemData });

    if (response.requiresAuth) {
      return response;
    }

    setFavorites((prev) => {
      const exists = prev.some((favorite) => isSameFavorite(favorite, nextType, itemId));

      if (response.action === 'removed' || exists) {
        return prev.filter((favorite) => !isSameFavorite(favorite, nextType, itemId));
      }

      return [
        {
          id: `favorite-${nextType}-${itemId}`,
          item_type: nextType,
          item_id: itemId,
          item_data: itemData,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
    return response;
  }, []);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => getFavoriteKey(favorite.item_id))),
    [favorites]
  );

  return {
    favorites,
    favoriteIds,
    loading,
    isAuthenticated: isFavoritesAuthenticated(),
    refreshFavorites,
    toggleFavorite,
  };
};
