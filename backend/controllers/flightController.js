
const duffelService     = require('../services/duffelService');
const FlightReservation = require('../models/flightReservationModel');
const { sendReservationStatusEmail } = require('../utils/mailer');


const toE164 = (raw = '') => {
  // Supprime espaces, tirets, parenthèses, points
  let s = String(raw).replace(/[\s\-().]/g, '');

  // Détecte un numéro tunisien local à 8 chiffres 

  if (/^[2345789]\d{7}$/.test(s)) s = '+216' + s;

  if (!s.startsWith('+')) s = '+' + s;

  return s;
};

const isOfferExpiredError = (err) => {
 
  const msg = (err?.errors?.[0]?.message || err?.message || '').toLowerCase();

  return (
    msg.includes('select another offer') ||
    msg.includes('no longer available')  ||
    msg.includes('offer has expired')    ||
    msg.includes('offer is expired')     ||
    msg.includes('availability')         ||
    msg.includes('expired')
  );
};
const parsePassengers = (passengers) => {
  if (Array.isArray(passengers)) return passengers; // déjà un tableau
  try {
    return JSON.parse(passengers || '[]'); // parse la string JSON
  } catch {
    return []; // retourne tableau vide si parse échoue
  }
};

const searchFlights = async (req, res) => {
  try {
    const { slices, passengers, cabin_class, max_connections } = req.body;

    if (!slices?.length)
      return res.status(400).json({ success: false, message: 'slices is required.' });
    if (!passengers?.length)
      return res.status(400).json({ success: false, message: 'passengers is required.' });
 
    // Appel au service Duffel, retourne les offres déjà normalisées en TND
    const result = await duffelService.searchFlights({
      slices,
      passengers,
      cabin_class:     cabin_class ?? 'economy', 
      max_connections,                            
    });

    // Les offres retournées  total_amount en TND + marge 10%
    // use normaliseOffer() dans duffelService 
    return res.json({
      success:          true,
      offer_request_id: result.id,
      offers:           result.offers,
    });

  } catch (err) {
    console.error('[searchFlights]', err?.errors ?? err.message);
    return res.status(500).json({
      success: false,
      message: err?.errors?.[0]?.message ?? err.message,
    });
  }
};

//utilise pour flight details, verif expiration, affiche info fraiche

const getOffer = async (req, res) => {
  try {
    
    const offer = await duffelService.getOffer(req.params.offerId);// appel service duffel

    return res.json({ success: true, offer });

  } catch (err) {
    console.error('[getOffer]', err?.errors ?? err.message);

    if (isOfferExpiredError(err)) {
      return res.status(410).json({
        success: false,
        expired: true,
        message: "Cette offre n'est plus disponible. Veuillez effectuer une nouvelle recherche.",
      });
    }

    return res.status(500).json({
      success: false,
      message: err?.errors?.[0]?.message ?? err.message,
    });
  }
};

// requireClient vérifie le JWT et injecte req.clientId
//ta3mel validation,normalisation,recuperation off,payer org chez duffel, enrg reserv en bd, envoi mail conf 

