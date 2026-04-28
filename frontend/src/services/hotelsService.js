import {
  getCityId,
  getHotelsFromMakCorps,
  getHotelsFromBookingAPI,
  getManualHotels,
} from './api';

const DEFAULT_AMENITIES = ['WiFi', 'Pool', 'Breakfast', 'Parking'];
const CITY_FALLBACK_IMAGES = {
  Tunis: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  Sousse: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&q=80',
  Hammamet: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
};
const DEFAULT_HOTEL_IMAGE = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80';

const CITY_BBOXES = {
  Tunis: '10.10,36.60,10.30,36.85',
  Sousse: '10.55,35.75,10.72,35.91',
  Hammamet: '10.53,36.35,10.68,36.47',
};

const toCityKey = (city = 'Tunis') => {
  const normalized = city.trim().toLowerCase();
  return Object.keys(CITY_BBOXES).find((item) => item.toLowerCase() === normalized) || 'Tunis';
};

const getCityBoundingBox = (city = 'Tunis') => CITY_BBOXES[toCityKey(city)] || CITY_BBOXES.Tunis;
const getHotelImageFallback = (city = 'Tunis') => CITY_FALLBACK_IMAGES[toCityKey(city)] || DEFAULT_HOTEL_IMAGE;

const getDefaultDates = () => {
  const now = new Date();
  const checkInDate = new Date(now);
  checkInDate.setDate(now.getDate() + 3);

  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkInDate.getDate() + 1);

  const toIsoDate = (value) => value.toISOString().split('T')[0];

  return {
    checkin: toIsoDate(checkInDate),
    checkout: toIsoDate(checkOutDate),
  };
};

const normalizeName = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(hotel|resort|spa|suites|suite|beach|thalasso|club|apart|appart|the|and|by)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getTokens = (value = '') => normalizeName(value).split(' ').filter(Boolean);

const getOverlapScore = (left = '', right = '') => {
  const leftTokens = getTokens(left);
  const rightTokens = getTokens(right);
  if (!leftTokens.length || !rightTokens.length) return 0;

  const rightSet = new Set(rightTokens);
  const shared = leftTokens.filter((token) => rightSet.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? shared / union : 0;
};

const getNameSimilarity = (left = '', right = '') => {
  const normalizedLeft = normalizeName(left);
  const normalizedRight = normalizeName(right);

  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;
  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) return 0.82;

  return getOverlapScore(left, right);
};

const getStableHash = (value = '') =>
  Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);

const getFallbackRating = (seed) => (3.5 + ((seed % 16) / 10)).toFixed(1);

const getAvailability = (seed) => {
  const roomsLeft = (seed % 5) + 1;
  return {
    availabilityCount: roomsLeft,
    availabilityLabel: roomsLeft < 3 ? `Only ${roomsLeft} rooms left` : 'Available',
  };
};

const getDisplayPrice = (value, currency = 'USD') => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return {
      price: 'N/A',
      price_numeric: null,
      displayPrice: 'N/A',
      currency,
    };
  }

  return {
    price: numericValue,
    price_numeric: numericValue,
    displayPrice: `${numericValue.toLocaleString('fr-FR')} ${currency}`,
    currency,
  };
};

const createDescription = (name, city) =>
  `${name || 'This hotel'} is a comfortable hotel located in a prime area of ${city || 'Tunisia'}, offering modern amenities and great service.`;

const formatAmenities = (amenities = DEFAULT_AMENITIES) =>
  amenities.map((name) => ({
    name,
    icon:
      name === 'WiFi'
        ? 'fas fa-wifi'
        : name === 'Pool'
          ? 'fas fa-swimming-pool'
          : name === 'Breakfast'
            ? 'fas fa-coffee'
            : 'fas fa-parking',
  }));

const getMakcorpsHotelName = (hotel) =>
  hotel?.hotel_name ||
  hotel?.name ||
  hotel?.hotelName ||
  hotel?.title ||
  '';

const getMakcorpsHotelPrice = (hotel) =>
  hotel?.price1 ??
  hotel?.price ??
  hotel?.vendor1?.price ??
  hotel?.vendor_1?.price ??
  null;

