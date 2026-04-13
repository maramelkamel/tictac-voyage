// services/duffelService.js
require('dotenv').config();
const { Duffel } = require('@duffel/api');

const duffel = new Duffel({ token: process.env.DUFFEL_API_KEY });

// ── Taux de change fixe EUR → TND ─────────────────────────────
// Mets à jour ce taux régulièrement ou utilise une API de change.
const EUR_TO_TND = parseFloat(process.env.EUR_TO_TND_RATE || '3.38');
const MARGIN     = 1.10; // 10% de marge agence

/**
 * Convertit un montant de sa devise d'origine en TND avec marge.
 * Actuellement EUR → TND. Étend au besoin pour GBP, USD, etc.
 */
const toTND = (amount, currency) => {
  const raw = parseFloat(amount || '0');
  let tnd;
  switch ((currency || 'EUR').toUpperCase()) {
    case 'TND': tnd = raw;                       break;
    case 'EUR': tnd = raw * EUR_TO_TND;          break;
    case 'USD': tnd = raw * EUR_TO_TND * 0.92;   break; // approximation
    case 'GBP': tnd = raw * EUR_TO_TND * 1.17;   break;
    default:    tnd = raw * EUR_TO_TND;
  }
  return +(tnd * MARGIN).toFixed(2); // retourne un number
};

// ── Normalisation ─────────────────────────────────────────────
const normaliseOffer = (offer) => {
  const firstSlice = offer.slices?.[0]  ?? {};
  const lastSlice  = offer.slices?.[offer.slices.length - 1] ?? {};
  const firstSeg   = firstSlice.segments?.[0]  ?? {};
  const lastSeg    = lastSlice.segments?.[lastSlice.segments?.length - 1] ?? {};
  const carrier    = firstSeg.marketing_carrier ?? {};
  const stops      = (firstSlice.segments?.length ?? 1) - 1;

  // ── Prix avec marge + conversion TND ──────────────────────
  const originalAmount   = offer.total_amount;
  const originalCurrency = offer.total_currency;
  const tndPrice         = toTND(originalAmount, originalCurrency);

  // ── Bagage du 1er passager ────────────────────────────────
  const firstPax       = offer.passengers?.[0];
  const baggages       = firstPax?.baggages ?? [];
  const checkedBag     = baggages.find(b => b.type === 'checked');
  const carryOn        = baggages.find(b => b.type === 'carry_on');
  const baggageIncluded = baggages.length > 0;

  // ── Places disponibles (Duffel ne fournit pas toujours ça) ─
  // On utilise available_seats si présent, sinon on estime.
  const availableSeats = firstSeg.passengers?.[0]?.seat?.available_count ?? null;

  return {
    id:             offer.id,

    // Prix TND (affiché côté client)
    total_amount:   String(tndPrice),
    total_currency: 'TND',

    // Prix original conservé pour debug / API booking
    _original_amount:   originalAmount,
    _original_currency: originalCurrency,

    expires_at:   offer.expires_at,
    cabin_class:  offer.cabin_class,
    conditions:   offer.conditions,
    passengers:   offer.passengers,
    slices:       offer.slices,

    // Champs plats pour les cartes et filtres
    _summary: {
      origin_iata:       firstSeg.origin?.iata_code      ?? '---',
      destination_iata:  lastSeg.destination?.iata_code  ?? '---',
      origin_name:       firstSeg.origin?.name           ?? '',
      destination_name:  lastSeg.destination?.name       ?? '',
      departing_at:      firstSeg.departing_at            ?? null,
      arriving_at:       lastSeg.arriving_at              ?? null,
      duration:          firstSlice.duration              ?? null,
      airline_name:      carrier.name                    ?? '',
      airline_iata:      carrier.iata_code               ?? '',
      airline_logo:      carrier.logo_symbol_url ?? carrier.logo_lockup_url ?? null,
      stops,
      // Bagages
      baggage_included:  baggageIncluded,
      checked_bags:      checkedBag  ? checkedBag.quantity  : 0,
      carry_on_bags:     carryOn     ? carryOn.quantity     : 0,
      // Places
      available_seats:   availableSeats,
    },
  };
};

// ── Search ────────────────────────────────────────────────────
const searchFlights = async ({ slices, passengers, cabin_class = 'economy', max_connections }) => {
  const body = { slices, passengers, cabin_class, return_offers: true };
  if (max_connections !== undefined && max_connections !== null) {
    body.max_connections = max_connections;
  }
  const response = await duffel.offerRequests.create(body);
  const data     = response.data;
  return {
    id:     data.id,
    offers: (data.offers ?? []).map(normaliseOffer),
  };
};

// ── Get offer ─────────────────────────────────────────────────
const getOffer = async (offerId) => {
  const response = await duffel.offers.get(offerId, { return_available_services: true });
  return normaliseOffer(response.data);
};

// ── Book — utilise le prix ORIGINAL pour Duffel ───────────────
const bookFlight = async ({ offer_id, passengers, payments }) => {
  const response = await duffel.orders.create({
    selected_offers: [offer_id],
    passengers,
    payments: [payments],
    type: 'instant',
  });
  return response.data;
};

const getOrder    = async (orderId) => (await duffel.orders.get(orderId)).data;
const cancelOrder = async (orderId) => {
  const c = await duffel.orderCancellations.create({ order_id: orderId });
  return (await duffel.orderCancellations.confirm(c.data.id)).data;
};

module.exports = { searchFlights, getOffer, bookFlight, getOrder, cancelOrder, toTND };