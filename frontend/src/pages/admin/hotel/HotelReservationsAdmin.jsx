import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { getHotelReservationsAdmin, updateHotelReservationStatus } from '../../../services/api';

const STATUS_MAP = {
  pending: { label: 'En attente', bg: '#fff7ed', color: '#c2410c' },
  confirmed: { label: 'Confirmee', bg: '#d1fae5', color: '#065f46' },
  completed: { label: 'Terminee', bg: '#e0fbfc', color: '#0e7490' },
  cancelled: { label: 'Annulee', bg: '#fee2e2', color: '#991b1b' },
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('fr-FR') : '—';

const HotelReservationsAdmin = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);

  const isMain = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main';
    } catch {
      return false;
    }
  })();

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadReservations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getHotelReservationsAdmin();
      setReservations(response.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load hotel reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
      const matchesQuery = !query
        || reservation.hotel_name?.toLowerCase().includes(query)
        || reservation.hotel_city?.toLowerCase().includes(query)
        || reservation.holder_email?.toLowerCase().includes(query)
        || reservation.holder_first_name?.toLowerCase().includes(query)
        || reservation.holder_last_name?.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [reservations, search, statusFilter]);

  const stats = {
    total: reservations.length,
    pending: reservations.filter((reservation) => reservation.status === 'pending').length,
    confirmed: reservations.filter((reservation) => reservation.status === 'confirmed').length,
    revenue: reservations
      .filter((reservation) => reservation.payment_status === 'paid')
      .reduce((sum, reservation) => sum + (Number(reservation.total_price) || 0), 0),
  };

  const handleStatusChange = async (reservation, nextStatus) => {
    if (nextStatus === 'cancelled' && !isMain) {
      notify("Seul l'administrateur principal peut annuler une reservation hotel.", 'error');
      return;
    }

    try {
      await updateHotelReservationStatus(reservation.id, nextStatus);
      notify('Statut mis a jour avec succes.');
      await loadReservations();
      if (selectedReservation?.id === reservation.id) {
        setSelectedReservation((current) => ({ ...current, status: nextStatus }));
      }
    } catch (updateError) {
      notify(updateError.message || 'Unable to update reservation status.', 'error');
    }
  };

  return (
    <AdminLayout
      title="Reservations Hotels"
      breadcrumb={[{ label: 'Hotels' }, { label: 'Reservations', active: true }]}
      toast={toast}
      actions={
        <button className="al-btn al-btn--ghost" onClick={loadReservations}>
          Actualiser
        </button>
      }
    >
      <div className="al-stats al-stats--4">
        {[
          { label: 'Reservations', value: stats.total, color: 'blue' },
          { label: 'En attente', value: stats.pending, color: 'orange' },
          { label: 'Confirmees', value: stats.confirmed, color: 'green' },
          { label: 'CA encaisse', value: `${Math.round(stats.revenue).toLocaleString('fr-FR')} USD`, color: 'violet' },
        ].map((stat) => (
          <div key={stat.label} className={`al-stat al-stat--${stat.color}`}>
            <div>
              <p className="al-stat__value">{stat.value}</p>
              <p className="al-stat__label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedReservation ? '1fr 360px' : '1fr', gap: 0 }}>
        <div className="al-card" style={{ marginBottom: 32 }}>
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="text" placeholder="Hotel, ville, client..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>

            <div className="al-filter-tabs">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button key={status} className={`al-filter-tab ${statusFilter === status ? 'active' : ''}`} onClick={() => setStatusFilter(status)}>
                  {status === 'all' ? 'Tous' : STATUS_MAP[status]?.label || status}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ margin: '0 24px 16px', padding: '14px 16px', borderRadius: 12, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner" /></div>
              <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement des reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">R</div>
              <p className="al-empty__title">Aucune reservation hotel</p>
              <p className="al-empty__sub">Les reservations apparaitront ici automatiquement.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Sejour</th>
                    <th>Client</th>
                    <th>Paiement</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="al-row" style={{ cursor: 'pointer' }} onClick={() => setSelectedReservation(reservation)}>
                      <td>
                        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>{reservation.hotel_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{reservation.hotel_city || reservation.hotel_location}</p>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(reservation.check_in)} → {formatDate(reservation.check_out)}</p>
                        <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{reservation.adults} adulte(s) · {reservation.rooms} chambre(s)</p>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{reservation.holder_first_name} {reservation.holder_last_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{reservation.holder_email}</p>
                      </td>
                      <td>
                        <span className={`al-badge-pill ${reservation.payment_method === 'online' ? 'b--blue' : 'b--orange'}`}>
                          {reservation.payment_method === 'online' ? 'En ligne' : 'Agence'}
                        </span>
                      </td>
                      <td>{Number(reservation.total_price || 0).toLocaleString('fr-FR')} {reservation.currency || 'USD'}</td>
                      <td>
                        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: STATUS_MAP[reservation.status]?.bg || '#f1f5f9', color: STATUS_MAP[reservation.status]?.color || '#475569' }}>
                          {STATUS_MAP[reservation.status]?.label || reservation.status}
                        </span>
                      </td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <select value={reservation.status} onChange={(event) => handleStatusChange(reservation, event.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--g200)', fontFamily: 'inherit', fontSize: 12 }}>
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmee</option>
                          <option value="completed">Terminee</option>
                          <option value="cancelled" disabled={!isMain}>Annulee</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="al-table-footer">
            <p className="al-count">{filteredReservations.length} reservation(s) affichee(s)</p>
          </div>
        </div>

        {selectedReservation && (
          <div style={{ margin: '0 32px 32px 0', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--g900)' }}>{selectedReservation.hotel_name}</p>
                <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 4 }}>#{selectedReservation.id}</p>
              </div>
              <button className="al-action-btn" onClick={() => setSelectedReservation(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Sejour</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>{selectedReservation.hotel_city || selectedReservation.hotel_location}</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>{formatDate(selectedReservation.check_in)} → {formatDate(selectedReservation.check_out)}</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>{selectedReservation.adults} adulte(s) · {selectedReservation.rooms} chambre(s)</p>
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Client</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>{selectedReservation.holder_first_name} {selectedReservation.holder_last_name}</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>{selectedReservation.holder_email}</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>{selectedReservation.holder_phone}</p>
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Paiement</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>Mode: {selectedReservation.payment_method === 'online' ? 'En ligne' : 'Agence'}</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>Statut paiement: {selectedReservation.payment_status}</p>
                <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8 }}>Total: {Number(selectedReservation.total_price || 0).toLocaleString('fr-FR')} {selectedReservation.currency || 'USD'}</p>
              </div>

              {selectedReservation.special_requests && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Demandes speciales</p>
                  <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.8, background: 'var(--g50)', borderRadius: 10, padding: '12px 14px' }}>
                    {selectedReservation.special_requests}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default HotelReservationsAdmin;
