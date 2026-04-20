const API = 'http://localhost:5000/api';

export const getFavoriteToken = () => localStorage.getItem('token');

export const isFavoritesAuthenticated = () => Boolean(getFavoriteToken());

export const getFavoritesHeaders = () => {
  const token = getFavoriteToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
};

export const fetchFavoritesRequest = async (itemType = null) => {
  const headers = getFavoritesHeaders();
  if (!headers) return [];

  const query = itemType ? `?type=${encodeURIComponent(itemType)}` : '';
  const res = await fetch(`${API}/favorites${query}`, { headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Impossible de charger les favoris.');
  }

  return json.data || [];
};

export const toggleFavoriteRequest = async ({ itemType, itemId, itemData }) => {
  const headers = getFavoritesHeaders();
  if (!headers) {
    return { requiresAuth: true };
  }

  const res = await fetch(`${API}/favorites/toggle`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item_type: itemType,
      item_id: itemId,
      item_data: itemData,
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Impossible de mettre a jour les favoris.');
  }

  return json;
};

export const getFavoritePath = (itemType, itemId) => {
  switch (itemType) {
    case 'omra':
      return `/Omra/Details/${itemId}`;
    case 'voyage':
      return `/VoyagesOrganise/Detail/${itemId}`;
    case 'circuit':
      return `/circuits/CircuitDetails/${itemId}`;
    default:
      return null;
  }
};

export const buildFavoriteItemData = (itemType, item) => {
  const baseData = {
    title: item.title || item.titre || '',
    image: item.image || item.image_url || '',
    price: Number(item.price ?? item.prix ?? 0) || 0,
    detailPath: getFavoritePath(itemType, item.id),
  };

  if (itemType === 'omra') {
    return {
      ...baseData,
      subtitle: item.subtitle || '',
      departure: item.departure || item.depart || '',
      duration: Number(item.duration || 0) || 0,
    };
  }

  if (itemType === 'voyage') {
    return {
      ...baseData,
      destination: item.destination || '',
      pays: item.pays || '',
      duration: item.duree || item.duration || '',
    };
  }

  if (itemType === 'circuit') {
    return {
      ...baseData,
      subtitle: item.subtitle || '',
      region: item.region || '',
      duration: item.duration || '',
    };
  }

  return baseData;
};

export const getFavoriteKey = (itemId) => String(itemId);
