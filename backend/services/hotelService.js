const axios = require('axios');

const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY || 'demo';
const BASE_URL = 'https://api.geoapify.com/v2/places';

// City popularity score (affects price)
const CITY_POPULARITY = {
  paris: 1.8, london: 1.9, dubai: 2.0, istanbul: 1.5, rome: 1.6,
  barcelona: 1.6, amsterdam: 1.5, new_york: 2.2, tokyo: 2.1,
  tunis: 1.0, sousse: 1.1, djerba: 1.2, hammamet: 1.1,
  marrakech: 1.4, cairo: 1.2, default: 1.0,
};

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
  'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800',
];

function simulateHotelPrice(city, stars, popularity) {
  const cityKey = city?.toLowerCase().replace(/\s+/g, '_') || 'default';
  const pop = CITY_POPULARITY[cityKey] || CITY_POPULARITY['default'];
  const starBase = { 1: 30, 2: 55, 3: 90, 4: 150, 5: 280 };
  const base = starBase[stars] || 90;
  const demand = 0.85 + Math.random() * 0.3; // ±15% demand factor
  return Math.round(base * pop * demand * (popularity || 1));
}

function generateRating(stars) {
  const base = stars ? Math.min(5, stars * 0.8 + 0.5) : 3.5;
  return Math.round((base + Math.random() * 0.8 - 0.3) * 10) / 10;
}

function transformGeoapifyHotel(place, index, city) {
  const props = place.properties || {};
  const stars = props.datasource?.raw?.stars || props.facilities?.stars || Math.ceil(2 + Math.random() * 3);
  const rating = generateRating(stars);
  const reviews = Math.floor(20 + Math.random() * 500);

  return {
    id: props.place_id || `hotel-${index}`,
    name: props.name || `Hôtel ${city} ${index + 1}`,
    address: props.formatted || props.street || `${city}`,
    city: props.city || props.county || city,
    country: props.country || '',
    lat: place.geometry?.coordinates?.[1] || null,
    lng: place.geometry?.coordinates?.[0] || null,
    stars: Math.min(5, Math.max(1, stars)),
    rating,
    reviews,
    image: HOTEL_IMAGES[index % HOTEL_IMAGES.length],
    amenities: generateAmenities(stars),
    price: {
      perNight: simulateHotelPrice(city, stars, rating / 5),
      currency: 'TND',
      breakfast: Math.random() > 0.5,
    },
    category: props.categories?.[0] || 'accommodation.hotel',
    phone: props.datasource?.raw?.phone || null,
    website: props.datasource?.raw?.website || null,
  };
}

function generateAmenities(stars) {
  const base = ['WiFi', 'Climatisation', 'Réception 24h'];
  const mid = ['Piscine', 'Restaurant', 'Parking', 'Salle de sport'];
  const lux = ['Spa', 'Concierge', 'Room Service', 'Bar'];
  
  const amenities = [...base];
  if (stars >= 3) amenities.push(...mid.slice(0, Math.floor(stars)));
  if (stars >= 4) amenities.push(...lux.slice(0, stars - 3));
  return amenities;
}

// Fallback mock hotels
function generateMockHotels(city, count = 8) {
  const hotelNames = [
    `Grand Hôtel ${city}`, `Hôtel Royal ${city}`, `Le Méridien ${city}`,
    `Hôtel du Lac ${city}`, `Palace ${city}`, `Résidence ${city}`,
    `Hôtel Azur ${city}`, `Le Belvédère ${city}`, `Hôtel Médina ${city}`,
  ];

  return Array.from({ length: Math.min(count, hotelNames.length) }, (_, i) => {
    const stars = Math.ceil(2 + Math.random() * 3);
    const rating = generateRating(stars);
    return {
      id: `mock-${city}-${i}`,
      name: hotelNames[i],
      address: `${Math.floor(1 + Math.random() * 200)} Rue ${['Principale', 'des Fleurs', 'du Commerce', 'de la Paix'][i % 4]}, ${city}`,
      city,
      country: 'Tunisie',
      lat: 36.8 + (Math.random() - 0.5) * 0.2,
      lng: 10.18 + (Math.random() - 0.5) * 0.2,
      stars,
      rating,
      reviews: Math.floor(20 + Math.random() * 500),
      image: HOTEL_IMAGES[i % HOTEL_IMAGES.length],
      amenities: generateAmenities(stars),
      price: {
        perNight: simulateHotelPrice(city, stars, rating / 5),
        currency: 'TND',
        breakfast: Math.random() > 0.5,
      },
      category: 'accommodation.hotel',
      phone: null,
      website: null,
    };
  });
}

async function searchHotels({ city, checkIn, checkOut, guests = 1, stars: filterStars }) {
  try {
    if (GEOAPIFY_KEY === 'demo') throw new Error('Demo mode');

    // Geocode city first
    const geoRes = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: { text: city, apiKey: GEOAPIFY_KEY, limit: 1 },
      timeout: 5000,
    });

    const loc = geoRes.data?.features?.[0]?.geometry?.coordinates;
    if (!loc) throw new Error('City not found');

    const [lon, lat] = loc;
    const { data } = await axios.get(BASE_URL, {
      params: {
        categories: 'accommodation.hotel,accommodation.hostel,accommodation.resort',
        filter: `circle:${lon},${lat},10000`,
        bias: `proximity:${lon},${lat}`,
        limit: 20,
        apiKey: GEOAPIFY_KEY,
      },
      timeout: 8000,
    });

    let hotels = (data?.features || []).map((f, i) => transformGeoapifyHotel(f, i, city));
    if (filterStars) hotels = hotels.filter(h => h.stars === parseInt(filterStars));
    return hotels.length > 0 ? hotels : generateMockHotels(city);
  } catch (err) {
    console.error('Geoapify error, using mock data:', err.message);
    return generateMockHotels(city);
  }
}

async function getPopularDestinations() {
  return [
    { city: 'Tunis', country: 'Tunisie', image: 'https://images.unsplash.com/photo-1539667534952-b6a30f4a31fe?w=600', priceFrom: 85, flag: '🇹🇳' },
    { city: 'Djerba', country: 'Tunisie', image: 'https://images.unsplash.com/photo-1539666452-94e6c11a22ac?w=600', priceFrom: 120, flag: '🇹🇳' },
    { city: 'Marrakech', country: 'Maroc', image: 'https://images.unsplash.com/photo-1553708881-112a574ef8ac?w=600', priceFrom: 180, flag: '🇲🇦' },
    { city: 'Istanbul', country: 'Turquie', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600', priceFrom: 220, flag: '🇹🇷' },
    { city: 'Dubaï', country: 'Émirats', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', priceFrom: 380, flag: '🇦🇪' },
    { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', priceFrom: 420, flag: '🇫🇷' },
  ];
}

module.exports = { searchHotels, getPopularDestinations, generateMockHotels };