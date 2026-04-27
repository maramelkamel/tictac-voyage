import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/HotelsPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const nightsBetween = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da) || isNaN(db)) return 0;
  const diff = Math.ceil((db - da) / 86400000);
  return Math.max(0, diff);
};

const HotelReserve = () => {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const client = (() => { try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; } })();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState(() => ({
    check_in: '',
    check_out: '',
    adults: 2,
    children: 0,
    rooms: 1,
    pension: sp.get('pension') || 'LPD',
    first_name: client?.first_name || client?.firstName || '',
    last_name: client?.last_name || client?.lastName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    payment_method: 'agency',
  }));

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
  const selected = useMemo(() => priceOptions.find((p) => p.label === form.pension) || priceOptions[0] || null, [priceOptions, form.pension]);
  const nights = useMemo(() => nightsBetween(form.check_in, form.check_out), [form.check_in, form.check_out]);
  const unit = Number(selected?.value || 0);
  const total = useMemo(() => unit * nights * Number(form.rooms || 1), [unit, nights, form.rooms]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!hotel) return;
    if (!form.check_in || !form.check_out) return setError('Dates requises.');
    if (nights <= 0) return setError('La date de sortie doit être après la date d’entrée.');
    if (!form.first_name || !form.last_name || !form.email) return setError('Nom et email requis.');

    setSaving(true);
    try {
      const res = await fetch(`${API}/hotels/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          destination_code: (hotel.city || '').slice(0, 3).toUpperCase(),
          pension_code: selected?.label || form.pension,
          pension_price: unit,
          check_in: form.check_in,
          check_out: form.check_out,
          adults: Number(form.adults) || 2,
          children: Number(form.children) || 0,
          rooms: Number(form.rooms) || 1,
          rooms_pax: [],
          holder_first_name: form.first_name,
          holder_last_name: form.last_name,
          holder_email: form.email,
          holder_phone: form.phone,
          total_price: total,
          currency: 'TND',
          payment_method: form.payment_method,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Erreur');
      setSuccess('Réservation envoyée ✅ Un conseiller vous contactera.');
      setTimeout(() => navigate('/mon-compte'), 1200);
    } catch (e2) {
      setError(e2.message || 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="hotels-page">
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

  if (!hotel) {
    return (
      <div className="hotels-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0a2832' }}>{error || 'Hôtel introuvable'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/hotels')} style={{ marginTop: 16 }}>Retour</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="hotels-page">
      <Navbar />

      <section className="hotels-hero">
        <div className="container">
          <div className="hotels-hero__content">
            <span className="hotels-hero__eyebrow">Réservation</span>
            <h1>{hotel.name}</h1>
            <p>{hotel.city}{hotel.address ? ` · ${hotel.address}` : ''}</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '34px 0 70px' }}>
        <div className="container hotels-detail-layout">
          <div className="hotels-detail-card">
            <h2>Vos informations</h2>

            {error && <div className="hotels-inline-error" style={{ marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: 14, marginBottom: 16 }}>{success}</div>}

            <form className="hotels-payment-form" onSubmit={submit}>
              <div className="hotels-search__grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div className="hotels-search__field">
                  <label>Prénom</label>
                  <input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
                </div>
                <div className="hotels-search__field">
                  <label>Nom</label>
                  <input value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
                </div>
                <div className="hotels-search__field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div className="hotels-search__field">
                  <label>Téléphone</label>
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
              </div>

              <div className="hotels-search__grid">
                <div className="hotels-search__field">
                  <label>Entrée</label>
                  <input type="date" value={form.check_in} onChange={(e) => set('check_in', e.target.value)} />
                </div>
                <div className="hotels-search__field">
                  <label>Sortie</label>
                  <input type="date" value={form.check_out} onChange={(e) => set('check_out', e.target.value)} />
                </div>
                <div className="hotels-search__field">
                  <label>Pension</label>
                  <select value={form.pension} onChange={(e) => set('pension', e.target.value)}>
                    {priceOptions.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="hotels-search__grid">
                <div className="hotels-search__field">
                  <label>Adultes</label>
                  <input type="number" min="1" value={form.adults} onChange={(e) => set('adults', e.target.value)} />
                </div>
                <div className="hotels-search__field">
                  <label>Enfants</label>
                  <input type="number" min="0" value={form.children} onChange={(e) => set('children', e.target.value)} />
                </div>
                <div className="hotels-search__field">
                  <label>Chambres</label>
                  <input type="number" min="1" value={form.rooms} onChange={(e) => set('rooms', e.target.value)} />
                </div>
              </div>

              <button className="btn btn-primary btn-lg" type="submit" disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Envoi…' : 'Confirmer la demande'}
              </button>
            </form>
          </div>

          <aside className="hotels-sidebar">
            <div className="hotels-sidebar__card">
              <div className="hotels-sidebar__label">Résumé</div>
              <div className="hotels-sidebar__rows">
                <div><span>Pension</span><strong>{selected?.label || form.pension}</strong></div>
                <div><span>Prix / nuit</span><strong>{unit.toLocaleString('fr-FR')} TND</strong></div>
                <div><span>Nuits</span><strong>{nights}</strong></div>
                <div><span>Chambres</span><strong>{form.rooms}</strong></div>
              </div>
              <div className="hotels-sidebar__total">
                <span>Total</span>
                <strong>{total.toLocaleString('fr-FR')} TND</strong>
              </div>
              <div className="hotels-sidebar__meta">Paiement: agence (par défaut)</div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HotelReserve;