const bookFlight = async (req, res) => {
  try {
    const {
      offer_id,
      passengers,
      payment_method = 'agency', 
    } = req.body;

    // req.clientId est injecté par le middleware requireClient après vérification JWT
    const userId = req.clientId || null;

    // Validation
    if (!offer_id)
      return res.status(400).json({ success: false, message: 'offer_id is required.' });
    if (!passengers?.length)
      return res.status(400).json({ success: false, message: 'passengers is required.' });

    //normaliser les nums
    const normalizedPassengers = passengers.map(p => ({
      ...p,
      phone_number: toE164(p.phone_number || ''),
    }));

    //recuperer off
    let offer;
    try {
      offer = await duffelService.getOffer(offer_id);
    } catch (err) {
      if (isOfferExpiredError(err)) {
        return res.status(410).json({
          success: false,
          expired: true,
          message: "Cette offre a expiré. Veuillez effectuer une nouvelle recherche.",
        });
      }
      throw err; 
    }

    // paiement duffel en euro
    const paymentPayload = {
      type:     'balance',               // paiement depuis le solde du compte Duffel de l'agence
      amount:   offer._original_amount,   
      currency: offer._original_currency, 
    };

    // creer cmnd chez duffel
    let order;
    try {
      order = await duffelService.bookFlight({
        offer_id,
        passengers: normalizedPassengers,
        payments:   paymentPayload,
      });
    } catch (err) {
     
      //si loffre expire enre le get et book
      if (isOfferExpiredError(err)) {
        return res.status(410).json({
          success: false,
          expired: true,
          message: "Les disponibilités ont changé pendant votre réservation. Veuillez sélectionner une nouvelle offre.",
        });
      }
      throw err;
    }

    //enregistrement dans bd avec tnd 

    const isOnline     = payment_method === 'online'; 
    const firstSlice   = offer.slices?.[0];
    const firstSegment = firstSlice?.segments?.[0];
 
    const lastSegment  = firstSlice?.segments?.[firstSlice?.segments?.length - 1];
    const firstPax     = normalizedPassengers[0]; 

    const reservation = await FlightReservation.create({
      user_id:          userId,
      duffel_order_id:  order.id,                                      
      offer_id,
      origin_iata:      firstSegment?.origin?.iata_code        || null,
      destination_iata: lastSegment?.destination?.iata_code
                        || firstSegment?.destination?.iata_code || null, 
      airline_name:     firstSegment?.marketing_carrier?.name  || null,
      flight_number:    firstSegment?.marketing_carrier_flight_number || null,
      departing_at:     firstSegment?.departing_at             || null,
      arriving_at:      lastSegment?.arriving_at
                        || firstSegment?.arriving_at            || null, 
      cabin_class:      offer.cabin_class                      || 'economy',
      total_price:      offer.total_amount,  // prix tnd
      currency:         'TND',
      passengers:       normalizedPassengers,
      //status selon mode paiement 
      status:           isOnline ? 'confirmed' : 'pending',
      payment_status:   isOnline ? 'paid'      : 'pending',
      payment_method,
      notes: firstPax?.email ? `Contact: ${firstPax.email}` : null,
    });

    // envoie mail
    const emailRecipient = firstPax?.email;
    const emailFirstName = firstPax?.given_name || 'Client';

    if (emailRecipient) {
      sendReservationStatusEmail({
        email:     emailRecipient,
        firstName: emailFirstName,
        type:      'flight',
        title:     `${reservation.origin_iata || '?'} → ${reservation.destination_iata || '?'}`,
        status:    isOnline ? 'confirmed' : 'pending',
        details: {
          'Compagnie': reservation.airline_name,
          'Vol':       reservation.flight_number,
          'Départ':    reservation.departing_at
                         ? new Date(reservation.departing_at).toLocaleString('fr-FR') : null,
          'Classe':    reservation.cabin_class,
          'Paiement':  isOnline ? '💳 En ligne' : "🏪 À l'agence",
          'Total':     reservation.total_price
                         ? `${Number(reservation.total_price).toLocaleString('fr-TN')} ${reservation.currency || 'TND'}` : null,
          'Référence': reservation.duffel_order_id || null,
        },
      }).catch(err =>
        console.error('❌ Booking confirmation email failed:', err.message)
      );
    }

    return res.status(201).json({
      success:      true,
      message:      isOnline
        ? 'Réservation confirmée et payée.'
        : 'Réservation créée. Paiement en attente.',
      reservation,
      duffel_order: order,
    });

  } catch (err) {
    console.error('[bookFlight]', err?.errors ?? err.message);
    return res.status(500).json({
      success: false,
      message: err?.errors?.[0]?.message ?? err.message,
    });
  }
};

//liste reservation pour admin
const getReservations = async (req, res) => {
  try {
    return res.json({
      success: true,
      data:    await FlightReservation.getAllForAdmin(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//les reservations de client affiché dans sa profile
const getMyReservations = async (req, res) => {
  try {
    return res.json({
      success: true,
      data:    await FlightReservation.findByUserId(req.clientId),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//changement de status par admin, annulation pour super uniquement reste possible 
const updateReservationStatus = async (req, res) => {
  try {
    const { id }     = req.params; // id res
    const { status } = req.body;

    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide.' });

    
    if (status === 'cancelled' && req.adminRole !== 'main')
      return res.status(403).json({
        success: false,
        message: "Seul l'administrateur principal peut annuler une réservation de vol.",
      });

    
    const existing = await FlightReservation.findById(id);
    if (!existing)
      return res.status(404).json({ success: false, message: 'Réservation introuvable.' });

    
    const paymentStatus = status === 'confirmed' ? 'paid'
                        : status === 'cancelled'  ? 'refunded'
                        : undefined;

    const reservation = await FlightReservation.updateStatus(id, status, paymentStatus);

    //envoie mail auto a chaque changemet status
    const parsedPax = parsePassengers(reservation?.passengers);
    const firstPax  = parsedPax[0];

    
    const email     = existing.client_email      || firstPax?.email;
    const firstName = existing.client_first_name || firstPax?.given_name || 'Client';

    if (email) {
      sendReservationStatusEmail({
        email,
        firstName,
        type:   'flight',
        title:  `${reservation.origin_iata || '?'} → ${reservation.destination_iata || '?'}`,
        status,
        details: {
          'Compagnie': reservation.airline_name,
          'Vol':       reservation.flight_number,
          'Départ':    reservation.departing_at
                         ? new Date(reservation.departing_at).toLocaleString('fr-FR') : null,
          'Classe':    reservation.cabin_class,
          'Paiement':  reservation.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence',
          'Total':     reservation.total_price
                         ? `${Number(reservation.total_price).toLocaleString('fr-TN')} ${reservation.currency || 'TND'}` : null,
        },
      }).catch(err =>
        console.error('❌ Flight status email failed:', err.message)
      );
    }

    return res.json({ success: true, reservation });

  } catch (err) {
    console.error('[updateReservationStatus]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = {
  searchFlights,
  getOffer,
  bookFlight,
  getReservations,
  getMyReservations,
  updateReservationStatus,
};