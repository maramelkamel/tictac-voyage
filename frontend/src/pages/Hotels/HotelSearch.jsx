// src/pages/hotels/HotelSearch.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HotelCard from '../../components/HotelCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Popular destinations ──────────────────────────────────────
const POPULAR_DESTINATIONS = [
  { code: 'PMI', city: 'Palma de Mallorca', country: 'Espagne',    emoji: '🏝️', color: '#0891b2' },
  { code: 'CDG', city: 'Paris',             country: 'France',     emoji: '🗼', color: '#4f46e5' },
  { code: 'DXB', city: 'Dubaï',             country: 'EAU',        emoji: '🏙️', color: '#d97706' },
  { code: 'IST', city: 'Istanbul',          country: 'Turquie',    emoji: '🕌', color: '#dc2626' },
  { code: 'LHR', city: 'Londres',           country: 'UK',         emoji: '🎡', color: '#7c3aed' },
  { code: 'FCO', city: 'Rome',              country: 'Italie',     emoji: '🏛️', color: '#16a34a' },
  { code: 'BCN', city: 'Barcelone',         country: 'Espagne',    emoji: '🎨', color: '#b91c1c' },
  { code: 'MRS', city: 'Marseille',         country: 'France',     emoji: '⛵', color: '#0369a1' },
];

const DEAL_DESTINATIONS = [
  { code: 'PMI', label: 'Mallorca' },
  { code: 'CDG', label: 'Paris' },
  { code: 'IST', label: 'Istanbul' },
  { code: 'DXB', label: 'Dubaï' },
];

const today    = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const in7days  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
const in14days = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
const in10days = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

const SkeletonCard = () => (
  <div style={{
    height: 160, borderRadius: 16,
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite',
  }} />
);

const Counter = ({ value, onDec, onInc, min = 0, max = 9 }) => (
  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
    <button type="button" onClick={onDec} disabled={value <= min}
      style={{ padding: '10px 16px', border: 'none', background: '#f8fafc',
        cursor: value <= min ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16,
        color: value <= min ? '#cbd5e1' : 'var(--gray-700)' }}>−</button>
    <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 15, minWidth: 30 }}>{value}</span>
    <button type="button" onClick={onInc} disabled={value >= max}
      style={{ padding: '10px 16px', border: 'none', background: '#f8fafc',
        cursor: value >= max ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16,
        color: value >= max ? '#cbd5e1' : 'var(--gray-700)' }}>+</button>
  </div>
);

const SectionTitle = ({ icon, badge, title, subtitle }) => (
  <div style={{ marginBottom: 28 }}>
    {badge && (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(230,126,34,0.08)', borderRadius: 20, padding: '4px 14px', marginBottom: 10 }}>
        <i className={`fas ${icon}`} style={{ color: 'var(--secondary)', fontSize: 12 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)',
          textTransform: 'uppercase', letterSpacing: '.1em' }}>{badge}</span>
      </div>
    )}
    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{subtitle}</p>}
  </div>
);