const findMakcorpsMatch = (bookingHotel, makcorpsHotels) => {
  const bookingName = bookingHotel?.hotel_name || bookingHotel?.name || '';
  let bestMatch = null;
  let bestScore = 0;

  makcorpsHotels.forEach((hotel) => {
    const score = getNameSimilarity(bookingName, getMakcorpsHotelName(hotel));
    if (score > bestScore) {
      bestScore = score;
      bestMatch = hotel;
    }
  });

  return bestScore >= 0.42 ? bestMatch : null;
};

const formatBookingHotel = (bookingHotel, matchedMakcorps, city) => {
  const seed = getStableHash(`${bookingHotel?.hotel_id || bookingHotel?.hotel_name}${city}`);
  const rating = bookingHotel?.review_score || bookingHotel?.reviewScore || getFallbackRating(seed);
  const priceInfo = getDisplayPrice(getMakcorpsHotelPrice(matchedMakcorps), 'USD');
  const availability = getAvailability(seed);

  return {
    id: bookingHotel?.hotel_id || `booking-${seed}`,
    name: bookingHotel?.hotel_name || getMakcorpsHotelName(matchedMakcorps) || 'Hotel',
    title: bookingHotel?.hotel_name || getMakcorpsHotelName(matchedMakcorps) || 'Hotel',
    price: priceInfo.price ?? 'N/A',
    price_numeric: priceInfo.price_numeric,
    displayPrice: priceInfo.displayPrice,
    currency: priceInfo.currency,
    rating: Number(rating),
    image: bookingHotel?.main_photo_url || bookingHotel?.photo_main_url || getHotelImageFallback(city),
    location: bookingHotel?.address || city || 'Tunisia',
    city,
    amenities: DEFAULT_AMENITIES,
    amenityItems: formatAmenities(DEFAULT_AMENITIES),
    description: createDescription(bookingHotel?.hotel_name, city),
    availability: availability.availabilityCount,
    availabilityLabel: availability.availabilityLabel,
    source: 'Booking + MakCorps',
    booking_source: 'MakCorps + Booking API',
    rawBookingHotel: bookingHotel,
    rawMakcorpsHotel: matchedMakcorps || null,
  };
};

const formatMakcorpsOnlyHotel = (hotel, city) => {
  const name = getMakcorpsHotelName(hotel) || 'Hotel';
  const seed = getStableHash(`${name}${city}`);
  const rating = hotel?.rating || getFallbackRating(seed);
  const priceInfo = getDisplayPrice(getMakcorpsHotelPrice(hotel), 'USD');
  const availability = getAvailability(seed);

  return {
    id: hotel?.hotelId || hotel?.hotel_id || `makcorps-${seed}`,
    name,
    title: name,
    price: priceInfo.price ?? 'N/A',
    price_numeric: priceInfo.price_numeric,
    displayPrice: priceInfo.displayPrice,
    currency: priceInfo.currency,
    rating: Number(rating),
    image: getHotelImageFallback(city),
    location: city || 'Tunisia',
    city,
    amenities: DEFAULT_AMENITIES,
    amenityItems: formatAmenities(DEFAULT_AMENITIES),
    description: createDescription(name, city),
    availability: availability.availabilityCount,
    availabilityLabel: availability.availabilityLabel,
    source: 'MakCorps only',
    booking_source: 'MakCorps only',
    rawMakcorpsHotel: hotel,
  };
};

const formatManualHotel = (hotel) => {
  const seed = getStableHash(`${hotel.name}${hotel.city}`);
  const priceInfo = getDisplayPrice(hotel.base_price, hotel.currency || 'USD');
  const availability = getAvailability(seed);
  const amenityNames = Array.isArray(hotel.amenities) && hotel.amenities.length ? hotel.amenities : DEFAULT_AMENITIES;

  return {
    id: `manual-${hotel.id}`,
    manual_id: hotel.id,
    name: hotel.name,
    title: hotel.name,
    price: priceInfo.price ?? 'N/A',
    price_numeric: priceInfo.price_numeric,
    displayPrice: priceInfo.displayPrice,
    currency: priceInfo.currency,
    rating: Number(hotel.rating || getFallbackRating(seed)),
    image: hotel.image_url || getHotelImageFallback(hotel.city),
    location: hotel.address ? `${hotel.city}, ${hotel.address}` : hotel.city,
    city: hotel.city,
    amenities: amenityNames,
    amenityItems: formatAmenities(amenityNames),
    description: hotel.description || createDescription(hotel.name, hotel.city),
    availability: availability.availabilityCount,
    availabilityLabel: hotel.availability || availability.availabilityLabel,
    source: 'Manual catalog',
    booking_source: 'Manual catalog',
    rawManualHotel: hotel,
  };
};

