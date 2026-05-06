import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getHotelById } from '../../services/api';

/* ─── placeholder ──────────────────────────────────────────── */
const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#0f4c5c"/>
    <text x="400" y="260" text-anchor="middle" fill="#ffffff88" font-size="22" font-family="Georgia,serif">Tictac Voyages</text>
  </svg>`
)}`;

/* ─── normalise ─────────────────────────────────────────────── */
const normalizeHotel = (h) => ({
  ...h,
  prix: Number(h.base_price || 0),
  oldPrix: h.old_price ? Number(h.old_price) : null,
  gallery: Array.isArray(h.gallery) ? h.gallery : [],
  highlights: Array.isArray(h.highlights) ? h.highlights : [],
  room_types: Array.isArray(h.room_types) ? h.room_types : [],
  policies: Array.isArray(h.policies) ? h.policies : [],
  nearby_places: Array.isArray(h.nearby_places) ? h.nearby_places : [],
  amenities: Array.isArray(h.amenities) ? h.amenities : [],
  meal_plans: Array.isArray(h.meal_plans) ? h.meal_plans : [],
  room_views: Array.isArray(h.room_views) ? h.room_views : [],
  reservation_extras: Array.isArray(h.reservation_extras) ? h.reservation_extras : [],
});

/* ─── amenity icons ─────────────────────────────────────────── */
const AMENITY_ICONS = {
  wifi: '📶', pool: '🏊', spa: '💆', gym: '🏋', restaurant: '🍽',
  beach: '🏖', parking: '🅿', bar: '🍹', 'kids club': '🎠',
  golf: '⛳', casino: '🎰', 'sea view': '🌊', 'room service': '🛎',
  'air conditioning': '❄', concierge: '🤵', airport: '✈',
  transfer: '🚐', default: '✓',
};
const amenityIcon = (label = '') => {
  const key = label.toLowerCase();
  return Object.entries(AMENITY_ICONS).find(([k]) => key.includes(k))?.[1] ?? AMENITY_ICONS.default;
};

