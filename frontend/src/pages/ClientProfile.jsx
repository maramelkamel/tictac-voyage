// src/pages/ClientProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = 'http://localhost:5000/api';

// ── Loyalty helpers ───────────────────────────────────────────────
const getLoyaltyInfo = (total) => {
  if (total === 0)  return { level: 0, label: 'Nouveau client',  color: '#64748b', bg: '#f1f5f9', icon: '🌱', next: 1,  nextLabel: '1 réservation pour Niveau 1' };
  if (total === 1)  return { level: 1, label: 'Niveau 1 ⭐',     color: '#0e7490', bg: '#e0fbfc', icon: '⭐', next: 2,  nextLabel: '1 réservation pour Niveau 2' };
  if (total <= 3)   return { level: 2, label: 'Niveau 2 ⭐⭐',   color: '#c2410c', bg: '#fff7ed', icon: '⭐⭐', next: 4, nextLabel: `${4 - total} réservation(s) pour Niveau 3` };
  return                   { level: 3, label: 'Niveau 3 ⭐⭐⭐', color: '#7c3aed', bg: '#f5f3ff', icon: '⭐⭐⭐', next: null, nextLabel: 'Niveau maximum atteint ! 🎉' };
};

const getNextDiscount = (total) => {
  // Every 5: 10% on 6th
  // Every 10: 20%
  // After 10, every 3: 5%
  if (total < 5)  return { at: 5,  pct: 10, remaining: 5  - total };
  if (total < 10) return { at: 10, pct: 20, remaining: 10 - total };
  const nextMult3 = Math.ceil((total + 1) / 3) * 3;
  return { at: nextMult3, pct: 5, remaining: nextMult3 - total };
};

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

// ── Status badge ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   { label: 'En attente', bg: '#fff7ed', color: '#c2410c' },
    confirmed: { label: 'Confirmé',   bg: '#d1fae5', color: '#065f46' },
    completed: { label: 'Terminé',    bg: '#e0fbfc', color: '#0e7490' },
    cancelled: { label: 'Annulé',     bg: '#fee2e2', color: '#991b1b' },
    lu:        { label: 'Lu',         bg: '#eff6ff', color: '#1d4ed8' },
    repondu:   { label: 'Répondu',    bg: '#d1fae5', color: '#065f46' },
    nouveau:   { label: 'Nouveau',    bg: '#fff7ed', color: '#c2410c' },
    archive:   { label: 'Archivé',    bg: '#f1f5f9', color: '#64748b' },
  };
  const m = map[status] || { label: status, bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
};