// ══════════════════════════════════════════════════════════════
const HotelSearch = () => {
  const navigate = useNavigate();

  // ── Search form ────────────────────────────────────────────
  const [destination, setDestination] = useState('');
  const [checkIn,     setCheckIn]     = useState('');
  const [checkOut,    setCheckOut]    = useState('');
  const [adults,      setAdults]      = useState(2);
  const [children,    setChildren]    = useState(0);
  const [rooms,       setRooms]       = useState(1);
  const [stars,       setStars]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // ── Dynamic sections ───────────────────────────────────────
  const [bestDeals,      setBestDeals]      = useState([]);
  const [dealsLoading,   setDealsLoading]   = useState(false);
  const [upcoming,       setUpcoming]       = useState([]);
  const [upcomingLoad,   setUpcomingLoad]   = useState(false);
  const [activeDeal,     setActiveDeal]     = useState(0);

  useEffect(() => { fetchDeals(0); fetchUpcoming(); }, []);

  const fetchDeals = async (idx) => {
    setDealsLoading(true); setBestDeals([]);
    try {
      const dest = DEAL_DESTINATIONS[idx];
      const res = await fetch(`${API_BASE}/hotels/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: dest.code,
          check_in:    in10days,
          check_out:   in14days,
          adults: 2, children: 0, rooms: 1,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const sorted = [...(json.hotels || [])].sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
        setBestDeals(sorted.slice(0, 3));
      }
    } catch { /* silent */ }
    finally { setDealsLoading(false); }
  };

  const fetchUpcoming = async () => {
    setUpcomingLoad(true);
    try {
      const res = await fetch(`${API_BASE}/hotels/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: 'IST',
          check_in:    in7days,
          check_out:   in10days,
          adults: 2, children: 0, rooms: 1,
        }),
      });
      const json = await res.json();
      if (json.success) setUpcoming((json.hotels || []).slice(0, 3));
    } catch { /* silent */ }
    finally { setUpcomingLoad(false); }
  };

  const handleDealTabChange = (idx) => {
    setActiveDeal(idx);
    fetchDeals(idx);
  };

  const toggleStar = (s) =>
    setStars(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleQuickSearch = async (dest) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/hotels/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: dest.code,
          check_in:    in14days,
          check_out:   new Date(Date.now() + 17 * 86400000).toISOString().split('T')[0],
          adults: 2, children: 0, rooms: 1,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      navigate('/hotels/results', {
        state: {
          hotels: json.hotels,
          searchParams: {
            destination: dest.code, city: dest.city,
            check_in: json.check_in, check_out: json.check_out,
            adults: 2, children: 0, rooms: 1,
          },
        },
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault(); setError('');
    if (!destination.trim()) return setError('Veuillez saisir une destination.');
    if (!checkIn)   return setError('Veuillez choisir une date d\'arrivée.');
    if (!checkOut)  return setError('Veuillez choisir une date de départ.');
    if (checkOut <= checkIn) return setError('La date de départ doit être après l\'arrivée.');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hotels/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination.trim().toUpperCase(),
          check_in: checkIn, check_out: checkOut,
          adults, children, rooms,
          stars_filter: stars.length ? stars : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur lors de la recherche.');
      navigate('/hotels/results', {
        state: {
          hotels: json.hotels,
          searchParams: { destination: destination.trim().toUpperCase(), check_in: checkIn, check_out: checkOut, adults, children, rooms },
        },
      });
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .dest-card:hover   { transform:translateY(-4px) !important; box-shadow:0 12px 32px rgba(0,0,0,0.15) !important; }
        .dest-card         { transition:transform .25s, box-shadow .25s; }
      `}</style>

      {/* ── Hero + Search ─────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0a2832 0%, #0f3460 100%)',
        paddingTop: 130, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative */}
        <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300,
          borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-80, left:-40, width:220, height:220,
          borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', top:'25%', right:'10%', opacity:.06 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1" width="150" height="150">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>

        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--secondary,#e67e22)" strokeWidth="2" width="28" height="28">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <h1 style={{ fontSize:36, fontWeight:800, color:'#fff', margin:0 }}>Trouvez votre hôtel</h1>
            </div>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.75)', margin:0 }}>
              Milliers d'hôtels via Hotelbeds · Taxes incluses · Réservation sécurisée
            </p>
          </div>

          {/* Search card */}
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px',
            boxShadow:'0 20px 60px rgba(0,0,0,0.25)', maxWidth:960, margin:'0 auto' }}>

            <form onSubmit={handleSearch}>
              {/* Row 1 : destination + dates */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:16, alignItems:'end' }}>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--secondary,#e67e22)" strokeWidth="2"
                      width="13" height="13" style={{ marginRight:5, verticalAlign:'middle' }}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    Destination (code) *
                  </label>
                  <input required value={destination} onChange={e => setDestination(e.target.value.toUpperCase())}
                    placeholder="ex : PMI, CDG, IST…" maxLength={10}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #e2e8f0',
                      fontSize:15, fontWeight:700, letterSpacing:2, textTransform:'uppercase',
                      outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
                    📅 Arrivée *
                  </label>
                  <input required type="date" min={tomorrow} value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #e2e8f0',
                      fontSize:14, outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
                    📅 Départ *
                  </label>
                  <input required type="date" min={checkIn || tomorrow} value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #e2e8f0',
                      fontSize:14, outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>

              {/* Row 2 : guests + stars */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:14, alignItems:'flex-end', marginBottom:20 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
                    👤 Adultes
                  </label>
                  <Counter value={adults} onDec={() => setAdults(v => Math.max(1,v-1))} onInc={() => setAdults(v => Math.min(9,v+1))} min={1} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
                    👶 Enfants
                  </label>
                  <Counter value={children} onDec={() => setChildren(v => Math.max(0,v-1))} onInc={() => setChildren(v => Math.min(8,v+1))} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
                    🛏️ Chambres
                  </label>
                  <Counter value={rooms} onDec={() => setRooms(v => Math.max(1,v-1))} onInc={() => setRooms(v => Math.min(9,v+1))} min={1} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
                    Catégorie
                  </label>
                  <div style={{ display:'flex', gap:4 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => toggleStar(s)}
                        style={{ width:30, height:30, borderRadius:6, border:'none', cursor:'pointer',
                          background: stars.includes(s) ? '#fef3c7' : '#f1f5f9',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg viewBox="0 0 24 24" width="14" height="14"
                          fill={stars.includes(s) ? '#f59e0b' : 'none'}
                          stroke={stars.includes(s) ? '#f59e0b' : '#94a3b8'} strokeWidth="1.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10,
                  padding:'10px 16px', marginBottom:16, fontSize:13, color:'#991b1b',
                  display:'flex', alignItems:'center', gap:8 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'15px 24px', border:'none', borderRadius:12,
                  fontSize:15, fontWeight:800, cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, var(--secondary,#e67e22), #e67e22)',
                  color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                {loading
                  ? <><i className="fas fa-spinner fa-spin" /> Recherche en cours…</>
                  : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Rechercher — {adults+children} voyageur{adults+children>1?'s':''}, {rooms} chambre{rooms>1?'s':''}</>}
              </button>
            </form>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', justifyContent:'center', gap:40, marginTop:32, flexWrap:'wrap' }}>
            {[
              { icon:'fa-hotel',      val:'150 000+', lbl:'Hôtels' },
              { icon:'fa-globe',      val:'185+',     lbl:'Pays' },
              { icon:'fa-star',       val:'5 étoiles',lbl:'Jusqu\'à' },
              { icon:'fa-headset',    val:'6j/7',     lbl:'Support' },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:900, color:'#fff' }}>{s.val}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                  <i className={`fas ${s.icon}`} style={{ fontSize:10 }} />{s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dynamic sections ─────────────────────────────── */}
      <div className="container" style={{ padding:'60px 0' }}>

        {/* 1 — Popular destinations ─────────────────────── */}
        <section style={{ marginBottom:64 }}>
          <SectionTitle icon="fa-fire" badge="Tendances" title="🌍 Destinations populaires"
            subtitle="Cliquez pour voir les hôtels disponibles · Prix en temps réel" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {POPULAR_DESTINATIONS.map((dest,i) => (
              <button key={i} className="dest-card"
                onClick={() => !loading && handleQuickSearch(dest)}
                disabled={loading}
                style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:16,
                  padding:'20px 18px', textAlign:'left', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.06)', opacity: loading ? 0.7 : 1,
                  position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4,
                  background:dest.color, borderRadius:'16px 16px 0 0' }} />
                <div style={{ fontSize:32, marginBottom:10 }}>{dest.emoji}</div>
                <div style={{ fontSize:16, fontWeight:800, color:'#0a2832', marginBottom:2 }}>{dest.city}</div>
                <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600, marginBottom:10 }}>{dest.country}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                  <span style={{ background:'#f0f9ff', color:'#0369a1', borderRadius:6,
                    padding:'2px 8px', fontWeight:700 }}>{dest.code}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" width="10" height="10"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 2 — Best deals ──────────────────────────────── */}
        <section style={{ marginBottom:64 }}>
          <SectionTitle icon="fa-tags" badge="Meilleures offres" title="💸 Prix les plus bas du moment"
            subtitle="Hôtels actualisés en temps réel · Taxes incluses · 10% marge agence" />

          {/* Destination tabs */}
          <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
            {DEAL_DESTINATIONS.map((d,i) => (
              <button key={i} onClick={() => handleDealTabChange(i)} disabled={dealsLoading}
                style={{ padding:'8px 18px', borderRadius:30, border:'none', cursor: dealsLoading ? 'not-allowed' : 'pointer',
                  fontWeight:700, fontSize:12,
                  background: activeDeal===i ? 'var(--secondary,#e67e22)' : '#f1f5f9',
                  color: activeDeal===i ? '#fff' : '#475569',
                  boxShadow: activeDeal===i ? '0 2px 8px rgba(230,126,34,.3)' : 'none',
                  opacity: dealsLoading && activeDeal!==i ? 0.5 : 1 }}>
                🏨 {d.label}
              </button>
            ))}
          </div>

          {dealsLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : bestDeals.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {bestDeals.map((hotel,i) => (
                <div key={hotel.code} style={{ position:'relative' }}>
                  {i===0 && (
                    <div style={{ position:'absolute', top:-10, left:16, zIndex:2,
                      background:'linear-gradient(135deg,#f59e0b,#d97706)',
                      color:'#fff', borderRadius:8, padding:'3px 10px',
                      fontSize:11, fontWeight:800, display:'flex', alignItems:'center', gap:5 }}>
                      ⭐ Meilleur prix
                    </div>
                  )}
                  <HotelCard hotel={hotel}
                    checkIn={in10days} checkOut={in14days}
                    onSelect={() => navigate('/hotels/details', { state: { hotel, searchParams: {
                      check_in: in10days, check_out: in14days, adults:2, children:0, rooms:1,
                    }}}) } />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background:'#f8fafc', borderRadius:16, padding:32, textAlign:'center', border:'1px dashed #e2e8f0' }}>
              <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>Aucune offre disponible pour cette destination.</p>
            </div>
          )}
        </section>

        {/* 3 — Upcoming / séjours prochains ───────────────── */}
        <section style={{ marginBottom:64 }}>
          <SectionTitle icon="fa-clock" badge="Prochains séjours" title="📍 Disponibilités dans 7 jours"
            subtitle="Istanbul · Départ dans 1 semaine · Réservez maintenant" />
          {upcomingLoad ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : upcoming.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {upcoming.map(hotel => (
                <HotelCard key={hotel.code} hotel={hotel}
                  checkIn={in7days} checkOut={in10days}
                  onSelect={() => navigate('/hotels/details', { state: { hotel, searchParams: {
                    check_in: in7days, check_out: in10days, adults:2, children:0, rooms:1,
                  }}})} />
              ))}
            </div>
          ) : (
            <div style={{ background:'#f8fafc', borderRadius:16, padding:32, textAlign:'center', border:'1px dashed #e2e8f0' }}>
              <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>Aucun séjour imminent disponible.</p>
            </div>
          )}
        </section>

        {/* 4 — Why us ──────────────────────────────────────── */}
        <section>
          <SectionTitle icon="fa-shield-alt" badge="Pourquoi nous" title="Réservez en toute confiance" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              { icon:'fa-shield-alt',    color:'#4f46e5', title:'Paiement sécurisé',        desc:'SSL 256-bit ou paiement à l\'agence. Vos données sont protégées.' },
              { icon:'fa-tags',          color:'#16a34a', title:'Prix Hotelbeds en temps réel', desc:'Marge agence transparente de 10%. Meilleurs tarifs garantis.' },
              { icon:'fa-headset',       color:'#d97706', title:'Support 6j/7',               desc:'Notre équipe est disponible du lundi au samedi de 09h à 18h.' },
              { icon:'fa-undo',          color:'#0891b2', title:'Annulation flexible',         desc:'Conditions d\'annulation visibles sur chaque chambre avant réservation.' },
              { icon:'fa-concierge-bell',color:'#dc2626', title:'Services inclus',             desc:'Petit-déjeuner, demi-pension selon le type de chambre choisi.' },
              { icon:'fa-map-marker-alt',color:'#7c3aed', title:'Agence locale Tunis',         desc:'Venez payer en espèces ou virement à notre agence à Tunis.' },
            ].map((item,i) => (
              <div key={i} style={{ background:'#fff', borderRadius:16, padding:24,
                border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                  background:`${item.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className={`fas ${item.icon}`} style={{ fontSize:18, color:item.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:700, color:'#0a2832', marginBottom:6, marginTop:0 }}>{item.title}</h3>
                  <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6, margin:0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default HotelSearch;