
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OmraCard from '../components/Omracard ';
import OmraSearchBar from '../components/OmraSearchBar ';

// ─── Data ────────────────────────────────────────────────────────────────────

const omraPackages = [
  {
    id: 1,
    title: 'Omra Économique',
    subtitle: 'Essentiel & Accessible',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
    badge: 'Populaire',
    badgeType: 'new',
    duration: 10,
    price: 2490,
    oldPrice: 2890,
    rating: 4.6,
    reviews: 128,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ La Mecque' },
      { icon: 'fas fa-bus', label: 'Transport inclus' },
    ],
    description:
      'Forfait idéal pour les pèlerins souhaitant accomplir leur Omra dans de bonnes conditions à un tarif accessible.',
    spots: 12,
  },
  {
    id: 2,
    title: 'Omra Confort',
    subtitle: 'Équilibre & Sérénité',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
    badge: 'Recommandé',
    badgeType: 'promo',
    duration: 14,
    price: 3690,
    oldPrice: null,
    rating: 4.8,
    reviews: 214,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ La Mecque' },
      { icon: 'fas fa-bus', label: 'Transport VIP' },
      { icon: 'fas fa-utensils', label: 'Petit-déjeuner' },
    ],
    description:
      'Une expérience spirituelle enrichissante avec hébergement 4 étoiles et services haut de gamme pour un séjour serein.',
    spots: 8,
  },
  {
    id: 3,
    title: 'Omra Prestige',
    subtitle: 'Luxe & Proximité',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
    badge: 'Premium',
    badgeType: 'default',
    duration: 21,
    price: 5990,
    oldPrice: null,
    rating: 4.9,
    reviews: 97,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol business A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 5★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 5★ face Haram' },
      { icon: 'fas fa-car', label: 'Transferts privés' },
      { icon: 'fas fa-concierge-bell', label: 'Guide personnel' },
      { icon: 'fas fa-utensils', label: 'Demi-pension' },
    ],
    description:
      'Le summum du pèlerinage avec hôtel 5 étoiles face à la Kaaba, guide dédié et services de conciergerie personnalisés.',
    spots: 4,
  },
  {
    id: 4,
    title: 'Omra Famille',
    subtitle: 'Voyage en Famille',
    image: 'https://images.unsplash.com/photo-1609252925546-bad8d3f0f5ac?w=800&q=80',
    badge: 'Famille',
    badgeType: 'new',
    duration: 12,
    price: 2990,
    oldPrice: 3490,
    rating: 4.7,
    reviews: 76,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Chambres familiales 4★' },
      { icon: 'fas fa-bus', label: 'Transport inclus' },
      { icon: 'fas fa-child', label: 'Réduction enfants' },
      { icon: 'fas fa-utensils', label: 'Petit-déjeuner' },
    ],
    description:
      'Partagez ce moment spirituel unique avec vos proches. Chambres familiales spacieuses et programme adapté à tous les âges.',
    spots: 6,
  },
  {
    id: 5,
    title: 'Omra Ramadan',
    subtitle: 'Mois Sacré',
    image: 'https://images.unsplash.com/photo-1540903348946-c41e4a9e2b29?w=800&q=80',
    badge: 'Ramadan',
    badgeType: 'promo',
    duration: 15,
    price: 4290,
    oldPrice: 4890,
    rating: 4.9,
    reviews: 163,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ La Mecque' },
      { icon: 'fas fa-moon', label: 'Iftar organisé' },
      { icon: 'fas fa-bus', label: 'Transport VIP' },
    ],
    description:
      "Vivez le Ramadan dans les lieux les plus sacrés de l'Islam. Une expérience spirituelle incomparable au cœur du mois béni.",
    spots: 3,
  },
  {
    id: 6,
    title: 'Omra Express',
    subtitle: 'Court Séjour',
    image: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&q=80',
    badge: 'Flash',
    badgeType: 'default',
    duration: 7,
    price: 1890,
    oldPrice: null,
    rating: 4.5,
    reviews: 52,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ La Mecque' },
      { icon: 'fas fa-bus', label: 'Transport inclus' },
    ],
    description:
      "Pour ceux qui ont peu de temps disponible, notre formule Express permet d'accomplir l'Omra en 7 jours seulement.",
    spots: 15,
  },
];

