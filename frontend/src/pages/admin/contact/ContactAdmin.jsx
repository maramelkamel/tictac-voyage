// src/pages/admin/contact/ContactAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API = 'http://localhost:5000/api/contact';

/* ── helpers ── */
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const STATUS_META = {
  nouveau:  { label: 'Nouveau',  dot: 'dot--orange', badge: 'b--orange' },
  lu:       { label: 'Lu',       dot: 'dot--teal',   badge: 'b--teal'   },
  repondu:  { label: 'Répondu',  dot: 'dot--green',  badge: 'b--green'  },
  archive:  { label: 'Archivé',  dot: 'dot--gray',   badge: 'b--gray'   },
};

const SUJET_META = {
  omra:        { label: 'Omra',         badge: 'b--violet'  },
  voyage:      { label: 'Voyage',       badge: 'b--blue'    },
  transport:   { label: 'Transport',    badge: 'b--teal'    },
  hotel:       { label: 'Hôtel',        badge: 'b--indigo'  },
  'sur-mesure':{ label: 'Sur Mesure',   badge: 'b--orange'  },
  autre:       { label: 'Autre',        badge: 'b--gray'    },
};

export default function ContactAdmin() {
  const [messages,   setMessages]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');   // statut
  const [sujetFilter,setSujetFilter]= useState('all');
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null);   // message ouvert dans panneau
  const [toast,      setToast]      = useState(null);
  const [noteEdit,   setNoteEdit]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  /* ── fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter     !== 'all') params.set('status', filter);
      if (sujetFilter !== 'all') params.set('sujet', sujetFilter);
      if (search)                params.set('search', search);
      const [rMsg, rStats] = await Promise.all([
        fetch(`${API}?${params}`).then(r => r.json()),
        fetch(`${API}/stats`).then(r => r.json()),
      ]);
      if (rMsg.success)   setMessages(rMsg.data);
      if (rStats.success) setStats(rStats.data);
    } catch {
      showToast('Impossible de charger les messages', 'error');
    } finally { setLoading(false); }
  }, [filter, sujetFilter, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── quand on ouvre un message → marquer lu ── */
  const openMessage = async (msg) => {
    setSelected(msg);
    setNoteEdit(msg.admin_notes || '');
    if (msg.status === 'nouveau') {
      await fetch(`${API}/${msg.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'lu' }),
      });
      fetchAll();
    }
  };

  /* ── changer statut ── */
  const changeStatus = async (id, status) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: noteEdit }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Statut mis à jour', 'success');
        setSelected(data.data);
        fetchAll();
      }
    } catch { showToast('Erreur lors de la mise à jour', 'error'); }
    finally   { setSaving(false); }
  };

  /* ── sauvegarder notes ── */
  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch(`${API}/${selected.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selected.status, admin_notes: noteEdit }),
      });
      showToast('Notes sauvegardées', 'success');
      fetchAll();
    } catch { showToast('Erreur', 'error'); }
    finally   { setSaving(false); }
  };

  /* ── supprimer ── */
  const doDelete = async (id) => {
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      showToast('Message supprimé', 'success');
      if (selected?.id === id) setSelected(null);
      setDelConfirm(null);
      fetchAll();
    } catch { showToast('Erreur lors de la suppression', 'error'); }
  };

  /* ── toast ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── stats cards ── */
  const statsCards = stats ? [
    { label: 'Total messages',  value: stats.total,    color: 'blue',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
    { label: 'Nouveaux',        value: stats.nouveaux, color: 'orange', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'Répondus',        value: stats.repondus, color: 'green',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: 'Archivés',        value: stats.archives, color: 'teal',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
  ] : [];

  const filtered = messages; // le backend filtre déjà

  return (
    <AdminLayout
      title="Messages Contact"
      breadcrumb={[{ label: 'Admin' }, { label: 'Contact', active: true }]}
      toast={toast}
    >
      {/* ── Stats ── */}
      <div className="al-stats al-stats--4">
        {statsCards.map((s, i) => (
          <div key={i} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">{s.icon}</div>
            <div>
              <div className="al-stat__value">{s.value ?? '—'}</div>
              <div className="al-stat__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Layout : liste + panneau ── */}
      <div style={{ margin: '0 32px 32px', display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20 }}>

        {/* ── Card liste ── */}
        <div className="al-card" style={{ margin: 0 }}>
          {/* Toolbar */}
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                placeholder="Rechercher nom, email, message…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="al-search__clear" onClick={() => setSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>

            {/* Filtre statut */}
            <div className="al-filter-tabs">
              {[
                { key: 'all',     label: 'Tous' },
                { key: 'nouveau', label: 'Nouveaux' },
                { key: 'lu',      label: 'Lus' },
                { key: 'repondu', label: 'Répondus' },
                { key: 'archive', label: 'Archivés' },
              ].map(f => (
                <button key={f.key} className={`al-filter-tab${filter === f.key ? ' active' : ''}`}
                  onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Filtre sujet */}
            <select
              className="al-input"
              style={{ width: 'auto', minWidth: 130 }}
              value={sujetFilter}
              onChange={e => setSujetFilter(e.target.value)}
            >
              <option value="all">Tous sujets</option>
              {Object.entries(SUJET_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--g400)' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Tableau */}
          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner"/></div>
              <span style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <p className="al-empty__title">Aucun message trouvé</p>
              <p className="al-empty__sub">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Expéditeur</th>
                    <th>Sujet</th>
                    <th>Message</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(msg => {
                    const sm = STATUS_META[msg.status] || STATUS_META.nouveau;
                    const sj = SUJET_META[msg.sujet]   || SUJET_META.autre;
                    const isNew = msg.status === 'nouveau';
                    return (
                      <tr
                        key={msg.id}
                        className={`al-row${selected?.id === msg.id ? ' al-row--selected' : ''}`}
                        onClick={() => openMessage(msg)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                            }}>
                              {msg.nom.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: isNew ? 700 : 500, color: 'var(--g900)', fontSize: 13 }}>
                                {msg.nom}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--g400)' }}>{msg.email}</div>
                              {msg.telephone && <div style={{ fontSize: 11, color: 'var(--g400)' }}>{msg.telephone}</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`al-badge-pill ${sj.badge}`}>{sj.label}</span>
                        </td>
                        <td style={{ maxWidth: 220 }}>
                          <div style={{
                            fontSize: 12, color: 'var(--g600)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            fontWeight: isNew ? 600 : 400,
                          }}>
                            {msg.message}
                          </div>
                        </td>
                        <td>
                          <span className={`al-badge-pill ${sm.badge}`}>
                            <span className={`al-dot ${sm.dot}`}/>
                            {sm.label}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--g400)', whiteSpace: 'nowrap' }}>
                          {fmtDate(msg.created_at)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="al-action-btn al-action-btn--delete"
                              title="Supprimer"
                              onClick={e => { e.stopPropagation(); setDelConfirm(msg); }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="al-table-footer">
                <p className="al-count">{filtered.length} message{filtered.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </div>

        {/* ══ PANNEAU DÉTAIL ══ */}
        {selected && (
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid var(--g200)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 700,
          }}>
            {/* Header panneau */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--g100)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--g50)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                }}>
                  {selected.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--g900)' }}>{selected.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--g400)' }}>
                    {(() => { const sj = SUJET_META[selected.sujet]; return sj?.label || selected.sujet; })()}
                  </div>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--g400)', padding: 6 }}
                onClick={() => setSelected(null)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Corps panneau */}
            <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Coordonnées */}
              <div style={{ background: 'var(--g50)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '📧', label: 'Email',     val: selected.email },
                  { icon: '📞', label: 'Téléphone', val: selected.telephone || '—' },
                  { icon: '🕐', label: 'Reçu le',   val: fmtDate(selected.created_at) },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                    <span>{r.icon}</span>
                    <span style={{ color: 'var(--g400)', minWidth: 80 }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--g800)', wordBreak: 'break-all' }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Message */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  Message
                </div>
                <div style={{
                  background: 'var(--g50)', borderRadius: 10, padding: 14,
                  fontSize: 13, color: 'var(--g700)', lineHeight: 1.75,
                  whiteSpace: 'pre-wrap', border: '1px solid var(--g200)',
                }}>
                  {selected.message}
                </div>
              </div>

              {/* Changer statut */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  Changer le statut
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <button
                      key={key}
                      disabled={saving || selected.status === key}
                      onClick={() => changeStatus(selected.id, key)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: selected.status === key ? 'default' : 'pointer',
                        border: selected.status === key ? '2px solid var(--primary)' : '1.5px solid var(--g200)',
                        background: selected.status === key ? 'var(--primary)' : '#fff',
                        color: selected.status === key ? '#fff' : 'var(--g600)',
                        transition: 'all .2s',
                        opacity: saving ? .6 : 1,
                      }}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes admin */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  Notes internes
                </div>
                <textarea
                  className="al-textarea"
                  rows={3}
                  placeholder="Ajouter une note interne…"
                  value={noteEdit}
                  onChange={e => setNoteEdit(e.target.value)}
                  style={{ fontSize: 13 }}
                />
                <button
                  className="al-btn al-btn--primary"
                  style={{ marginTop: 8, width: '100%', fontSize: 12 }}
                  onClick={saveNotes}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde…' : 'Sauvegarder les notes'}
                </button>
              </div>

              {/* Actions rapides */}
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: votre message - Tictac Voyages`}
                  className="al-btn al-btn--primary"
                  style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: 12 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                  Répondre par email
                </a>
                <button
                  className="al-btn al-btn--danger"
                  style={{ fontSize: 12 }}
                  onClick={() => setDelConfirm(selected)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL CONFIRMATION SUPPRESSION ══ */}
      {delConfirm && (
        <div className="al-overlay" onClick={() => setDelConfirm(null)}>
          <div className="al-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="al-modal__header">
              <div className="al-modal__title-wrap">
                <div className="al-modal__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </div>
                <h2>Supprimer le message</h2>
              </div>
              <button className="al-modal__close" onClick={() => setDelConfirm(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px 26px 26px' }}>
              <p style={{ fontSize: 14, color: 'var(--g600)', marginBottom: 20 }}>
                Voulez-vous supprimer définitivement le message de{' '}
                <strong>{delConfirm.nom}</strong> ? Cette action est irréversible.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="al-btn al-btn--ghost" onClick={() => setDelConfirm(null)}>Annuler</button>
                <button className="al-btn al-btn--danger" onClick={() => doDelete(delConfirm.id)}>
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}