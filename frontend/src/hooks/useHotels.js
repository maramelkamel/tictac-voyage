import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useHotels({ city, sort = 'stars', limit = 12, page = 1, search } = {}) {
  const [hotels, setHotels]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/hotels`, {
        params: { city, sort, limit, page, search },
      });
      setHotels(data.hotels || []);
      setTotal(data.total   || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [city, sort, limit, page, search]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  return { hotels, total, loading, error, refetch: fetchHotels };
}

export function normalizeHotelForCard(hotel) {
  const prices = Array.isArray(hotel.price_options) ? hotel.price_options : [];
  return {
    id          : hotel.id,
    title       : hotel.name,
    location    : `${hotel.city}${hotel.address ? ', ' + hotel.address : ''}`,
    description : hotel.description,
    image       : hotel.image_url || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
    stars       : hotel.stars || 4,
    badge       : hotel.stars === 5 ? 'Luxe' : hotel.stars === 4 ? 'Confort' : null,
    badgeType   : hotel.stars === 5 ? 'promo' : 'new',
    amenities   : Array.isArray(hotel.amenities) ? hotel.amenities : [],
    priceOptions: prices.length > 0 ? prices : [
      { label: 'LPD', value: 165 },
      { label: 'DP',  value: 220 },
      { label: 'PC',  value: 286 },
      { label: 'AI',  value: 462 },
    ],
  };
}