import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const PLAN_MULTIPLIERS = {
  'room only': 1,
  'chambre seule': 1,
  'bed & breakfast': 1.12,
  'bed and breakfast': 1.12,
  'petit-dejeuner': 1.12,
  'petit dejeuner': 1.12,
  'half board': 1.25,
  'demi-pension': 1.25,
  'full board': 1.38,
  'pension complete': 1.38,
  'all inclusive': 1.55,
  'all-inclusive': 1.55,
  'tout compris': 1.55,
};

const BED_OPTIONS = ['Grand lit', 'Lits jumeaux', 'Lit double', 'Configuration familiale'];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80';

const normalizePlanKey = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getPlanMultiplier = (value) => PLAN_MULTIPLIERS[normalizePlanKey(value)] || 1;

const toDateValue = (value, fallback) => value || fallback;

const getNights = (checkIn, checkOut) => {
  const diff = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
};

const toCount = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : fallback;
};

const splitCountAcrossRooms = (total, roomCount) => {
  const safeTotal = Math.max(toCount(total, 0), 0);
  const safeRoomCount = Math.max(toCount(roomCount, 1), 1);
  const base = Math.floor(safeTotal / safeRoomCount);
  const remainder = safeTotal % safeRoomCount;
  return Array.from({ length: safeRoomCount }, (_, index) => base + (index < remainder ? 1 : 0));
};

const createRoomAllocation = ({ roomNumber, roomType, mealPlan, adults = 0, children = 0, babies = 0 }) => ({
  room_number: roomNumber,
  room_type: roomType || '',
  meal_plan: mealPlan || '',
  adults: String(Math.max(toCount(adults, 0), 0)),
  children: String(Math.max(toCount(children, 0), 0)),
  babies: String(Math.max(toCount(babies, 0), 0)),
});

const buildInitialRoomAllocations = ({ rooms, roomType, mealPlan, adults, children, babies }) => {
  const roomCount = Math.max(toCount(rooms, 1), 1);
  const adultsSplit = splitCountAcrossRooms(adults, roomCount);
  const childrenSplit = splitCountAcrossRooms(children, roomCount);
  const babiesSplit = splitCountAcrossRooms(babies, roomCount);

  return Array.from({ length: roomCount }, (_, index) => createRoomAllocation({
    roomNumber: index + 1,
    roomType,
    mealPlan,
    adults: adultsSplit[index],
    children: childrenSplit[index],
    babies: babiesSplit[index],
  }));
};

const sumRoomAllocations = (roomAllocations = []) => roomAllocations.reduce((acc, room) => ({
  adults: acc.adults + toCount(room?.adults, 0),
  children: acc.children + toCount(room?.children, 0),
  babies: acc.babies + toCount(room?.babies, 0),
}), { adults: 0, children: 0, babies: 0 });