const statsData = [
  { icon: 'fas fa-users', value: '5 000+', label: 'Pèlerins accompagnés' },
  { icon: 'fas fa-star', value: '4.8/5', label: 'Satisfaction moyenne' },
  { icon: 'fas fa-calendar-check', value: '15 ans', label: "D'expérience" },
  { icon: 'fas fa-globe', value: '100%', label: 'Formules agréées' },
];

// ─── Details Modal ────────────────────────────────────────────────────────────

const DetailsModal = ({ pkg, onClose, onReserve }) => {
  if (!pkg) return null;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,25,35,0.65)', backdropFilter: 'blur(6px)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--white)', borderRadius: 24,
          width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          animation: 'modalIn 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <div style={{ position: 'relative', height: 260, overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
          <img src={pkg.image} alt={pkg.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,40,50,0.7) 0%, transparent 50%)' }} />
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-700)',
            }}
          >
            <i className="fas fa-times" />
          </button>
          <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
            <h2 style={{ color: 'var(--white)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{pkg.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{pkg.subtitle}</p>
          </div>
        </div>

        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { icon: 'fas fa-calendar-alt', label: 'Durée', value: `${pkg.duration} jours` },
              { icon: 'fas fa-map-marker-alt', label: 'Départ', value: pkg.departure },
              { icon: 'fas fa-star', label: 'Note', value: `${pkg.rating} / 5` },
              { icon: 'fas fa-users', label: 'Avis', value: `${pkg.reviews} avis` },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-400)', fontSize: 12, marginBottom: 4 }}>
                  <i className={item.icon} style={{ color: 'var(--secondary)' }} /> {item.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 24 }}>{pkg.description}</p>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14 }}>Ce forfait comprend :</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            {pkg.includes.map((inc, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '10px 16px', background: 'rgba(15,76,92,0.06)',
                  borderRadius: 12, fontSize: 13, color: 'var(--primary)', fontWeight: 600,
                }}
              >
                <i className={inc.icon} style={{ color: 'var(--secondary)', fontSize: 13 }} />
                {inc.label}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              {pkg.oldPrice && (
                <span style={{ fontSize: 14, color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                  {pkg.oldPrice.toLocaleString('fr-TN')} TND
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent)' }}>{pkg.price.toLocaleString('fr-TN')}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>TND</span>
                <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>/pers.</span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onReserve(pkg); }}
              style={{
                padding: '16px 36px', background: 'var(--secondary)', color: 'var(--white)',
                border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <i className="fas fa-kaaba" /> Réserver maintenant
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
};

// ─── Reserve Modal ────────────────────────────────────────────────────────────

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--gray-600)',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
};
const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)',
  borderRadius: 12, fontSize: 14, color: 'var(--gray-800)',
  outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box',
};

