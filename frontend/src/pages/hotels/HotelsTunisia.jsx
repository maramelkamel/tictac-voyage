import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HotelCard from '../../components/HotelCard';
import { useHotels, normalizeHotelForCard } from '../../hooks/useHotels';
import '../../styles/HotelsPage.css';
import '../../styles/omrastyle.css';

const useQuery = () => new URLSearchParams(useLocation().search);

const HotelsTunisia = () => {
  const navigate = useNavigate();
  const q = useQuery();

  const [city, setCity] = useState(q.get('city') || '');
  const [search, setSearch] = useState(q.get('search') || '');
  const [sort, setSort] = useState(q.get('sort') || 'stars');

  const { hotels, total, loading, error } = useHotels({ city: city || undefined, search: search || undefined, sort, limit: 12, page: 1 });

  const cards = useMemo(() => (hotels || []).map(normalizeHotelForCard), [hotels]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="hotels-page">
      <Navbar />

      <section className="hotels-hero">
        <div className="container">
          <div className="hotels-hero__content">
            <span className="hotels-hero__eyebrow">Hôtels Tunisie</span>
            <h1>Choisissez votre hôtel.</h1>
            <p>Le même design que les voyages organisés, avec pensions (LPD / DP / PC / AI) et prix dynamiques.</p>
          </div>

          <div className="hotels-search">
            <div className="hotels-search__grid">
              <div className="hotels-search__field">
                <label>Ville</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Hammamet" />
              </div>
              <div className="hotels-search__field">
                <label>Recherche</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, adresse…" />
              </div>
              <div className="hotels-search__field">
                <label>Tri</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="stars">Étoiles</option>
                  <option value="name">Nom</option>
                  <option value="price">Prix</option>
                </select>
              </div>
            </div>

            <div className="hotels-toolbar">
              <button className="btn btn-primary" onClick={applyFilters}>Rechercher</button>
              <span style={{ color: 'var(--gray-400)', fontSize: 13, marginLeft: 'auto' }}>
                {total} hôtel{total > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '34px 0 60px' }}>
        <div className="container">
          {loading && (
            <div className="hotels-grid">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="hotels-skeleton" />)}
            </div>
          )}

          {!loading && error && <div className="hotels-inline-error">{error}</div>}

          {!loading && !error && cards.length === 0 && (
            <div className="hotels-empty">Aucun hôtel trouvé.</div>
          )}

          {!loading && !error && cards.length > 0 && (
            <div className="omra-cards-grid">
              {cards.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  onDetails={() => navigate(`/hotels/${h.id}`)}
                  onReserver={(_, pension) => navigate(`/hotels/${h.id}/reserve?pension=${encodeURIComponent(pension)}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HotelsTunisia;

