import { useEffect, useState } from 'react';

export function usePromotions(type, categorie) {
  const [promos,  setPromos]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = type === 'accueil'
      ? 'http://localhost:5000/api/promotions/accueil'
      : `http://localhost:5000/api/promotions/categorie/${categorie}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setPromos(list);
      })
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  }, [type, categorie]);

  return { promos, loading };
}