// ── Tab button ────────────────────────────────────────────────────
const Tab = ({ id, label, icon, active, onClick, count }) => (
  <button onClick={() => onClick(id)}
    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', border: 'none', fontFamily: 'inherit', borderRadius: '10px 10px 0 0', background: active ? '#fff' : 'transparent', color: active ? '#0F4C5C' : '#64748b', fontWeight: active ? 700 : 500, fontSize: 14, cursor: 'pointer', borderBottom: active ? '2px solid #0F4C5C' : '2px solid transparent', marginBottom: -2, transition: 'all .2s' }}>
    <i className={icon} style={{ fontSize: 13 }} />
    {label}
    {count !== undefined && count > 0 && (
      <span style={{ background: active ? '#0F4C5C' : '#e2e8f0', color: active ? '#fff' : '#64748b', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999 }}>{count}</span>
    )}
  </button>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const ClientProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [client,       setClient]       = useState(null);
  const [activeTab,    setActiveTab]    = useState(searchParams.get('tab') || 'profil');
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);

  // Data
  const [omraRes,      setOmraRes]      = useState([]);
  const [transRes,     setTransRes]     = useState([]);
  const [customRes,    setCustomRes]    = useState([]);
  const [messages,     setMessages]     = useState([]);
  const [favorites,    setFavorites]    = useState([]);

  // Edit profile form
  const [editMode,     setEditMode]     = useState(false);
  const [editForm,     setEditForm]     = useState({});
  const [saving,       setSaving]       = useState(false);

  const token = localStorage.getItem('token');

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Auth check ────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored || !token) { navigate('/SignIn'); return; }
    const c = JSON.parse(stored);
    setClient(c);
    setEditForm({
      first_name:         c.firstName  || c.first_name  || '',
      last_name:          c.lastName   || c.last_name   || '',
      phone:              c.phone      || '',
      city:               c.city       || '',
      marital_status:     c.marital_status || '',
      number_of_children: c.number_of_children ?? '',
    });
    fetchAll(c.email);
  }, []);

  const fetchAll = async (email) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [omra, trans, custom, msgs, favs] = await Promise.all([
        fetch(`${API}/omra/reservations`, { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/requests`,          { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/custom-trips`,      { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/contact`,           { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/favorites`,         { headers }).then(r => r.json()).catch(() => ({})),
      ]);

      const e = email?.toLowerCase();
      setOmraRes(  (omra.data   || []).filter(r => r.email?.toLowerCase() === e));
      setTransRes( (trans.data  || []).filter(r => r.email?.toLowerCase() === e));
      setCustomRes((custom.data || []).filter(r => r.email?.toLowerCase() === e));
      setMessages( (msgs.data   || []).filter(r => r.email?.toLowerCase() === e));
      setFavorites(favs.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ── Save profile ──────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/clients/${client.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        const updated = { ...client, ...editForm, firstName: editForm.first_name, lastName: editForm.last_name };
        localStorage.setItem('client', JSON.stringify(updated));
        setClient(updated);
        setEditMode(false);
        notify('Profil mis à jour ✅');
      } else notify(json.message || 'Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
    finally   { setSaving(false); }
  };

  // ── Computed stats ────────────────────────────────────────────
  const allReservations = [...omraRes, ...transRes, ...customRes];
  const totalRes        = allReservations.length;
  const loyalty         = getLoyaltyInfo(totalRes);
  const nextDiscount    = getNextDiscount(totalRes);
  const progressPct     = loyalty.next
    ? Math.min(100, Math.round((totalRes / loyalty.next) * 100))
    : 100;

  if (!client) return null;

  const firstName = client.firstName || client.first_name || '';
  const lastName  = client.lastName  || client.last_name  || '';
  const initials  = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  return (
    <>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 16px 48px rgba(0,0,0,.15)', background: toast.type === 'success' ? '#10b981' : '#e92f64', color: '#fff', animation: 'fadeIn .3s ease' }}>
          <i className={toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'} />
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: 120, minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>

          {/* ── Profile Header ── */}
          <div style={{ background: 'linear-gradient(135deg, #0F4C5C 0%, #1a6b80 55%, #1ECAD3 100%)', borderRadius: 20, padding: '32px 36px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', boxShadow: '0 8px 32px rgba(15,76,92,.28)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Avatar */}
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {initials || <i className="fas fa-user" />}
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{firstName} {lastName}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>{client.email}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: loyalty.bg, color: loyalty.color, fontSize: 12, fontWeight: 700 }}>
                  {loyalty.icon} {loyalty.label}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Réservations', value: totalRes },
                { label: 'Omra',         value: omraRes.length },
                { label: 'Transport',    value: transRes.length },
                { label: 'Sur Mesure',   value: customRes.length },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 20px', textAlign: 'center', minWidth: 80 }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e2e8f0', marginBottom: 24, flexWrap: 'wrap' }}>
            <Tab id="profil"       label="Mon Profil"       icon="fas fa-user-circle"  active={activeTab==='profil'}       onClick={handleTabChange} />
            <Tab id="reservations" label="Réservations"     icon="fas fa-suitcase"     active={activeTab==='reservations'} onClick={handleTabChange} count={totalRes} />
            <Tab id="messages"     label="Messages"         icon="fas fa-envelope"     active={activeTab==='messages'}     onClick={handleTabChange} count={messages.length} />
            <Tab id="favoris"      label="Favoris"          icon="fas fa-heart"        active={activeTab==='favoris'}      onClick={handleTabChange} count={favorites.length} />
            <Tab id="fidelite"     label="Fidélité"         icon="fas fa-crown"        active={activeTab==='fidelite'}     onClick={handleTabChange} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: '#0F4C5C', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement...</p>
            </div>
          ) : (
            <>

              {/* ═══ TAB: PROFIL ═══ */}
              {activeTab === 'profil' && (
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,.04)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Informations personnelles</h2>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#0F4C5C', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <i className="fas fa-pen" style={{ fontSize: 11 }} /> Modifier
                      </button>
                    )}
                  </div>

                  <div style={{ padding: '24px 28px' }}>
                    {editMode ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        {[
                          { key: 'first_name',         label: 'Prénom',             type: 'text'   },
                          { key: 'last_name',          label: 'Nom',                type: 'text'   },
                          { key: 'phone',              label: 'Téléphone',          type: 'tel'    },
                          { key: 'city',               label: 'Ville',              type: 'text'   },
                          { key: 'number_of_children', label: "Nombre d'enfants",   type: 'number' },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{f.label}</label>
                            <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                              onFocus={e => e.target.style.borderColor = '#1ECAD3'}
                              onBlur={e  => e.target.style.borderColor = '#e2e8f0'} />
                          </div>
                        ))}
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Situation matrimoniale</label>
                          <select value={editForm.marital_status || ''} onChange={e => setEditForm(p => ({ ...p, marital_status: e.target.value }))}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }}>
                            <option value="">—</option>
                            <option value="celibataire">Célibataire</option>
                            <option value="marie">Marié(e)</option>
                            <option value="divorce">Divorcé(e)</option>
                            <option value="veuf">Veuf / Veuve</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                          <button onClick={() => setEditMode(false)}
                            style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Annuler
                          </button>
                          <button onClick={handleSaveProfile} disabled={saving}
                            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#0F4C5C,#1a6b80)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {saving ? 'Enregistrement...' : '✅ Sauvegarder'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {[
                          { label: 'Prénom',             value: firstName },
                          { label: 'Nom',                value: lastName },
                          { label: 'Email',              value: client.email },
                          { label: 'Téléphone',          value: client.phone || '—' },
                          { label: 'Ville',              value: client.city  || '—' },
                          { label: 'Situation',          value: client.marital_status || '—' },
                          { label: "Nombre d'enfants",   value: client.number_of_children ?? '—' },
                          { label: 'Membre depuis',      value: fDate(client.created_at) },
                        ].map(item => (
                          <div key={item.label}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{item.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ TAB: RÉSERVATIONS ═══ */}
              {activeTab === 'reservations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {allReservations.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '60px 24px', textAlign: 'center' }}>
                      <i className="fas fa-suitcase" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16, display: 'block' }} />
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Aucune réservation pour l'instant</p>
                      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Explorez nos forfaits et faites votre première réservation !</p>
                      <button onClick={() => navigate('/Omra/Omra')}
                        style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Voir les forfaits Omra
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Omra */}
                      {omraRes.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            🕌 Omra ({omraRes.length})
                          </h3>
                          {omraRes.map(r => (
                            <div key={r.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 22px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>
                                  Forfait Omra {r.package_id ? `#${r.package_id}` : ''}
                                </p>
                                <p style={{ fontSize: 12, color: '#64748b' }}>
                                  {r.number_of_persons} pers. · Chambre {r.chambre_type} · {r.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence'}
                                </p>
                                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Réservé le {fDate(r.created_at)}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {r.total_price && <span style={{ fontWeight: 800, fontSize: 16, color: '#0F4C5C' }}>{Number(r.total_price).toLocaleString('fr-TN')} TND</span>}
                                <StatusBadge status={r.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Transport */}
                      {transRes.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0e7490', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                            🚌 Transport ({transRes.length})
                          </h3>
                          {transRes.map(r => (
                            <div key={r.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 22px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>
                                  {r.departure_location || '—'} → {r.arrival_location || '—'}
                                </p>
                                <p style={{ fontSize: 12, color: '#64748b' }}>
                                  {r.vehicle_type} · {r.passengers} pers. · {fDate(r.departure_date)}
                                </p>
                              </div>
                              <StatusBadge status={r.status} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sur Mesure */}
                      {customRes.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                            ✈️ Voyages sur Mesure ({customRes.length})
                          </h3>
                          {customRes.map(r => (
                            <div key={r.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 22px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>
                                  {r.destination || '—'}
                                </p>
                                <p style={{ fontSize: 12, color: '#64748b' }}>
                                  {fDate(r.departure_date)} → {fDate(r.return_date)} · {r.number_of_persons} pers.
                                </p>
                              </div>
                              <StatusBadge status={r.status} />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ═══ TAB: MESSAGES ═══ */}
              {activeTab === 'messages' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '60px 24px', textAlign: 'center' }}>
                      <i className="fas fa-envelope-open" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16, display: 'block' }} />
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>Aucun message envoyé</p>
                      <button onClick={() => navigate('/Contact')} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Nous contacter
                      </button>
                    </div>
                  ) : messages.map(msg => (
                    <div key={msg.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                            {msg.sujet}
                          </span>
                          <StatusBadge status={msg.status} />
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{fDate(msg.created_at)}</span>
                      </div>
                      {/* Client message */}
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 12, marginBottom: msg.admin_notes ? 16 : 0 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div style={{ background: '#f8fafc', borderRadius: '0 12px 12px 12px', padding: '10px 14px', flex: 1 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>Vous</p>
                            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{msg.message}</p>
                          </div>
                        </div>

                        {/* Admin response */}
                        {msg.admin_notes && (
                          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexDirection: 'row-reverse' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#e92f64,#f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0 }}>
                              <i className="fas fa-headset" />
                            </div>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px 0 12px 12px', padding: '10px 14px', flex: 1 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>Réponse de Tictac Voyages</p>
                              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{msg.admin_notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══ TAB: FAVORIS ═══ */}
              {activeTab === 'favoris' && (
                <div>
                  {favorites.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '60px 24px', textAlign: 'center' }}>
                      <i className="fas fa-heart" style={{ fontSize: 48, color: '#fca5a5', marginBottom: 16, display: 'block' }} />
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Aucun favori pour l'instant</p>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>Cliquez sur le ❤️ dans les cartes pour sauvegarder vos préférés</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                      {favorites.map(fav => {
                        const data = fav.item_data || {};
                        return (
                          <div key={fav.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.04)', transition: 'transform .2s', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            {data.image && <img src={data.image} alt={data.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
                            <div style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: fav.item_type === 'omra' ? '#f5f3ff' : '#e0fbfc', color: fav.item_type === 'omra' ? '#7c3aed' : '#0e7490', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                  {fav.item_type === 'omra' ? '🕌 Omra' : fav.item_type === 'hotel' ? '🏨 Hôtel' : fav.item_type === 'voyage' ? '✈️ Voyage' : '🗺️ Circuit'}
                                </span>
                                <i className="fas fa-heart" style={{ color: '#e92f64', fontSize: 14 }} />
                              </div>
                              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{data.title || '—'}</p>
                              {data.price && <p style={{ fontSize: 13, fontWeight: 700, color: '#0F4C5C' }}>{Number(data.price).toLocaleString('fr-TN')} TND</p>}
                              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Ajouté le {fDate(fav.created_at)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ TAB: FIDÉLITÉ ═══ */}
              {activeTab === 'fidelite' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Current level card */}
                  <div style={{ background: `linear-gradient(135deg, ${loyalty.color}, ${loyalty.color}cc)`, borderRadius: 16, padding: '28px 32px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 13, opacity: .75, marginBottom: 6, fontWeight: 600 }}>Votre niveau actuel</p>
                      <p style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{loyalty.icon} {loyalty.label}</p>
                      <p style={{ fontSize: 13, opacity: .85 }}>{totalRes} réservation{totalRes !== 1 ? 's' : ''} au total</p>
                    </div>
                    {loyalty.next && (
                      <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '16px 24px', minWidth: 200 }}>
                        <p style={{ fontSize: 12, opacity: .85, marginBottom: 8 }}>Progression vers le niveau suivant</p>
                        <div style={{ height: 8, background: 'rgba(255,255,255,.25)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
                          <div style={{ height: '100%', width: `${progressPct}%`, background: '#fff', borderRadius: 999, transition: 'width .5s ease' }} />
                        </div>
                        <p style={{ fontSize: 12, opacity: .85 }}>{loyalty.nextLabel}</p>
                      </div>
                    )}
                  </div>

                  {/* Next discount */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#D4A017,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-tag" style={{ color: '#fff', fontSize: 20 }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                        Prochaine réduction : <span style={{ color: '#D4A017' }}>{nextDiscount.pct}%</span>
                      </p>
                      <p style={{ fontSize: 13, color: '#64748b' }}>
                        Plus que <strong>{nextDiscount.remaining}</strong> réservation{nextDiscount.remaining > 1 ? 's' : ''} pour débloquer votre réduction à la réservation n°{nextDiscount.at}
                      </p>
                    </div>
                  </div>

                  {/* Rules */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>📋 Règles du programme de fidélité</h3>
                    </div>
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[
                        { icon: '🌱', level: 'Nouveau client',  rule: '0 réservation — Bienvenue chez Tictac Voyages !' },
                        { icon: '⭐', level: 'Niveau 1',        rule: '1 réservation confirmée' },
                        { icon: '⭐⭐', level: 'Niveau 2',      rule: '2 à 3 réservations confirmées' },
                        { icon: '⭐⭐⭐', level: 'Niveau 3',    rule: '4 réservations confirmées et plus' },
                      ].map(item => (
                        <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: loyalty.label.includes(item.level.replace('Niveau ', 'Niveau ')) || (item.level === 'Nouveau client' && loyalty.level === 0) ? '#f0fdf4' : '#f8fafc', border: `1px solid ${loyalty.label.includes(item.level) || (item.level === 'Nouveau client' && loyalty.level === 0) ? '#bbf7d0' : '#f1f5f9'}` }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{item.level}</p>
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.rule}</p>
                          </div>
                        </div>
                      ))}

                      <div style={{ marginTop: 8, padding: '16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fed7aa' }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e', marginBottom: 10 }}>🎁 Réductions automatiques</p>
                        {[
                          { at: '5ème réservation',   pct: '10%', desc: 'Réduction de 10% sur la 6ème réservation' },
                          { at: '10ème réservation',  pct: '20%', desc: 'Réduction de 20% sur la 11ème réservation' },
                          { at: 'Toutes les 3 ensuite', pct: '5%', desc: 'Réduction de 5% toutes les 3 réservations après la 10ème' },
                        ].map(r => (
                          <div key={r.at} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1.5px solid #fed7aa', fontWeight: 800, fontSize: 13, color: '#d97706', flexShrink: 0 }}>
                              {r.pct}
                            </span>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 12, color: '#92400e' }}>{r.at}</p>
                              <p style={{ fontSize: 11, color: '#b45309' }}>{r.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </>
  );
};

export default ClientProfile;