import { useEffect, useState } from 'react';

export function usePromotions(type, categorie) {
  const [promos,  setPromos]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = type === 'accueil'
      ? 'http://localhost:5000/api/promotions/accueil'
      : `http://localhost:5000/api/promotions/categorie/${categorie}`;

    fetch(url)
      .then(r => r.json())
      .then(data => setPromos(Array.isArray(data) ? data : []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  }, [type, categorie]);

  return { promos, loading };
}