/* ─── star render ───────────────────────────────────────────── */
const Stars = ({ count, size = 14 }) => (
  <span style={{ color: '#f59e0b', fontSize: size, letterSpacing: 1 }}>
    {'★'.repeat(Math.round(count || 0))}{'☆'.repeat(5 - Math.round(count || 0))}
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   LIGHTBOX
════════════════════════════════════════════════════════════════ */
const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* counter */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        color: '#fff', fontSize: 13, fontWeight: 600, opacity: .7,
        background: 'rgba(255,255,255,.1)', padding: '4px 14px', borderRadius: 999,
      }}>
        {index + 1} / {images.length}
      </div>

      {/* close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,.12)',
        border: 'none', color: '#fff', fontSize: 22, width: 40, height: 40,
        borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* prev */}
      {images.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{
          position: 'absolute', left: 16, background: 'rgba(255,255,255,.12)',
          border: 'none', color: '#fff', fontSize: 22, width: 48, height: 48,
          borderRadius: '50%', cursor: 'pointer',
        }}>‹</button>
      )}

      {/* image */}
      <img
        onClick={(e) => e.stopPropagation()}
        src={images[index] || PLACEHOLDER}
        alt=""
        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        style={{
          maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain',
          borderRadius: 12, boxShadow: '0 32px 80px rgba(0,0,0,.6)',
        }}
      />

      {/* next */}
      {images.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{
          position: 'absolute', right: 16, background: 'rgba(255,255,255,.12)',
          border: 'none', color: '#fff', fontSize: 22, width: 48, height: 48,
          borderRadius: '50%', cursor: 'pointer',
        }}>›</button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const HotelDetailsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [hotel, setHotel] = useState(state?.hotel ? normalizeHotel(state.hotel) : null);
  const [loading, setLoading] = useState(!state?.hotel);
  const [activeSection, setActiveSection] = useState('galerie');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    if (!id || state?.hotel) { setLoading(false); return; }
    getHotelById(id)
      .then((r) => setHotel(r.data ? normalizeHotel(r.data) : null))
      .catch(() => setHotel(null))
      .finally(() => setLoading(false));
  }, [id, state?.hotel]);

  const galleryImages = useMemo(() => hotel?.gallery?.filter(Boolean) || [], [hotel]);

  const openLightbox = useCallback((i) => setLightbox({ open: true, index: i }), []);
  const closeLightbox = useCallback(() => setLightbox({ open: false, index: 0 }), []);
  const prevImg = useCallback(() => setLightbox((l) => ({ ...l, index: (l.index - 1 + galleryImages.length) % galleryImages.length })), [galleryImages.length]);
  const nextImg = useCallback(() => setLightbox((l) => ({ ...l, index: (l.index + 1) % galleryImages.length })), [galleryImages.length]);

  const scrollTo = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#94a3b8' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f1e7ec', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <span>Chargement de l'hôtel…</span>
      </div>
      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── not found ── */
  if (!hotel) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 48 }}>🏨</div>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#0a2832' }}>Hôtel introuvable.</p>
        <button onClick={() => navigate('/hotels')} style={btnStyle}>Retour aux hôtels</button>
      </div>
      <Footer />
    </div>
  );

  const handleReserve = () => navigate('/hotels/reserve', {
    state: { hotel, search: state?.search || { city: hotel.city, budget: '', persons: '2' } },
  });

  const mealList = hotel.meal_plans?.length ? hotel.meal_plans : hotel.meals ? [hotel.meals] : [];
  const navItems = [
    { id: 'galerie', label: '📸 Galerie' },
    { id: 'presentation', label: '🏨 Présentation' },
    { id: 'chambres', label: '🛏 Chambres' },
    { id: 'services', label: '✓ Services' },
    { id: 'infos', label: 'ℹ Infos' },
  ];

  return (
    <div style={{ fontFamily: '"Georgia", serif', background: '#f9f6f3', minHeight: '100vh' }}>
      <Navbar />

      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <div style={{ position: 'relative', height: '520px', overflow: 'hidden' }}>
        <img
          src={hotel.image_url || PLACEHOLDER}
          alt={hotel.name}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,20,26,.85) 40%, rgba(8,20,26,.15) 100%)' }} />

        {/* back button */}
        <button onClick={() => navigate('/hotels')} style={{
          position: 'absolute', top: 24, left: 24,
          background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.3)', color: '#fff',
          padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← Retour aux hôtels</button>

        {/* badge */}
        {hotel.badge && (
          <div style={{
            position: 'absolute', top: 24, right: 24,
            background: '#e8306a', color: '#fff', fontSize: 11,
            fontWeight: 800, padding: '6px 14px', borderRadius: 999, letterSpacing: '.08em', textTransform: 'uppercase',
          }}>{hotel.badge}</div>
        )}

        {/* hero content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 clamp(20px,5vw,80px) 36px' }}>
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Stars count={hotel.stars} size={16} />
              <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>
                {hotel.city} · {hotel.property_type || 'Hôtel'}
              </span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
              {hotel.name}
            </h1>
            {hotel.subtitle && (
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 16, margin: '0 0 16px', fontStyle: 'italic' }}>
                {hotel.subtitle}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { icon: '⭐', text: `${hotel.rating || 0} · ${hotel.reviews || 0} avis` },
                { icon: '📍', text: hotel.address || hotel.city },
                { icon: '🕐', text: `Check-in ${hotel.checkin_time || '14:00'} · Check-out ${hotel.checkout_time || '12:00'}` },
                hotel.available_rooms && { icon: '🛏', text: `${hotel.available_rooms} chambre(s) disponible(s)` },
              ].filter(Boolean).map((pill, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,.2)', color: '#fff',
                  padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                }}>
                  {pill.icon} {pill.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ STICKY NAV ════════════════════════════════════════ */}
      <div style={{
        position: 'sticky', top: 72, zIndex: 50, background: '#fff',
        borderBottom: '1px solid #f0e8e4', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {navItems.map((n) => (
            <button key={n.id} onClick={() => scrollTo(n.id)} style={{
              padding: '14px 16px', background: 'none', border: 'none',
              borderBottom: `2px solid ${activeSection === n.id ? '#e8306a' : 'transparent'}`,
              color: activeSection === n.id ? '#e8306a' : '#64748b',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all .2s',
            }}>{n.label}</button>
          ))}
        </div>
      </div>

      {/* ══ BODY ══════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* GALLERY SECTION */}
          <section id="galerie" style={{ scrollMarginTop: 130, ...cardStyle }}>
            <SectionHead title="Galerie photos" />
            {galleryImages.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
                  {galleryImages.slice(0, 6).map((src, i) => (
                    <div
                      key={i}
                      onClick={() => openLightbox(i)}
                      style={{
                        position: 'relative', borderRadius: 10, overflow: 'hidden',
                        paddingTop: i === 0 ? '66%' : '66%', cursor: 'zoom-in',
                        gridColumn: i === 0 ? 'span 2' : 'span 1',
                        gridRow: i === 0 ? 'span 2' : 'span 1',
                      }}
                    >
                      <img
                        src={src} alt={`${hotel.name} ${i + 1}`}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                        style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'cover', transition: 'transform .4s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                      {/* overlay on last visible if more exist */}
                      {i === 5 && galleryImages.length > 6 && (
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 18, fontWeight: 700,
                        }}>+{galleryImages.length - 6} photos</div>
                      )}
                      {/* zoom icon */}
                      <div style={{
                        position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.45)',
                        color: '#fff', borderRadius: 6, width: 28, height: 28, fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0,
                        transition: 'opacity .2s',
                      }} className="zoom-icon">⤢</div>
                    </div>
                  ))}
                </div>
                {galleryImages.length > 6 && (
                  <button onClick={() => openLightbox(0)} style={{
                    marginTop: 12, background: 'none', border: '1px solid #e8306a',
                    color: '#e8306a', padding: '8px 20px', borderRadius: 999, fontSize: 13,
                    fontWeight: 700, cursor: 'pointer',
                  }}>
                    Voir toutes les photos ({galleryImages.length})
                  </button>
                )}
              </>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
                Aucune photo supplémentaire disponible pour cet hôtel.
              </p>
            )}
          </section>

          {/* PRESENTATION */}
          <section id="presentation" style={{ scrollMarginTop: 130, ...cardStyle }}>
            <SectionHead title="Présentation générale" />
            <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.8, margin: '16px 0 24px' }}>
              {hotel.description || "La description de cet hôtel n'a pas encore été renseignée."}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
              {[
                { icon: '🏙', label: 'Ville', value: hotel.city },
                { icon: '🏢', label: 'Type', value: hotel.property_type },
                { icon: '🍽', label: 'Restauration', value: hotel.meals },
                { icon: '📍', label: 'Adresse', value: hotel.address },
                { icon: '🏆', label: 'Badge', value: hotel.badge },
                { icon: '🛏', label: 'Chambres totales', value: hotel.total_rooms ? `${hotel.total_rooms} chambres` : null },
              ].filter((i) => i.value).map((item) => (
                <div key={item.label} style={{
                  background: '#f8f9ff', border: '1px solid #e8e4f0', borderRadius: 12,
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CHAMBRES */}
          <section id="chambres" style={{ scrollMarginTop: 130, ...cardStyle }}>
            <SectionHead title="Chambres, vues & formules" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>
              <ChipGroup title="Types de chambres" icon="🛏" items={hotel.room_types} />
              <ChipGroup title="Formules repas" icon="🍽" items={mealList} />
              <ChipGroup title="Vues disponibles" icon="🌅" items={hotel.room_views} />
              <ChipGroup title="Extras réservables" icon="＋" items={hotel.reservation_extras} />
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" style={{ scrollMarginTop: 130, ...cardStyle }}>
            <SectionHead title="Services & équipements" />
            <div style={{ display: 'grid', gap: 20, marginTop: 16 }}>
              {hotel.amenities?.length > 0 && (
                <div>
                  <GroupLabel>Équipements</GroupLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {hotel.amenities.map((a, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534',
                        padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                      }}>
                        <span>{amenityIcon(a)}</span>{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hotel.highlights?.length > 0 && (
                <div>
                  <GroupLabel>Points forts</GroupLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {hotel.highlights.map((h, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e',
                        padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                      }}>
                        ★ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hotel.nearby_places?.length > 0 && (
                <div>
                  <GroupLabel>À proximité</GroupLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {hotel.nearby_places.map((p, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af',
                        padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                      }}>
                        📍 {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* INFOS PRATIQUES */}
          <section id="infos" style={{ scrollMarginTop: 130, ...cardStyle }}>
            <SectionHead title="Infos pratiques" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, margin: '16px 0 24px' }}>
              {[
                { icon: '🔑', label: 'Check-in', value: hotel.checkin_time },
                { icon: '🚪', label: 'Check-out', value: hotel.checkout_time },
                { icon: '⭐', label: 'Note', value: hotel.rating ? `${hotel.rating} / 5` : null },
                { icon: '💬', label: 'Avis', value: hotel.reviews ? `${hotel.reviews} avis` : null },
                { icon: '🛏', label: 'Disponibles', value: hotel.available_rooms ? `${hotel.available_rooms} chambres` : null },
                { icon: '📊', label: 'Occupation', value: hotel.occupancy_percentage ? `${Math.round(hotel.occupancy_percentage)}%` : null },
              ].filter((i) => i.value).map((item) => (
                <div key={item.label} style={{
                  background: '#fdf8f5', border: '1px solid #f5e6df', borderRadius: 12,
                  padding: '16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {hotel.policies?.length > 0 && (
              <>
                <GroupLabel>Politiques de l'hôtel</GroupLabel>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hotel.policies.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 10,
                      padding: '10px 14px', fontSize: 14, color: '#1e40af',
                    }}>
                      <span style={{ marginTop: 1 }}>ℹ</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ── SIDEBAR ─────────────────────────────────────── */}
        <aside style={{ position: 'sticky', top: 130, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* PRICE CARD */}
          <div style={{
            background: '#fff', border: '1px solid #f0e8e4', borderRadius: 20,
            padding: '28px 24px', boxShadow: '0 8px 32px rgba(232,48,106,.08)',
          }}>
            {hotel.oldPrix && (
              <div style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 15, marginBottom: 4 }}>
                {hotel.oldPrix.toLocaleString('fr-FR')} {hotel.currency}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: '#e8306a', fontFamily: 'Georgia,serif' }}>
                {hotel.prix.toLocaleString('fr-FR')}
              </span>
              <span style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}>{hotel.currency}</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Prix de base par nuit
            </p>

            {/* stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f0e8e4' }}>
              <Stars count={hotel.stars} size={18} />
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                {hotel.rating} / 5 — {hotel.reviews} avis
              </span>
            </div>

            {/* quick perks */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                hotel.property_type || 'Hôtel',
                hotel.meals || 'Formules disponibles',
                `${hotel.total_rooms || 0} chambres au total`,
                `${hotel.available_rooms || 0} chambre(s) libre(s)`,
              ].map((perk, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#fde8f0',
                    color: '#e8306a', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>

            {/* occupation bar */}
            {hotel.occupancy_percentage != null && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                  <span>Taux d'occupation</span>
                  <span style={{ fontWeight: 700, color: '#e8306a' }}>{Math.round(hotel.occupancy_percentage)}%</span>
                </div>
                <div style={{ height: 6, background: '#f0e8e4', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.min(hotel.occupancy_percentage, 100)}%`,
                    background: 'linear-gradient(90deg,#e8306a,#b72754)', borderRadius: 999,
                    transition: 'width .8s ease',
                  }} />
                </div>
              </div>
            )}

            <button onClick={handleReserve} style={{
              ...btnStyle, width: '100%', padding: '14px', fontSize: 15, marginBottom: 10,
            }}>
              🛎 Réserver cet hôtel
            </button>
            <button onClick={() => navigate(-1)} style={{
              width: '100%', padding: '12px', background: 'none',
              border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 12,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              Retour
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 14, lineHeight: 1.5 }}>
              Données issues de votre base de données.<br />Prix hors taxes.
            </p>
          </div>

          {/* GALLERY THUMBNAILS MINI */}
          {galleryImages.length > 0 && (
            <div style={{
              background: '#fff', border: '1px solid #f0e8e4', borderRadius: 20, padding: 16,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                Photos ({galleryImages.length})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {galleryImages.slice(0, 6).map((src, i) => (
                  <div key={i} onClick={() => openLightbox(i)} style={{
                    paddingTop: '100%', position: 'relative', borderRadius: 8,
                    overflow: 'hidden', cursor: 'pointer',
                  }}>
                    <img src={src} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <Footer />

      {/* LIGHTBOX */}
      {lightbox.open && (
        <Lightbox
          images={galleryImages}
          index={lightbox.index}
          onClose={closeLightbox}
          onPrev={prevImg}
          onNext={nextImg}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
          aside { position: static !important; }
        }
        @media (max-width: 600px) {
          div[style*="gridTemplateColumns: repeat(3, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

/* ─── small helpers ─────────────────────────────────────────── */
const cardStyle = {
  background: '#fff',
  border: '1px solid #f0ece8',
  borderRadius: 20,
  padding: '28px 28px 32px',
  boxShadow: '0 2px 16px rgba(0,0,0,.04)',
};

const btnStyle = {
  background: 'linear-gradient(135deg,#e8306a,#b72754)',
  color: '#fff', border: 'none', borderRadius: 12,
  fontWeight: 700, cursor: 'pointer', fontSize: 14,
  padding: '12px 24px',
  transition: 'opacity .2s',
};

const SectionHead = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 4, height: 22, background: 'linear-gradient(180deg,#e8306a,#b72754)', borderRadius: 999 }} />
    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0a2832', margin: 0, fontFamily: 'Georgia,serif' }}>{title}</h3>
  </div>
);

const GroupLabel = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 4px' }}>
    {children}
  </p>
);

const ChipGroup = ({ title, icon, items }) => {
  if (!items?.length) return null;
  return (
    <div style={{ background: '#fafbff', border: '1px solid #ede9f6', borderRadius: 14, padding: '14px 16px' }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
        {icon} {title}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            background: '#fff', border: '1px solid #ddd6fe', color: '#4c1d95',
            padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
};

export default HotelDetailsPage;