const ReserveModal = ({ pkg, onClose }) => {
  const [form, setForm] = useState({ date: '', persons: 1, firstName: '', lastName: '', phone: '', email: '', note: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!pkg) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,25,35,0.65)', backdropFilter: 'blur(6px)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--white)', borderRadius: 24,
          width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          animation: 'modalIn 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <div style={{ background: 'var(--primary)', padding: '28px 32px', borderRadius: '24px 24px 0 0', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
              color: 'var(--white)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <i className="fas fa-times" />
          </button>
          <h2 style={{ color: 'var(--white)', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Réservation — {pkg.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {pkg.duration} jours · {pkg.price.toLocaleString('fr-TN')} TND/pers.
          </p>
        </div>

        <div style={{ padding: '28px 32px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: 72, height: 72,
                  background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: 28, color: 'var(--white)',
                }}
              >
                <i className="fas fa-check" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-800)', marginBottom: 10 }}>Demande envoyée !</h3>
              <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7 }}>
                Notre équipe vous contactera dans les plus brefs délais pour confirmer votre réservation.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 24, padding: '14px 32px',
                  background: 'var(--secondary)', color: 'var(--white)',
                  border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Prénom</label>
                  <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Prénom" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Nom" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+216 XX XXX XXX" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Date de départ souhaitée</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nombre de personnes</label>
                  <input required type="number" min={1} max={20} value={form.persons} onChange={(e) => setForm({ ...form, persons: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Remarques (optionnel)</label>
                <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Besoins spéciaux, questions..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div
                style={{
                  background: 'rgba(15,76,92,0.06)', borderRadius: 14, padding: '14px 18px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 14, color: 'var(--gray-600)', fontWeight: 600 }}>
                  Total estimé ({form.persons} pers.) :
                </span>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)' }}>
                  {(pkg.price * form.persons).toLocaleString('fr-TN')} TND
                </span>
              </div>
              <button
                type="submit"
                style={{
                  padding: '16px', background: 'var(--secondary)', color: 'var(--white)',
                  border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                <i className="fas fa-paper-plane" /> Envoyer la demande de réservation
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const OmraPage = () => {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [detailsPkg, setDetailsPkg] = useState(null);
  const [reservePkg, setReservePkg] = useState(null);

  const filters = ['Tous', 'Économique', 'Confort', 'Prestige', 'Famille', 'Ramadan'];

  const handleSearch = (params) => {
    console.log('Search params:', params);
    // TODO: filter cards by date / duration / persons
  };

  const filtered = omraPackages.filter((pkg) => {
    if (activeFilter === 'Tous') return true;
    return (
      pkg.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
      pkg.subtitle.toLowerCase().includes(activeFilter.toLowerCase())
    );
  });

  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', paddingTop: 120,
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1600&q=80')`,
            backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.45)',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,40,50,0.3) 0%, rgba(10,40,50,0.6) 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 20px' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50,
              padding: '10px 22px', fontSize: 13, color: 'rgba(255,255,255,0.9)',
              fontWeight: 600, marginBottom: 28, letterSpacing: '0.05em',
            }}
          >
            <i className="fas fa-kaaba" style={{ color: '#D4A017' }} />
            Pèlerinage & Spiritualité
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900,
              color: 'var(--white)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em',
            }}
          >
            Votre Voyage<br />
            <span style={{ color: '#D4A017' }}>Spirituel Idéal</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.8)',
              maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7,
            }}
          >
            Accomplissez votre Omra en toute sérénité avec nos forfaits tout compris,
            conçus pour une expérience spirituelle inoubliable.
          </p>

          {/* ── OmraSearchBar ─────────────────────────────────── */}
          <OmraSearchBar
            onSearch={handleSearch}
            style={{ maxWidth: 820, margin: '0 auto' }}
          />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--primary)', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="stats-grid">
            {statsData.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                <div
                  style={{
                    width: 52, height: 52, background: 'rgba(255,255,255,0.1)',
                    borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: '#D4A017',
                  }}
                >
                  <i className={s.icon} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--white)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span
              style={{
                display: 'inline-block', padding: '6px 18px',
                background: 'rgba(15,76,92,0.08)', color: 'var(--secondary)',
                borderRadius: 50, fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
              }}
            >
              <i className="fas fa-kaaba" style={{ marginRight: 8 }} />
              Nos Forfaits Omra
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: 'var(--gray-800)', marginBottom: 16, lineHeight: 1.2 }}>
              Choisissez votre<br />voyage spirituel
            </h2>
            <p style={{ fontSize: 16, color: 'var(--gray-500)', maxWidth: 520, margin: '0 auto' }}>
              Des forfaits adaptés à tous les budgets et besoins, pour vivre votre Omra dans les meilleures conditions.
            </p>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '10px 22px', borderRadius: 50,
                  border: `2px solid ${activeFilter === f ? 'var(--secondary)' : 'var(--gray-200)'}`,
                  background: activeFilter === f ? 'var(--secondary)' : 'var(--white)',
                  color: activeFilter === f ? 'var(--white)' : 'var(--gray-600)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.22s ease',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ── OmraCard grid ──────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }} className="cards-grid">
            {filtered.map((pkg) => (
              <OmraCard
                key={pkg.id}
                pkg={pkg}
                onDetails={setDetailsPkg}
                onReserve={setReservePkg}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose us ─────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="why-grid">
            <div>
              <span
                style={{
                  display: 'inline-block', padding: '6px 18px',
                  background: 'rgba(15,76,92,0.08)', color: 'var(--secondary)',
                  borderRadius: 50, fontSize: 12, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
                }}
              >
                Pourquoi nous choisir
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, color: 'var(--gray-800)', lineHeight: 1.2, marginBottom: 20 }}>
                Votre pèlerinage,<br />notre priorité absolue
              </h2>
              <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.75, marginBottom: 36 }}>
                Depuis 15 ans, TICTAC VOYAGES accompagne les pèlerins tunisiens dans leur voyage
                spirituel avec sérieux, expertise et dévotion.
              </p>
              {[
                { icon: 'fas fa-shield-alt', title: 'Agence agréée', desc: 'Autorisée par le Ministère du Tourisme et les autorités saoudiennes.' },
                { icon: 'fas fa-headset', title: 'Accompagnement 24/7', desc: 'Un guide dédié vous accompagne tout au long de votre séjour.' },
                { icon: 'fas fa-heart', title: 'Soin du détail', desc: 'Chaque forfait est conçu pour une expérience spirituelle optimale.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 18, marginBottom: 22 }}>
                  <div
                    style={{
                      width: 50, height: 50,
                      background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                      borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--white)', fontSize: 18, flexShrink: 0,
                    }}
                  >
                    <i className={item.icon} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 5 }}>{item.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 28, overflow: 'hidden', height: 480, boxShadow: '0 24px 60px rgba(15,76,92,0.2)' }}>
                <img
                  src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80"
                  alt="La Mecque"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  position: 'absolute', bottom: -20, left: -24,
                  background: 'var(--white)', borderRadius: 20,
                  padding: '20px 24px', boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                  display: 'flex', alignItems: 'center', gap: 16, minWidth: 240,
                }}
              >
                <div
                  style={{
                    width: 52, height: 52,
                    background: 'linear-gradient(135deg, #D4A017, #F0C040)',
                    borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--white)', fontSize: 22,
                  }}
                >
                  <i className="fas fa-star" />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-800)' }}>5 000+</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Pèlerins satisfaits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, rgba(15,76,92,0.9) 100%)',
          padding: '70px 0', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <i className="fas fa-kaaba" style={{ fontSize: 48, color: '#D4A017', marginBottom: 20, display: 'block' }} />
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: 'var(--white)', marginBottom: 16, lineHeight: 1.2 }}>
            Prêt pour votre voyage spirituel ?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Contactez notre équipe spécialisée dès aujourd'hui pour construire votre Omra sur mesure.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="tel:+21636149885"
              style={{
                padding: '16px 36px', background: '#D4A017', color: '#fff',
                borderRadius: 14, fontSize: 15, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none',
              }}
            >
              <i className="fas fa-phone" /> Appeler maintenant
            </a>
            <a
              href="#footer"
              style={{
                padding: '16px 36px',
                background: 'rgba(255,255,255,0.12)', color: 'var(--white)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 14, fontSize: 15, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none',
              }}
            >
              <i className="fas fa-envelope" /> Nous écrire
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <DetailsModal pkg={detailsPkg} onClose={() => setDetailsPkg(null)} onReserve={setReservePkg} />
      <ReserveModal pkg={reservePkg} onClose={() => setReservePkg(null)} />

      <style>{`
        @media (max-width: 1024px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .cards-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
};

export default OmraPage;