const FormSection = ({ icon, title, description, children }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, paddingBottom: 14, borderBottom: '2px solid var(--gray-100)' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg,#e8306a,#be185d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 15,
          flexShrink: 0,
        }}
      >
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
  const navigate = useNavigate();
  const hotel = state?.hotel;
  const initialSearch = state?.search || {};

  const clientData = (() => {
    try {
      return JSON.parse(localStorage.getItem('client') || '{}');
    } catch {
      return {};
    }
  })();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const roomTypeOpts = hotel?.room_types?.length ? hotel.room_types : ['Chambre standard', 'Chambre superieure', 'Suite'];
  const mealPlanOpts = hotel?.meal_plans?.length ? hotel.meal_plans : ['Chambre seule', 'Petit-dejeuner', 'Demi-pension', 'Pension complete', 'All inclusive'];
  const roomViewOpts = hotel?.room_views?.length ? hotel.room_views : ['Vue standard'];
  const extrasOpts = hotel?.reservation_extras?.length ? hotel.reservation_extras : [];
  const defaultRoomType = roomTypeOpts[0] || '';
  const defaultMealPlan = mealPlanOpts[0] || '';
  const defaultRoomView = roomViewOpts[0] || '';

  const [form, setForm] = useState(() => {
    const initialAdults = initialSearch.adults || initialSearch.persons || '2';
    const initialChildren = '0';
    const initialBabies = '0';
    const initialRooms = initialSearch.rooms || '1';
    const initialRoomType = defaultRoomType;
    const initialMealPlan = defaultMealPlan;

    return {
      holder_first_name: clientData?.firstName || clientData?.first_name || '',
      holder_last_name: clientData?.lastName || clientData?.last_name || '',
      holder_email: clientData?.email || '',
      holder_phone: clientData?.phone || '',
      check_in: toDateValue(initialSearch.checkin, today),
      check_out: toDateValue(initialSearch.checkout, tomorrow),
      adults: initialAdults,
      children: initialChildren,
      babies: initialBabies,
      rooms: initialRooms,
      room_type: initialRoomType,
      meal_plan: initialMealPlan,
      room_view: defaultRoomView,
      bed_preference: BED_OPTIONS[0],
      arrival_time: hotel?.checkin_time || '14:00',
      airport_transfer: false,
      selected_extras: [],
      special_requests: '',
      room_allocations: buildInitialRoomAllocations({
        rooms: initialRooms,
        roomType: initialRoomType,
        mealPlan: initialMealPlan,
        adults: initialAdults,
        children: initialChildren,
        babies: initialBabies,
      }),
    };
  });
  const [loading, setLoading] = useState(false);
  const [splitError, setSplitError] = useState('');

  const clientEmail = clientData?.email || '';
  const lockedStyle = { background: '#f8fafc', cursor: 'not-allowed', color: '#64748b', borderColor: '#e2e8f0' };

  const nights = useMemo(() => getNights(form.check_in, form.check_out), [form.check_in, form.check_out]);
  const multiplier = getPlanMultiplier(form.meal_plan);
  const nightPrice = Math.round(Number(hotel?.base_price || 0) * multiplier);
  const totalPrix = nightPrice * Number(form.rooms || 1) * nights;
  const image = hotel?.image_url || hotel?.gallery?.find(Boolean) || DEFAULT_IMAGE;
  const allocationTotals = useMemo(() => sumRoomAllocations(form.room_allocations), [form.room_allocations]);
  const expectedRoomCount = Math.max(toCount(form.rooms, 1), 1);
  const roomSplitMatches = (
    form.room_allocations.length === expectedRoomCount
    && allocationTotals.adults === toCount(form.adults, 0)
    && allocationTotals.children === toCount(form.children, 0)
    && allocationTotals.babies === toCount(form.babies, 0)
  );

  useEffect(() => {
    setForm((current) => {
      const roomCount = Math.max(toCount(current.rooms, 1), 1);
      const currentAllocations = Array.isArray(current.room_allocations) ? current.room_allocations : [];
      const nextAllocations = Array.from({ length: roomCount }, (_, index) => {
        const existing = currentAllocations[index];
        if (existing) {
          return {
            ...existing,
            room_number: index + 1,
            room_type: existing.room_type || current.room_type || defaultRoomType,
            meal_plan: existing.meal_plan || current.meal_plan || defaultMealPlan,
          };
        }

        return createRoomAllocation({
          roomNumber: index + 1,
          roomType: current.room_type || defaultRoomType,
          mealPlan: current.meal_plan || defaultMealPlan,
        });
      });

      const nextRooms = String(roomCount);
      if (JSON.stringify(currentAllocations) === JSON.stringify(nextAllocations) && current.rooms === nextRooms) {
        return current;
      }

      return {
        ...current,
        rooms: nextRooms,
        room_allocations: nextAllocations,
      };
    });
  }, [form.rooms, defaultMealPlan, defaultRoomType]);

  if (!hotel) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>:-/</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>Hotel introuvable.</p>
          <button className="omra-reserve__submit" style={{ width: 'auto', padding: '14px 28px' }} onClick={() => navigate('/hotels')}>
            Retour aux hotels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSplitError('');

    if (name === 'room_type' || name === 'meal_plan') {
      setForm((current) => {
        const previousValue = current[name];
        return {
          ...current,
          [name]: value,
          room_allocations: current.room_allocations.map((room) => ({
            ...room,
            [name]: toCount(current.rooms, 1) === 1 || room[name] === previousValue ? value : room[name],
          })),
        };
      });
      return;
    }

    if (name === 'adults' || name === 'children' || name === 'babies') {
      setForm((current) => ({
        ...current,
        [name]: value,
        room_allocations: toCount(current.rooms, 1) === 1
          ? current.room_allocations.map((room, index) => (index === 0 ? { ...room, [name]: value } : room))
          : current.room_allocations,
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleExtraToggle = (extra) => {
    setSplitError('');
    setForm((current) => ({
      ...current,
      selected_extras: current.selected_extras.includes(extra)
        ? current.selected_extras.filter((item) => item !== extra)
        : [...current.selected_extras, extra],
    }));
  };

  const handleRoomAllocationChange = (roomIndex, field, value) => {
    setSplitError('');
    setForm((current) => ({
      ...current,
      room_allocations: current.room_allocations.map((room, index) => (
        index === roomIndex ? { ...room, [field]: value } : room
      )),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!roomSplitMatches) {
      setSplitError('La repartition des chambres doit correspondre exactement au total adultes, enfants et bebes.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/hotels/payment', { state: { hotel, reservation: form, totalPrix } });
    }, 350);
  };

  return (
    <div>
      <Navbar />

      <div className="omra-reserve">
        <div className="container">
          <div className="omra-page-breadcrumb omra-page-breadcrumb--light" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/hotels')}>Hotels</button>
            <span>/</span>
            <button onClick={() => navigate(-1)}>{hotel.city}</button>
            <span>/</span>
            <span>Reservation</span>
          </div>

          {clientEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#fff1f5', border: '1px solid #fbcfe8', borderRadius: 12, marginBottom: 20 }}>
              <i className="fas fa-user-check" style={{ color: '#be185d', fontSize: 14 }} />
              <p style={{ fontSize: 13, color: '#9f1239', fontWeight: 600, margin: 0 }}>
                Connecte en tant que <strong>{clientEmail}</strong> : vos informations sont deja pre-remplies.
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header" style={{ background: 'linear-gradient(135deg,#8a1538,#e8306a)' }}>
                  <div className="omra-reserve__form-header-title">Formulaire de reservation hotel</div>
                  <div className="omra-reserve__form-header-desc">
                    Tous les champs enregistres ici correspondent a votre table `hotel_reservations`.
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    {['Titulaire', 'Sejour', 'Chambre', 'Options'].map((step, index) => (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#fff',
                          }}
                        >
                          {index + 1}
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', fontWeight: 600 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
                  <FormSection icon="fas fa-user" title="Titulaire de la reservation" description="Informations du voyageur principal">
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_first_name">Prenom *</label>
                        <input id="holder_first_name" name="holder_first_name" type="text" required value={form.holder_first_name} onChange={handleChange} placeholder="Ex: Miniar" />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_last_name">Nom *</label>
                        <input id="holder_last_name" name="holder_last_name" type="text" required value={form.holder_last_name} onChange={handleChange} placeholder="Ex: Nmiri" />
                      </div>
                    </div>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_email">Email *</label>
                        <input
                          id="holder_email"
                          name="holder_email"
                          type="email"
                          required
                          value={form.holder_email}
                          onChange={(event) => !clientEmail && handleChange(event)}
                          readOnly={!!clientEmail}
                          style={clientEmail ? lockedStyle : {}}
                          placeholder="vous@email.com"
                        />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="holder_phone">Telephone *</label>
                        <input id="holder_phone" name="holder_phone" type="tel" required value={form.holder_phone} onChange={handleChange} placeholder="+216 XX XXX XXX" />
                      </div>
                    </div>
                  </FormSection>

                  <FormSection icon="fas fa-calendar-alt" title="Details du sejour" description="Dates, voyageurs et nombre de chambres">
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="check_in">Check-in</label>
                        <input id="check_in" name="check_in" type="date" value={form.check_in} min={today} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="check_out">Check-out</label>
                        <input id="check_out" name="check_out" type="date" value={form.check_out} min={form.check_in || today} onChange={handleChange} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(232,48,106,0.08)', borderRadius: 10, marginBottom: 16, border: '1px solid rgba(232,48,106,0.14)' }}>
                      <i className="fas fa-moon" style={{ color: '#e8306a', fontSize: 13 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#9f1239' }}>
                        {nights} nuit{nights !== 1 ? 's' : ''} selectionnee{nights !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 16 }}>
                      <div className="omra-reserve__field">
                        <label htmlFor="adults">Adultes</label>
                        <input id="adults" name="adults" type="number" min="1" max="10" value={form.adults} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="children">Enfants</label>
                        <input id="children" name="children" type="number" min="0" max="6" value={form.children} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="babies">Bebes</label>
                        <input id="babies" name="babies" type="number" min="0" max="4" value={form.babies} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="rooms">Nombre de chambres</label>
                        <input id="rooms" name="rooms" type="number" min="1" max="5" value={form.rooms} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="arrival_time">Heure d'arrivee prevue</label>
                        <input id="arrival_time" name="arrival_time" type="time" value={form.arrival_time} onChange={handleChange} />
                      </div>
                    </div>
                  </FormSection>

                  <FormSection icon="fas fa-bed" title="Preferences de chambre" description="Les valeurs globales sont enregistrees dans `room_type`, `meal_plan`, `room_view` et `bed_preference`">
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="room_type">Type de chambre</label>
                        <select id="room_type" name="room_type" value={form.room_type} onChange={handleChange}>
                          {roomTypeOpts.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="bed_preference">Preference de lit</label>
                        <select id="bed_preference" name="bed_preference" value={form.bed_preference} onChange={handleChange}>
                          {BED_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label htmlFor="room_view">Vue de la chambre</label>
                        <select id="room_view" name="room_view" value={form.room_view} onChange={handleChange}>
                          {roomViewOpts.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="omra-reserve__field">
                        <label htmlFor="meal_plan">
                          Formule repas
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#e8306a', marginLeft: 6 }}>(impacte le prix)</span>
                        </label>
                        <select id="meal_plan" name="meal_plan" value={form.meal_plan} onChange={handleChange}>
                          {mealPlanOpts.map((option) => (
                            <option key={option} value={option}>
                              {option}{getPlanMultiplier(option) > 1 ? ` (+${Math.round((getPlanMultiplier(option) - 1) * 100)}%)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection icon="fas fa-th-list" title="Repartition des chambres" description="Chaque ligne alimente le voucher PDF, avec un detail par chambre.">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)' }}>
                        Totaux saisis: {allocationTotals.adults} adulte(s), {allocationTotals.children} enfant(s), {allocationTotals.babies} bebe(s)
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: roomSplitMatches ? '#047857' : '#b91c1c' }}>
                        {roomSplitMatches ? 'Repartition conforme' : 'Ajustez la repartition pour correspondre aux totaux'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                      {form.room_allocations.map((room, index) => (
                        <div key={room.room_number || index} style={{ border: '1px solid var(--gray-200)', borderRadius: 16, padding: '16px 18px', background: '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-800)' }}>
                              Chambre {room.room_number || index + 1}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                              Type, formule et voyageurs par chambre
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
                            <div className="omra-reserve__field">
                              <label htmlFor={`room_type_${index}`}>Type de chambre</label>
                              <select id={`room_type_${index}`} value={room.room_type} onChange={(event) => handleRoomAllocationChange(index, 'room_type', event.target.value)}>
                                {roomTypeOpts.map((option) => <option key={option} value={option}>{option}</option>)}
                              </select>
                            </div>
                            <div className="omra-reserve__field">
                              <label htmlFor={`meal_plan_${index}`}>Formule repas</label>
                              <select id={`meal_plan_${index}`} value={room.meal_plan} onChange={(event) => handleRoomAllocationChange(index, 'meal_plan', event.target.value)}>
                                {mealPlanOpts.map((option) => <option key={option} value={option}>{option}</option>)}
                              </select>
                            </div>
                            <div className="omra-reserve__field">
                              <label htmlFor={`room_adults_${index}`}>Adultes</label>
                              <input id={`room_adults_${index}`} type="number" min="0" max="10" value={room.adults} onChange={(event) => handleRoomAllocationChange(index, 'adults', event.target.value)} />
                            </div>
                            <div className="omra-reserve__field">
                              <label htmlFor={`room_children_${index}`}>Enfants</label>
                              <input id={`room_children_${index}`} type="number" min="0" max="6" value={room.children} onChange={(event) => handleRoomAllocationChange(index, 'children', event.target.value)} />
                            </div>
                            <div className="omra-reserve__field">
                              <label htmlFor={`room_babies_${index}`}>Bebes</label>
                              <input id={`room_babies_${index}`} type="number" min="0" max="4" value={room.babies} onChange={(event) => handleRoomAllocationChange(index, 'babies', event.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {splitError && (
                      <p style={{ marginTop: 12, color: '#b91c1c', fontSize: 12, fontWeight: 700 }}>
                        {splitError}
                      </p>
                    )}
                  </FormSection>

                  <FormSection icon="fas fa-concierge-bell" title="Options et demandes speciales" description="Ajouts facultatifs et commentaires enregistres dans la reservation">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        background: form.airport_transfer ? 'rgba(232,48,106,0.08)' : 'var(--gray-50)',
                        border: `1.5px solid ${form.airport_transfer ? '#e8306a' : 'var(--gray-200)'}`,
                        borderRadius: 12,
                        cursor: 'pointer',
                        marginBottom: 14,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input type="checkbox" id="airport_transfer" name="airport_transfer" checked={form.airport_transfer} onChange={handleChange} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block' }}>
                          <i className="fas fa-shuttle-van" style={{ color: '#e8306a', marginRight: 8 }} />
                          Ajouter un transfert aeroport
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                          Cette information sera enregistree dans `airport_transfer`.
                        </span>
                      </div>
                    </label>

                    {extrasOpts.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                          Extras disponibles
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {extrasOpts.map((extra) => (
                            <label
                              key={extra}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '12px 14px',
                                borderRadius: 12,
                                cursor: 'pointer',
                                border: `1.5px solid ${form.selected_extras.includes(extra) ? '#e8306a' : 'var(--gray-200)'}`,
                                background: form.selected_extras.includes(extra) ? 'rgba(232,48,106,0.06)' : '#fff',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <input type="checkbox" checked={form.selected_extras.includes(extra)} onChange={() => handleExtraToggle(extra)} style={{ marginTop: 1, cursor: 'pointer' }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{extra}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="omra-reserve__field">
                      <label htmlFor="special_requests">Demandes speciales</label>
                      <textarea
                        id="special_requests"
                        name="special_requests"
                        rows={4}
                        value={form.special_requests}
                        onChange={handleChange}
                        placeholder="Lit bebe, chambre calme, etage eleve, regime alimentaire, decoration anniversaire..."
                      />
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                        Cette note sera enregistree dans `special_requests`.
                      </p>
                    </div>
                  </FormSection>

                  <button type="submit" className="omra-reserve__submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#e8306a,#be185d)' }}>
                    {loading
                      ? <><i className="fas fa-spinner fa-spin" /> Redirection...</>
                      : <><i className="fas fa-arrow-right" /> Continuer vers le paiement</>
                    }
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>
                    Etape suivante : verification puis paiement.
                  </p>
                </form>
              </div>
            </div>

            <aside style={{ position: 'sticky', top: 110 }}>
              <div className="omra-reserve__pkg-card">
                <img src={image} alt={hotel.name} className="omra-reserve__pkg-img" />
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
                      <i className="fas fa-door-open" /> {hotel.available_rooms} chambre(s) disponible(s)
                    </div>
                  </div>
                </div>
              </div>

              <div className="omra-reserve__summary" style={{ background: 'linear-gradient(135deg,#8a1538,#e8306a)' }}>
                <div className="omra-reserve__summary-title">Resume de reservation</div>

                <div className="omra-reserve__summary-row">
                  <span>Formule</span>
                  <span style={{ fontWeight: 700, color: '#fbcfe8' }}>{form.meal_plan || '—'}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Prix / nuit / chambre</span>
                  <span>{nightPrice.toLocaleString('fr-FR')} {hotel.currency || 'TND'}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Nuits</span>
                  <span>{nights}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Chambres</span>
                  <span>× {form.rooms}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Voyageurs</span>
                  <span>
                    {form.adults} adulte{Number(form.adults) !== 1 ? 's' : ''}
                    {Number(form.children) > 0 ? ` + ${form.children} enfant${Number(form.children) !== 1 ? 's' : ''}` : ''}
                    {Number(form.babies) > 0 ? ` + ${form.babies} bebe${Number(form.babies) !== 1 ? 's' : ''}` : ''}
                  </span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Type de chambre</span>
                  <span>{form.room_type}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Vue</span>
                  <span>{form.room_view}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Preference de lit</span>
                  <span>{form.bed_preference}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Heure d'arrivee</span>
                  <span>{form.arrival_time || '—'}</span>
                </div>
                {form.airport_transfer && (
                  <div className="omra-reserve__summary-row">
                    <span>Transfert aeroport</span>
                    <span style={{ color: '#fbcfe8' }}>Oui</span>
                  </div>
                )}
                {form.selected_extras.length > 0 && (
                  <div className="omra-reserve__summary-row">
                    <span>Extras</span>
                    <span style={{ textAlign: 'right', fontSize: 12 }}>{form.selected_extras.join(', ')}</span>
                  </div>
                )}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.68)', marginBottom: 8 }}>
                    Repartition chambres
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {form.room_allocations.map((room, index) => (
                      <div key={`summary-room-${room.room_number || index}`} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12, fontWeight: 700 }}>
                          <span>Chambre {room.room_number || index + 1}</span>
                          <span>{room.room_type || form.room_type || '-'}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
                          {room.meal_plan || form.meal_plan || '-'} · {room.adults || 0} ad. · {room.children || 0} enf. · {room.babies || 0} bebe(s)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total estime</span>
                  <span className="omra-reserve__summary-total-amount">
                    {totalPrix.toLocaleString('fr-FR')} {hotel.currency || 'TND'}
                  </span>
                </div>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.62)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                  Le total varie selon la formule, le nombre de nuits et le nombre de chambres.
                </p>
              </div>

              <div
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '18px 20px',
                  marginTop: 16,
                  border: '1px solid var(--gray-100)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Infos hotel
                </p>
                {[
                  { icon: 'fas fa-sign-in-alt', label: 'Check-in', value: hotel.checkin_time || '14:00' },
                  { icon: 'fas fa-sign-out-alt', label: 'Check-out', value: hotel.checkout_time || '12:00' },
                  { icon: 'fas fa-utensils', label: 'Repas', value: hotel.meals || 'Selon la formule choisie' },
                  { icon: 'fas fa-ban', label: 'Politique', value: hotel.policies?.[0] || 'Selon les conditions de l hotel' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <i className={item.icon} style={{ color: '#e8306a', width: 16, fontSize: 13 }} />
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', textAlign: 'right' }}>{item.value}</span>
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