const dedupeHotels = (hotels) => {
  const map = new Map();

  hotels.forEach((hotel) => {
    const key = `${normalizeName(hotel.name)}-${(hotel.city || '').toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, hotel);
      return;
    }

    const current = map.get(key);
    if (!current.price_numeric && hotel.price_numeric) {
      map.set(key, { ...current, ...hotel });
    }
  });

  return [...map.values()];
};

export const getMergedHotels = async ({
  city = 'Tunis',
  page = 1,
  pageSize = 6,
  checkin,
  checkout,
  adults = 2,
  rooms = 1,
} = {}) => {
  const safeCity = toCityKey(city || 'Tunis');
  const dates = checkin && checkout ? { checkin, checkout } : getDefaultDates();

  let bookingData = [];
  let bookingMeta = { total: 0 };
  let makcorpsData = [];
  let manualData = [];
  const warnings = [];
  const sources = {
    booking: false,
    makcorps: false,
    manual: false,
  };

  try {
    const bookingResponse = await getHotelsFromBookingAPI({
      city: safeCity,
      bbox: getCityBoundingBox(safeCity),
      page,
      pageSize,
      checkin: dates.checkin,
      checkout: dates.checkout,
      adults,
      rooms,
      currency: 'USD',
    });
    bookingData = bookingResponse.hotels || [];
    bookingMeta = bookingResponse;
    sources.booking = bookingData.length > 0;
  } catch (error) {
    warnings.push('Booking API is unavailable, showing fallback hotels.');
  }

  try {
    const cityResult = await getCityId(safeCity);
    const makcorpsResponse = await getHotelsFromMakCorps({
      cityId: cityResult.cityId,
      page: Math.max(0, page - 1),
      rooms,
      adults,
      currency: 'USD',
      checkin: dates.checkin,
      checkout: dates.checkout,
    });
    makcorpsData = makcorpsResponse.hotels || [];
    sources.makcorps = makcorpsData.length > 0;
  } catch (error) {
    warnings.push('MakCorps pricing is unavailable, hotels may appear without prices.');
  }

  try {
    const manualResponse = await getManualHotels({ city: safeCity });
    manualData = manualResponse.hotels || [];
    sources.manual = manualData.length > 0;
  } catch (error) {
    warnings.push('Manual hotel catalog could not be loaded.');
  }

  let mergedHotels = [];

  if (bookingData.length > 0) {
    // Booking is the primary source of truth for hotel structure.
    // MakCorps is used only to enrich each Booking hotel with a matched price.
    mergedHotels = bookingData.map((bookingHotel) =>
      formatBookingHotel(bookingHotel, findMakcorpsMatch(bookingHotel, makcorpsData), safeCity)
    );
  } else if (makcorpsData.length > 0) {
    // If Booking is unavailable, we still keep the UI alive with MakCorps-only entries.
    mergedHotels = makcorpsData.map((hotel) => formatMakcorpsOnlyHotel(hotel, safeCity));
  }

  // Manual admin hotels stay available alongside API hotels.
  // They are injected on the first page to avoid repeating the same manual entries on every page.
  const manualHotels = page === 1 ? manualData.map(formatManualHotel) : [];
  const dedupedHotels = dedupeHotels([...manualHotels, ...mergedHotels]);

  const totalFromApis = bookingData.length > 0
    ? Number(bookingMeta.total) || bookingData.length
    : dedupedHotels.length;
  const total = bookingData.length > 0
    ? Math.max(dedupedHotels.length, totalFromApis + manualHotels.length)
    : dedupedHotels.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pagedHotels = dedupedHotels.slice(0, pageSize);

  return {
    hotels: pagedHotels,
    page,
    pageSize,
    total,
    totalPages,
    checkin: dates.checkin,
    checkout: dates.checkout,
    warnings,
    sources,
  };
};
