// services/duffelService.js
require('dotenv').config();
const { Duffel } = require('@duffel/api');

const duffel = new Duffel({ token: process.env.DUFFEL_API_KEY });


const EUR_TO_TND = parseFloat(process.env.EUR_TO_TND_RATE || '3.38');
const MARGIN     = 1.10; 

 
const toTND = (amount, currency) => {
  const raw = parseFloat(amount || '0');
  let tnd;
  switch ((currency || 'EUR').toUpperCase()) {
    case 'TND': tnd = raw;                       break;
    case 'EUR': tnd = raw * EUR_TO_TND;          break;
    case 'USD': tnd = raw * EUR_TO_TND * 0.92;   break; 
    case 'GBP': tnd = raw * EUR_TO_TND * 1.17;   break;
    default:    tnd = raw * EUR_TO_TND;
  }
  return +(tnd * MARGIN).toFixed(2);
};


const normaliseOffer = (offer) => {
  const firstSlice = offer.slices?.[0]  ?? {};
  const lastSlice  = offer.slices?.[offer.slices.length - 1] ?? {};
  const firstSeg   = firstSlice.segments?.[0]  ?? {};
  const lastSeg    = lastSlice.segments?.[lastSlice.segments?.length - 1] ?? {};
  const carrier    = firstSeg.marketing_carrier ?? {};
  const stops      = (firstSlice.segments?.length ?? 1) - 1;

  
  const originalAmount   = offer.total_amount;
  const originalCurrency = offer.total_currency;
  const tndPrice         = toTND(originalAmount, originalCurrency);


  const firstPax       = offer.passengers?.[0];
  const baggages       = firstPax?.baggages ?? [];
  const checkedBag     = baggages.find(b => b.type === 'checked');
  const carryOn        = baggages.find(b => b.type === 'carry_on');
  const baggageIncluded = baggages.length > 0;

  
  const availableSeats = firstSeg.passengers?.[0]?.seat?.available_count ?? null;

  return {
    id:             offer.id,

    
    total_amount:   String(tndPrice),
    total_currency: 'TND',

    
    _original_amount:   originalAmount,
    _original_currency: originalCurrency,

    expires_at:   offer.expires_at,
    cabin_class:  offer.cabin_class,
    conditions:   offer.conditions,
    passengers:   offer.passengers,
    slices:       offer.slices,

  
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
     
      baggage_included:  baggageIncluded,
      checked_bags:      checkedBag  ? checkedBag.quantity  : 0,
      carry_on_bags:     carryOn     ? carryOn.quantity     : 0,
      
      available_seats:   availableSeats,
    },
  };
};


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


const getOffer = async (offerId) => {
  const response = await duffel.offers.get(offerId, { return_available_services: true });
  return normaliseOffer(response.data);
};


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