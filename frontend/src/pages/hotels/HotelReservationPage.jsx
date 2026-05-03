import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

// ─── Meal plan multipliers (must match HotelCard.jsx) ─────────
const PLAN_MULTIPLIERS = {
  'Room Only':       1.00,
  'Bed & Breakfast': 1.12,
  'Half Board':      1.25,
  'Full Board':      1.38,
  'All Inclusive':   1.55,
};

const BED_OPTIONS = ['King Bed', 'Twin Beds', 'Double Bed', 'Family Setup'];

const toDateValue = (v, fallback) => v || fallback;

const getNights = (checkIn, checkOut) => {
  const diff = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
};

// ─── Section header component ────────────────────────────────
const FormSection = ({ icon, title, description, children }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, paddingBottom: 14, borderBottom: '2px solid var(--gray-100)' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 15, flexShrink: 0,
      }}>
        <i className={icon} />
      </div>
      <div>
        <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--gray-800)' }}>{title}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const HotelReservationPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const hotel     = state?.hotel;
  const inSearch  = state?.search || {};

  const clientData = (() => {
    try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; }
  })();

  const today       = new Date().toISOString().split('T')[0];
  const tomorrow    = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const roomTypeOpts  = hotel?.room_types?.length  ? hotel.room_types  : ['Standard Room', 'Superior Room', 'Deluxe Room'];
  const mealPlanOpts  = hotel?.meal_plans?.length   ? hotel.meal_plans  : Object.keys(PLAN_MULTIPLIERS);
  const roomViewOpts  = hotel?.room_views?.length   ? hotel.room_views  : ['Standard View'];
  const extrasOpts    = hotel?.reservation_extras?.length ? hotel.reservation_extras : [];

  const [form, setForm] = useState({
    // Guest
    holder_first_name: clientData?.firstName || clientData?.first_name || '',
    holder_last_name:  clientData?.lastName  || clientData?.last_name  || '',
    holder_email:      clientData?.email || '',
    holder_phone:      clientData?.phone || '',
    // Stay
    check_in:  toDateValue(inSearch.checkin,  today),
    check_out: toDateValue(inSearch.checkout, tomorrow),
    adults:    inSearch.adults || '2',
    children:  '0',
    rooms:     inSearch.rooms  || '1',
    // Room
    room_type:      roomTypeOpts[0]  || '',
    meal_plan:      mealPlanOpts[0]  || '',
    room_view:      roomViewOpts[0]  || '',
    bed_preference: BED_OPTIONS[0],
    arrival_time:   hotel?.checkin_time || '14:00',
    // Extras
    airport_transfer: false,
    selected_extras:  [],
    special_requests: '',
  });

  const [loading, setLoading] = useState(false);

  const clientEmail = clientData?.email || '';
  const lockedStyle = { background: '#f8fafc', cursor: 'not-allowed', color: '#64748b', borderColor: '#e2e8f0' };

  const nights      = useMemo(() => getNights(form.check_in, form.check_out), [form.check_in, form.check_out]);
  const multiplier  = PLAN_MULTIPLIERS[form.meal_plan] || 1;
  const nightPrice  = Math.round(Number(hotel?.base_price || 0) * multiplier);
  const totalPrix   = nightPrice * Number(form.rooms || 1) * nights;

  if (!hotel) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>:-/</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>Hotel not found.</p>
          <button className="omra-reserve__submit" style={{ width: 'auto', padding: '14px 28px' }} onClick={() => navigate('/hotels')}>
            Back to Hotels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleExtraToggle = extra =>
    setForm(f => ({
      ...f,
      selected_extras: f.selected_extras.includes(extra)
        ? f.selected_extras.filter(x => x !== extra)
        : [...f.selected_extras, extra],
    }));

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/hotels/payment', { state: { hotel, reservation: form, totalPrix } });
    }, 450);
  };

  return (
    <div>
      <Navbar />

      <div className="omra-reserve">
        <div className="container">
          {/* Breadcrumb */}
          <div className="omra-page-breadcrumb omra-page-breadcrumb--light" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/hotels')}>Hotels</button>
            <span>/</span>
            <button onClick={() => navigate(-1)}>{hotel.city}</button>
            <span>/</span>
            <span>Reservation</span>
          </div>

          {clientEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#e0fbfc', border: '1px solid #a5f3fc', borderRadius: 12, marginBottom: 20 }}>
              <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
              <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                Signed in as <strong>{clientEmail}</strong> — your details have been pre-filled.
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">
            {/* ── Left: form ──────────────────────────────── */}
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <div className="omra-reserve__form-header-title">Hotel Reservation Form</div>
                  <div className="omra-reserve__form-header-desc">
                    Complete all sections below, then proceed to payment.
                  </div>
                  {/* Progress hint */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {['Guest Info', 'Stay Details', 'Room Preferences', 'Extras'].map((step, i) => (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, color: '#fff',
                        }}>{i + 1}</div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{step}</span>
                        {i < 3 && <i className="fas fa-chevron-right" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }} />}
                      </div>
                    ))}
                  </div>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>

                  {/* ── 1. Guest Information ──────────────── */}
                  <FormSection icon="fas fa-user" title="Guest Information" description="Lead guest details for the reservation">
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_first_name">First Name *</label>
                        <input id="holder_first_name" name="holder_first_name" type="text" required
                          value={form.holder_first_name} onChange={handleChange} placeholder="e.g. Miniar" />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_last_name">Last Name *</label>
                        <input id="holder_last_name" name="holder_last_name" type="text" required
                          value={form.holder_last_name} onChange={handleChange} placeholder="e.g. Nmiri" />
                      </div>
                    </div>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_email">Email Address *</label>
                        <input id="holder_email" name="holder_email" type="email" required
                          value={form.holder_email}
                          onChange={e => !clientEmail && handleChange(e)}
                          readOnly={!!clientEmail}
                          style={clientEmail ? lockedStyle : {}}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_phone">Phone Number *</label>
                        <input id="holder_phone" name="holder_phone" type="tel" required
                          value={form.holder_phone} onChange={handleChange} placeholder="+216 XX XXX XXX" />
                      </div>
                    </div>
                  </FormSection>

                  {/* ── 2. Stay Details ────────────────────── */}
                  <FormSection icon="fas fa-calendar-alt" title="Stay Details" description="Check-in / check-out dates and number of guests">
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="check_in">Check-in Date</label>
                        <input id="check_in" name="check_in" type="date"
                          value={form.check_in} min={today} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="check_out">Check-out Date</label>
                        <input id="check_out" name="check_out" type="date"
                          value={form.check_out} min={form.check_in || today} onChange={handleChange} />
                      </div>
                    </div>
                    {/* Night counter badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(30,202,211,0.08)', borderRadius: 10, marginBottom: 16, border: '1px solid rgba(30,202,211,0.2)' }}>
                      <i className="fas fa-moon" style={{ color: 'var(--secondary)', fontSize: 13 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                        {nights} night{nights !== 1 ? 's' : ''} selected
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 4 }}>
                        · {new Date(form.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' → '}
                        {new Date(form.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="adults">Adults</label>
                        <input id="adults" name="adults" type="number" min="1" max="10"
                          value={form.adults} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="children">Children (under 12)</label>
                        <input id="children" name="children" type="number" min="0" max="6"
                          value={form.children} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="rooms">Number of Rooms</label>
                        <input id="rooms" name="rooms" type="number" min="1" max="5"
                          value={form.rooms} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="arrival_time">Expected Arrival Time</label>
                        <input id="arrival_time" name="arrival_time" type="time"
                          value={form.arrival_time} onChange={handleChange} />
                      </div>
                    </div>
                  </FormSection>

                  {/* ── 3. Room Preferences ────────────────── */}
                  <FormSection icon="fas fa-bed" title="Room Preferences" description="Customise your room setup and meal plan">
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="room_type">Room Type</label>
                        <select id="room_type" name="room_type" value={form.room_type} onChange={handleChange}>
                          {roomTypeOpts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="bed_preference">Bed Preference</label>
                        <select id="bed_preference" name="bed_preference" value={form.bed_preference} onChange={handleChange}>
                          {BED_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="room_view">Room View</label>
                        <select id="room_view" name="room_view" value={form.room_view} onChange={handleChange}>
                          {roomViewOpts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="meal_plan">
                          Meal Plan
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--secondary)', marginLeft: 6 }}>
                            (affects price)
                          </span>
                        </label>
                        <select id="meal_plan" name="meal_plan" value={form.meal_plan} onChange={handleChange}>
                          {mealPlanOpts.map(o => (
                            <option key={o} value={o}>
                              {o} {PLAN_MULTIPLIERS[o] > 1 ? `(+${Math.round((PLAN_MULTIPLIERS[o] - 1) * 100)}%)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Meal plan info banner */}
                    {form.meal_plan && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        background: 'rgba(30,202,211,0.06)', borderRadius: 10, border: '1px solid rgba(30,202,211,0.15)',
                      }}>
                        <i className="fas fa-utensils" style={{ color: 'var(--secondary)', fontSize: 13 }} />
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{form.meal_plan}</span>
                          <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>
                            {form.meal_plan === 'Room Only'       && 'No meals included.'}
                            {form.meal_plan === 'Bed & Breakfast' && 'Breakfast included.'}
                            {form.meal_plan === 'Half Board'      && 'Breakfast & dinner included.'}
                            {form.meal_plan === 'Full Board'      && 'All 3 meals included.'}
                            {form.meal_plan === 'All Inclusive'   && 'All meals, snacks & drinks included.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </FormSection>

                  {/* ── 4. Extras & Special Requests ──────── */}
                  <FormSection icon="fas fa-concierge-bell" title="Extras & Special Requests" description="Optional add-ons and any notes for the hotel">
                    {/* Airport transfer toggle */}
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      background: form.airport_transfer ? 'rgba(30,202,211,0.08)' : 'var(--gray-50)',
                      border: `1.5px solid ${form.airport_transfer ? 'var(--secondary)' : 'var(--gray-200)'}`,
                      borderRadius: 12, cursor: 'pointer', marginBottom: 14, transition: 'all 0.2s ease',
                    }}>
                      <input type="checkbox" id="airport_transfer" name="airport_transfer"
                        checked={form.airport_transfer} onChange={handleChange}
                        style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block' }}>
                          <i className="fas fa-shuttle-van" style={{ color: 'var(--secondary)', marginRight: 8 }} />
                          Add Airport Transfer
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                          Private transfer between the airport and the hotel
                        </span>
                      </div>
                    </label>

                    {/* Extras grid */}
                    {extrasOpts.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                          Available Add-ons
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {extrasOpts.map(extra => (
                            <label key={extra} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                              border: `1.5px solid ${form.selected_extras.includes(extra) ? 'var(--secondary)' : 'var(--gray-200)'}`,
                              background: form.selected_extras.includes(extra) ? 'rgba(30,202,211,0.06)' : '#fff',
                              transition: 'all 0.18s ease',
                            }}>
                              <input type="checkbox"
                                checked={form.selected_extras.includes(extra)}
                                onChange={() => handleExtraToggle(extra)}
                                style={{ marginTop: 1, cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{extra}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="omra-reserve__field">
                      <label htmlFor="special_requests">Special Requests</label>
                      <textarea id="special_requests" name="special_requests" rows={4}
                        value={form.special_requests} onChange={handleChange}
                        placeholder="Baby cot, quiet room, high floor, dietary requirements, anniversary decoration…"
                      />
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                        Requests are not guaranteed but the hotel will do its best to accommodate.
                      </p>
                    </div>
                  </FormSection>

                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading
                      ? <><i className="fas fa-spinner fa-spin" /> Processing...</>
                      : <><i className="fas fa-arrow-right" /> Continue to Payment</>
                    }
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>
                    Next step: review then complete payment. No charges until confirmed.
                  </p>
                </form>
              </div>
            </div>

            {/* ── Right: sticky summary ───────────────────── */}
            <aside style={{ position: 'sticky', top: 110 }}>
              {/* Hotel card */}
              <div className="omra-reserve__pkg-card">
                <img src={hotel.image_url} alt={hotel.name} className="omra-reserve__pkg-img" />
                <div className="omra-reserve__pkg-info">
                  <div className="omra-reserve__pkg-subtitle">{hotel.city} · {hotel.property_type || 'Hotel'}</div>
                  <div className="omra-reserve__pkg-title">{hotel.name}</div>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-map-marker-alt" /> {hotel.address}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-star" style={{ color: '#fbbf24' }} /> {hotel.rating} · {'★'.repeat(hotel.stars || 3)}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-door-open" /> {hotel.available_rooms} rooms available
                    </div>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div className="omra-reserve__summary">
                <div className="omra-reserve__summary-title">Booking Summary</div>

                <div className="omra-reserve__summary-row">
                  <span>Meal plan</span>
                  <span style={{ fontWeight: 700, color: '#1ECAD3' }}>{form.meal_plan || '—'}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Price / night / room</span>
                  <span>{nightPrice.toLocaleString('fr-FR')} {hotel.currency || 'TND'}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Nights</span>
                  <span>{nights}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Rooms</span>
                  <span>× {form.rooms}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Guests</span>
                  <span>
                    {form.adults} adult{Number(form.adults) !== 1 ? 's' : ''}
                    {Number(form.children) > 0 ? ` + ${form.children} child${Number(form.children) !== 1 ? 'ren' : ''}` : ''}
                  </span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Room type</span>
                  <span>{form.room_type}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>View</span>
                  <span>{form.room_view}</span>
                </div>
                {form.airport_transfer && (
                  <div className="omra-reserve__summary-row">
                    <span>Airport transfer</span>
                    <span style={{ color: '#1ECAD3' }}>✓ Included</span>
                  </div>
                )}
                {form.selected_extras.length > 0 && (
                  <div className="omra-reserve__summary-row">
                    <span>Extras</span>
                    <span style={{ textAlign: 'right', fontSize: 12 }}>
                      {form.selected_extras.join(', ')}
                    </span>
                  </div>
                )}

                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Estimated Total</span>
                  <span className="omra-reserve__summary-total-amount">
                    {totalPrix.toLocaleString('fr-FR')} {hotel.currency || 'TND'}
                  </span>
                </div>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                  Price updates automatically when you change the meal plan. Final price confirmed at checkout.
                </p>
              </div>

              {/* Check-in info */}
              <div style={{
                background: '#fff', borderRadius: 16, padding: '18px 20px', marginTop: 16,
                border: '1px solid var(--gray-100)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Hotel Policies
                </p>
                {[
                  { icon: 'fas fa-sign-in-alt',  label: 'Check-in',  value: hotel.checkin_time  || '14:00' },
                  { icon: 'fas fa-sign-out-alt', label: 'Check-out', value: hotel.checkout_time || '12:00' },
                  { icon: 'fas fa-ban',          label: 'Cancellation', value: 'Contact agency' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <i className={item.icon} style={{ color: 'var(--secondary)', width: 16, fontSize: 13 }} />
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HotelReservationPage;