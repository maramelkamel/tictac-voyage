// src/pages/admin/flights/FlightPricingAdmin.jsx
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_BASE = 'http://localhost:5000/api/flights';

// ── Helpers ───────────────────────────────────────────────────
const fmtPrice = (amount, currency = 'TND') =>
  `${parseFloat(amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;

const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const PRESET_ROUTES = [
  { origin: 'TUN', destination: 'CDG', label: 'Tunis → Paris' },
  { origin: 'TUN', destination: 'IST', label: 'Tunis → Istanbul' },
  { origin: 'TUN', destination: 'LHR', label: 'Tunis → Londres' },
  { origin: 'TUN', destination: 'DXB', label: 'Tunis → Dubaï' },
  { origin: 'TUN', destination: 'FCO', label: 'Tunis → Rome' },
  { origin: 'TUN', destination: 'MRS', label: 'Tunis → Marseille' },
];

// ── PriceEditModal ────────────────────────────────────────────
const PriceEditModal = ({ offer, onSave, onClose }) => {
  const originalTND = parseFloat(offer.total_amount || 0);
  const [newPrice, setNewPrice] = useState(originalTND.toFixed(2));
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');

  const handleSave = async () => {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val <= 0) return setErr('Veuillez saisir un prix valide.');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/price-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offer.id, overridden_price: val }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur');
      onSave(offer.id, val);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const s      = offer._summary || {};
  const margin = ((originalTND / parseFloat(offer._original_amount || 1)) - 1) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a2832', margin: 0 }}>✏️ Modifier le prix</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 22, color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>

        {/* Flight summary */}
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2832', marginBottom: 4 }}>
            {s.origin_iata || '—'} → {s.destination_iata || '—'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {s.airline_name} · {fmtTime(s.departing_at)}
          </div>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', marginTop: 4 }}>
            {offer.id?.slice(0, 28)}…
          </div>
        </div>

        {/* Price comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase',
              letterSpacing: '.06em', marginBottom: 4 }}>Prix original</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0a2832' }}>
              {fmtPrice(offer._original_amount, offer._original_currency || 'EUR')}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Source API Duffel</div>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase',
              letterSpacing: '.06em', marginBottom: 4 }}>Prix actuel (TND)</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0a2832' }}>
              {fmtPrice(offer.total_amount, 'TND')}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              Marge auto : +{margin.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
            Nouveau prix (TND) *
          </label>
          <div style={{ position: 'relative' }}>
            <input type="number" min="0" step="0.01"
              value={newPrice}
              onChange={e => { setNewPrice(e.target.value); setErr(''); }}
              style={{ width: '100%', padding: '12px 60px 12px 14px', borderRadius: 10,
                border: `2px solid ${err ? '#fca5a5' : '#e2e8f0'}`, fontSize: 16, fontWeight: 700,
                outline: 'none', boxSizing: 'border-box' }} />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>TND</span>
          </div>
          {err && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>⚠️ {err}</div>}
          {parseFloat(newPrice) > 0 && !isNaN(parseFloat(newPrice)) && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              Écart vs prix auto :{' '}
              {parseFloat(newPrice) > originalTND
                ? <span style={{ color: '#dc2626' }}>+{(parseFloat(newPrice) - originalTND).toFixed(2)} TND</span>
                : <span style={{ color: '#16a34a' }}>{(parseFloat(newPrice) - originalTND).toFixed(2)} TND</span>
              }
            </div>
          )}
        </div>

        <div style={{ background: '#fff8e1', border: '1px solid #fde68a', borderRadius: 8,
          padding: '10px 12px', fontSize: 12, color: '#92400e', marginBottom: 20 }}>
          ⚠️ Le prix original Duffel est conservé pour la facturation. Seul le prix affiché client change.
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={saving}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none',
              background: saving ? '#94a3b8' : 'linear-gradient(135deg,var(--secondary,#e67e22),#d35400)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳ Sauvegarde…' : '✓ Appliquer le prix'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  FlightPricingAdmin
// ══════════════════════════════════════════════════════════════
const FlightPricingAdmin = () => {
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [offers,        setOffers]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [editOffer,     setEditOffer]     = useState(null);
  const [overrides,     setOverrides]     = useState({});
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOffers = useCallback(async (routeIdx) => {
    setLoading(true); setError(''); setOffers([]);
    const route = PRESET_ROUTES[routeIdx];
    const d = new Date(); d.setDate(d.getDate() + 14);
    const departure_date = d.toISOString().split('T')[0];
    try {
      const res  = await fetch(`${API_BASE}/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices: [{ origin: route.origin, destination: route.destination, departure_date }],
          passengers: [{ type: 'adult' }], cabin_class: 'economy',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur');
      setOffers(json.offers || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOffers(selectedRoute); }, [selectedRoute, fetchOffers]);

  const handleSaveOverride = (offerId, newPrice) => {
    setOverrides(prev => ({ ...prev, [offerId]: newPrice }));
    setEditOffer(null);
    showToast('✓ Prix mis à jour avec succès');
  };

  const getDisplayPrice = (offer) => overrides[offer.id] ?? parseFloat(offer.total_amount || 0);

  const totalOffers   = offers.length;
  const overrideCount = Object.keys(overrides).length;
  const avgPrice      = totalOffers
    ? (offers.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0) / totalOffers).toFixed(2)
    : 0;

  return (
    <AdminLayout
      title="Gestion des Prix des Vols"
      breadcrumb={[
        { label: 'Billeterie / Vols' },
        { label: 'Gestion des prix', active: true },
      ]}
      toast={toast}
    >
      {/* Modal */}
      {editOffer && (
        <PriceEditModal offer={editOffer} onSave={handleSaveOverride} onClose={() => setEditOffer(null)} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── KPI cards ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { label: 'Offres chargées', value: totalOffers,   color: '#0369a1', bg: '#f0f9ff' },
            { label: 'Prix modifiés',   value: overrideCount, color: '#d97706', bg: '#fff8e1' },
            { label: 'Prix moyen',      value: avgPrice ? `${parseFloat(avgPrice).toLocaleString('fr-FR')} TND` : '—', color: '#16a34a', bg: '#f0fdf4' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase',
                letterSpacing: '.06em', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12,
          padding: '12px 18px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"
            width="18" height="18" style={{ marginTop: 1, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <div style={{ fontSize: 13, color: '#1e40af' }}>
            Le <strong>prix original</strong> vient de l'API Duffel et ne change jamais.
            Le <strong>prix actuel</strong> est calculé avec +10% de marge automatiquement.
            Vous pouvez le remplacer manuellement via <strong>Modifier</strong> — le prix original reste utilisé pour la facturation Duffel.
          </div>
        </div>

        {/* ── Route selector ──────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px',
          border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginRight: 4 }}>
            Route :
          </span>
          {PRESET_ROUTES.map((r, i) => (
            <button key={i} onClick={() => setSelectedRoute(i)} disabled={loading}
              style={{ padding: '8px 16px', borderRadius: 20, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 12,
                background: selectedRoute === i ? 'var(--secondary,#e67e22)' : '#f1f5f9',
                color: selectedRoute === i ? '#fff' : '#475569',
                boxShadow: selectedRoute === i ? '0 2px 8px rgba(230,126,34,.3)' : 'none',
                opacity: loading && selectedRoute !== i ? 0.5 : 1 }}>
              ✈️ {r.label}
            </button>
          ))}
          <button onClick={() => fetchOffers(selectedRoute)} disabled={loading}
            style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 20,
              border: '1.5px solid #e2e8f0', background: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 12, fontWeight: 700, color: '#475569',
              display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              width="13" height="13" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Actualiser
          </button>
        </div>

        {/* ── Error ──────────────────────────────────────────── */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12,
            padding: '16px 20px', color: '#991b1b', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {/* ── Loading skeletons ───────────────────────────────── */}
        {loading && (
          <>
            <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height: 72, borderRadius: 10,
                  background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%)',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          </>
        )}

        {/* ── Table ──────────────────────────────────────────── */}
        {!loading && offers.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
              padding: '12px 20px', display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 140px',
              gap: 12, alignItems: 'center' }}>
              {['Vol / Compagnie', 'Prix original (API)', 'Marge auto', 'Prix actuel (TND)', 'Statut', 'Action'].map((h, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 800, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {offers.map((offer, idx) => {
              const s            = offer._summary || {};
              const originalAmt  = parseFloat(offer._original_amount || 0);
              const autoPrice    = parseFloat(offer.total_amount || 0);
              const displayPrice = getDisplayPrice(offer);
              const isOverridden = overrides[offer.id] !== undefined;
              const marginPct    = originalAmt > 0 ? (((autoPrice / originalAmt) - 1) * 100).toFixed(1) : '10.0';

              return (
                <div key={offer.id}
                  style={{ padding: '14px 20px', display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 140px',
                    gap: 12, alignItems: 'center',
                    borderBottom: idx < offers.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: isOverridden ? '#fffbeb' : '#fff',
                    transition: 'background .15s' }}
                  onMouseEnter={e => !isOverridden && (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = isOverridden ? '#fffbeb' : '#fff')}>

                  {/* Col 1 — flight */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {s.airline_logo ? (
                      <img src={s.airline_logo} alt={s.airline_name}
                        style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8,
                          border: '1px solid #f1f5f9', padding: 3, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f9ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8" width="16" height="16">
                          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2832' }}>
                        {s.origin_iata} → {s.destination_iata}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                        {s.airline_name} · {fmtTime(s.departing_at)}
                      </div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', marginTop: 1 }}>
                        {offer.id?.slice(0, 18)}…
                      </div>
                    </div>
                  </div>

                  {/* Col 2 — original */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2832' }}>
                      {fmtPrice(offer._original_amount, offer._original_currency || 'EUR')}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Source Duffel</div>
                  </div>

                  {/* Col 3 — margin */}
                  <div>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 6,
                      padding: '3px 8px', fontSize: 12, fontWeight: 700 }}>
                      +{marginPct}%
                    </span>
                  </div>

                  {/* Col 4 — current price */}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15,
                      color: isOverridden ? '#d97706' : '#0a2832' }}>
                      {fmtPrice(displayPrice, 'TND')}
                    </div>
                    {isOverridden
                      ? <div style={{ fontSize: 10, color: '#d97706', marginTop: 2, fontWeight: 600 }}>✏️ Personnalisé</div>
                      : <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Auto (+10%)</div>
                    }
                  </div>

                  {/* Col 5 — status */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                      borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: isOverridden ? '#fff8e1' : '#f0fdf4',
                      color:      isOverridden ? '#b45309' : '#16a34a',
                      border: `1px solid ${isOverridden ? '#fde68a' : '#bbf7d0'}`,
                    }}>
                      {isOverridden ? '✏️ Modifié' : '✓ Auto'}
                    </span>
                  </div>

                  {/* Col 6 — actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditOffer(offer)}
                      style={{ padding: '7px 12px', borderRadius: 8, border: 'none',
                        background: 'linear-gradient(135deg,var(--secondary,#e67e22),#d35400)',
                        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Modifier
                    </button>
                    {isOverridden && (
                      <button
                        onClick={() => {
                          setOverrides(prev => { const n = { ...prev }; delete n[offer.id]; return n; });
                          showToast('✓ Prix réinitialisé', 'success');
                        }}
                        title="Réinitialiser au prix automatique"
                        style={{ padding: '7px 10px', borderRadius: 8,
                          border: '1px solid #fca5a5', background: '#fef2f2',
                          color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                          <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0',
              padding: '12px 20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#64748b' }}>
              <div>
                <strong style={{ color: '#0a2832' }}>{offers.length}</strong> offres chargées ·{' '}
                <strong style={{ color: overrideCount > 0 ? '#d97706' : '#64748b' }}>{overrideCount}</strong> prix personnalisés
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                Modifications conservées pour cette session
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && offers.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center',
            border: '1px solid #e2e8f0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"
              width="48" height="48" style={{ display: 'block', margin: '0 auto 16px' }}>
              <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>Aucune offre disponible</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Essayez une autre route ou actualisez.</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
};

export default FlightPricingAdmin;