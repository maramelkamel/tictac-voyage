import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/HotelsPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const buildGallery = (mainImage, gallery = []) => {
  const db = (gallery || []).filter(Boolean);
  if (db.length > 0) {
    if (mainImage && !db.includes(mainImage)) return [mainImage, ...db];
    return db;
  }
  return [mainImage].filter(Boolean);
};

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [pension, setPension] = useState(sp.get('pension') || 'LPD');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/hotels/${id}?public=true`, { cache: 'no-store' });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Erreur');
        if (mounted) setHotel(json.data);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const priceOptions = useMemo(() => Array.isArray(hotel?.price_options) ? hotel.price_options : [], [hotel]);
  const selected = useMemo(() => priceOptions.find((p) => p.label === pension) || priceOptions[0] || null, [priceOptions, pension]);

  const gallery = useMemo(() => buildGallery(hotel?.image_url, hotel?.gallery), [hotel]);

  if (loading) {
    return (
      <div className="hotels-page hotels-page--details">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8' }}>Chargement…</p>
        </div>
        <Footer />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="hotels-page hotels-page--details">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0a2832' }}>{error || 'Hôtel introuvable'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/hotels')} style={{ marginTop: 16 }}>
            Retour
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const price = Number(selected?.value || 0);

  return (
    <div className="hotels-page hotels-page--details">
      <Navbar />

      <section className="hotels-detail-hero">
        <img src={gallery[activeImg] || hotel.image_url} alt={hotel.name} />
        <div className="hotels-detail-hero__overlay" />
        <div className="hotels-detail-hero__content">
          <div className="container">
            <button className="hotels-back" onClick={() => navigate('/hotels')}>← Retour</button>
            <div className="hotels-badge">{hotel.stars || 4}★ · {hotel.city}</div>
            <h1>{hotel.name}</h1>
            <p style={{ color: 'rgba(255,255,255,.78)' }}>{hotel.address}</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '34px 0 70px' }}>
        <div className="container hotels-detail-layout">
          <div>
            {gallery.length > 1 && (
              <div className="hotels-gallery">
                {gallery.map((src, idx) => (
                  <button key={src + idx} className={idx === activeImg ? 'active' : ''} onClick={() => setActiveImg(idx)}>
                    <img src={src} alt={`photo ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="hotels-detail-card">
              <h2>Description</h2>
              <p>{hotel.description || '—'}</p>
            </div>

            {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
              <div className="hotels-detail-card">
                <h2>Équipements</h2>
                <div className="hotels-chip-list">
                  {hotel.amenities.map((a, i) => <span key={i}>{a}</span>)}
                </div>
              </div>
            )}
          </div>

          <aside className="hotels-sidebar">
            <div className="hotels-sidebar__card">
              <div className="hotels-sidebar__label">Pension</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {priceOptions.map((p) => {
                  const active = p.label === selected?.label;
                  return (
                    <button
                      key={p.label}
                      className={active ? 'btn btn-primary' : 'btn btn-outline-primary'}
                      onClick={() => setPension(p.label)}
                      style={{ padding: '10px 14px', borderRadius: 999, fontWeight: 900 }}
                      title={p.label}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="hotels-sidebar__amount">{price.toLocaleString('fr-FR')} TND</div>
              <div className="hotels-sidebar__meta">Prix / nuit · {selected?.label || '—'}</div>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/hotels/${hotel.id}/reserve?pension=${encodeURIComponent(selected?.label || pension)}`)}
                style={{ width: '100%' }}
              >
                Réserver
              </button>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HotelDetails;

