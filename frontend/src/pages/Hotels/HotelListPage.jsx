// src/pages/hotels/HotelListPage.jsx
import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HotelCard from '../../components/HotelCard';

const getPrice = (h) => parseFloat(h.total_amount || 0);

const StarRating = ({ stars, size = 12 }) => (
  <span style={{ display:'inline-flex', gap:1 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width={size} height={size}
        fill={i<=stars?'#f59e0b':'none'} stroke={i<=stars?'#f59e0b':'#d1d5db'} strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </span>
);

const HotelListPage = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const hotels       = state?.hotels       || [];
  const searchParams = state?.searchParams || {};
  const { destination, check_in, check_out, adults=2, children=0, rooms=1 } = searchParams;

  const [sortBy,      setSortBy]      = useState('price_asc');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [filterStars, setFilterStars] = useState([]);
  const [filterBoard, setFilterBoard] = useState('');

  const hasResults = hotels.length > 0;

  const nights = check_in && check_out
    ? Math.round((new Date(check_out) - new Date(check_in)) / 86400000)
    : 1;

  // ── Derived data ───────────────────────────────────────────
  const boards = useMemo(() => {
    const set = new Set();
    hotels.forEach(h => { if (h.board_name) set.add(h.board_name); });
    return [...set].sort();
  }, [hotels]);

  const prices   = hotels.map(getPrice);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxAll   = prices.length ? Math.max(...prices) : 0;
  const currency = hotels[0]?.total_currency || 'TND';

  const allStars = useMemo(() => {
    const set = new Set();
    hotels.forEach(h => { if (h.stars) set.add(h.stars); });
    return [...set].sort((a,b) => b-a);
  }, [hotels]);

  // ── Filter + sort ──────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...hotels];
    if (filterStars.length) list = list.filter(h => filterStars.includes(h.stars));
    if (filterBoard)        list = list.filter(h => h.board_name === filterBoard);
    if (maxPrice !== '') {
      const cap = parseFloat(maxPrice);
      if (!isNaN(cap)) list = list.filter(h => getPrice(h) <= cap);
    }
    list.sort((a,b) => {
      const pa = getPrice(a), pb = getPrice(b);
      switch (sortBy) {
        case 'price_asc':  return pa - pb;
        case 'price_desc': return pb - pa;
        case 'stars_desc': return (b.stars||0) - (a.stars||0);
        case 'name_asc':   return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return list;
  }, [hotels, filterStars, filterBoard, maxPrice, sortBy]);

  const toggleStar = (s) => setFilterStars(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s]);
  const handleReset = () => { setFilterStars([]); setFilterBoard(''); setMaxPrice(''); };

  const handleSelect = (hotel) => {
    navigate('/hotels/details', { state: { hotel, searchParams } });
  };

  const PageHeader = () => (
    <div style={{ background:'linear-gradient(135deg, #0a2832 0%, #0f3460 100%)',
      paddingTop:110, paddingBottom:24 }}>
      <div className="container">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12,
          fontSize:13, color:'rgba(255,255,255,0.65)' }}>
          <button onClick={() => navigate('/hotels/search')}
            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.65)', fontSize:13 }}>
            ← Recherche hôtels
          </button>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M9 18l6-6-6-6"/></svg>
          <span style={{ color:'#fff', fontWeight:700 }}>Résultats</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:'0 0 4px' }}>
              🏨 Hôtels — {destination}
            </h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', margin:0 }}>
              {check_in} → {check_out} · {nights} nuit{nights>1?'s':''} · {adults+children} voyageur{adults+children>1?'s':''}
            </p>
          </div>
          {hasResults && (
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'6px 16px',
              color:'#fff', fontSize:13, fontWeight:700 }}>
              {filtered.length} hôtel{filtered.length>1?'s':''} trouvé{filtered.length>1?'s':''}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!hasResults) {
    return (
      <>
        <Navbar />
        <PageHeader />
        <div className="container" style={{ padding:'60px 0', textAlign:'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"
            width="60" height="60" style={{ display:'block', margin:'0 auto 20px' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <h2 style={{ color:'#64748b', marginBottom:12 }}>Aucun hôtel disponible</h2>
          <button onClick={() => navigate('/hotels/search')}
            style={{ padding:'12px 28px', background:'var(--secondary,#e67e22)', color:'#fff',
              border:'none', borderRadius:12, fontWeight:700, cursor:'pointer' }}>
            Nouvelle recherche
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageHeader />
      <div className="container" style={{ padding:'28px 0 60px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:24, alignItems:'start' }}>

          {/* ── Filters sidebar ──────────────────────────── */}
          <aside style={{ background:'#fff', borderRadius:16, padding:20,
            border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
            position:'sticky', top:90 }}>

            <h3 style={{ fontSize:14, fontWeight:800, color:'var(--gray-700)', marginBottom:20,
              textTransform:'uppercase', letterSpacing:'0.05em' }}>
              <i className="fas fa-sliders-h" style={{ color:'var(--secondary,#e67e22)', marginRight:8 }} />Filtres
            </h3>

            {/* Stars */}
            {allStars.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                  letterSpacing:'.06em', marginBottom:10 }}>Catégorie</p>
                {allStars.map(s => (
                  <label key={s} style={{ display:'flex', alignItems:'center', gap:8,
                    marginBottom:8, cursor:'pointer', fontSize:13 }}>
                    <input type="checkbox" checked={filterStars.includes(s)}
                      onChange={() => toggleStar(s)}
                      style={{ accentColor:'var(--secondary,#e67e22)' }} />
                    <StarRating stars={s} />
                    <span style={{ color:'#64748b' }}>{s} étoile{s>1?'s':''}</span>
                  </label>
                ))}
              </div>
            )}

            <div style={{ height:1, background:'#f1f5f9', marginBottom:20 }} />

            {/* Max price */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                letterSpacing:'.06em', marginBottom:10 }}>Prix max ({currency})</p>
              <input type="number" min={minPrice} max={maxAll}
                placeholder={`Max : ${Math.round(maxAll)}`}
                value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                style={{ width:'100%', padding:'8px 12px', borderRadius:8,
                  border:'1px solid #e2e8f0', fontSize:13 }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#94a3b8', marginTop:4 }}>
                <span>{Math.round(minPrice)}</span><span>{Math.round(maxAll)}</span>
              </div>
            </div>

            {/* Board */}
            {boards.length > 1 && (
              <>
                <div style={{ height:1, background:'#f1f5f9', marginBottom:20 }} />
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                    letterSpacing:'.06em', marginBottom:10 }}>Régime</p>
                  <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer', fontSize:13 }}>
                    <input type="radio" name="board" value="" checked={filterBoard===''}
                      onChange={() => setFilterBoard('')} style={{ accentColor:'var(--secondary,#e67e22)' }} />
                    Tous
                  </label>
                  {boards.map(b => (
                    <label key={b} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer', fontSize:13 }}>
                      <input type="radio" name="board" value={b} checked={filterBoard===b}
                        onChange={() => setFilterBoard(b)} style={{ accentColor:'var(--secondary,#e67e22)' }} />
                      {b}
                    </label>
                  ))}
                </div>
              </>
            )}

            <button onClick={handleReset}
              style={{ width:'100%', padding:'10px', borderRadius:10, border:'1px solid #e2e8f0',
                background:'#f8fafc', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              <i className="fas fa-undo" style={{ marginRight:6 }} />Réinitialiser
            </button>
          </aside>

          {/* ── Results ──────────────────────────────────── */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              marginBottom:16, flexWrap:'wrap', gap:8 }}>
              <p style={{ fontSize:13, color:'#64748b', margin:0 }}>
                <strong style={{ color:'#0a2832' }}>{filtered.length}</strong> hôtel{filtered.length>1?'s':''} correspondant{filtered.length>1?'s':''}
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, color:'#64748b' }}>Trier :</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ padding:'7px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:13, fontWeight:600 }}>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="stars_desc">Étoiles (↓)</option>
                  <option value="name_asc">Nom (A→Z)</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:16, padding:40, textAlign:'center', border:'1px solid #f1f5f9' }}>
                <i className="fas fa-filter" style={{ fontSize:36, color:'#cbd5e1', marginBottom:16, display:'block' }} />
                <p style={{ color:'#64748b', marginBottom:16 }}>Aucun hôtel ne correspond à vos filtres.</p>
                <button onClick={handleReset}
                  style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #e2e8f0',
                    background:'#f8fafc', color:'#64748b', fontSize:13, cursor:'pointer' }}>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {filtered.map(hotel => (
                  <HotelCard key={hotel.code} hotel={hotel}
                    checkIn={check_in} checkOut={check_out}
                    onSelect={() => handleSelect(hotel)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HotelListPage;