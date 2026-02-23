export const hotelsData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    name: 'Royal Azur Thalasso Golf',
    title: 'Royal Azur Thalasso Golf',
    city: 'Hammamet',
    location: 'Hammamet, Tunisie',
    description: 'Vue mer panoramique, accès direct plage, centre thalasso, piscines chauffées et animation.',
    rating: 9.2,
    stars: 5,
    badge: 'Populaire',
    badgeType: 'default',
    amenities: [
      { icon: 'fas fa-wifi', name: 'WiFi' },
      { icon: 'fas fa-swimming-pool', name: 'Piscine' },
      { icon: 'fas fa-spa', name: 'Spa' },
      { icon: 'fas fa-utensils', name: 'Restaurant' },
    ],
    features: ["WiFi", "Piscine chauffée", "Spa & Thalasso", "Accès direct plage", "Restaurant Gastronomique", "Animation"],
    priceOptions: [
      { label: 'LPD', value: 180 },
      { label: 'DP', value: 250 },
      { label: 'PC', value: 320 },
      { label: 'AI', value: 420 },
    ],
    priceFrom: 180,
    basePrice: 180,
    pricing: {
      board: { LP: 0, DP: 70, PC: 140, ALL: 240 },
      roomType: { standard: 0, vue_mer: 50, suite: 150 }
    },
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-6e5c48dc52e3?w=1200&q=80'
    ]
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    name: 'Djerba Paradise Resort',
    title: 'Djerba Paradise Resort',
    city: 'Djerba',
    location: 'Djerba, Tunisie',
    description: 'Complexe familial avec parc aquatique, clubs enfants, restaurants thématiques et spectacles.',
    rating: 8.7,
    stars: 4,
    badge: '-25%',
    badgeType: 'promo',
    amenities: [
      { icon: 'fas fa-wifi', name: 'WiFi' },
      { icon: 'fas fa-water', name: 'Aquapark' },
      { icon: 'fas fa-child', name: 'Kids' },
      { icon: 'fas fa-umbrella-beach', name: 'Plage' },
    ],
    features: ["WiFi", "Aquapark", "Kids Club", "Plage privée", "All Inclusive"],
    priceOptions: [
      { label: 'LPD', value: 145 },
      { label: 'DP', value: 195 },
      { label: 'PC', value: 265 },
      { label: 'AI', value: 350 },
    ],
    priceFrom: 145,
    basePrice: 145,
    pricing: {
      board: { LP: 0, DP: 50, PC: 120, ALL: 205 },
      roomType: { standard: 0, familiale: 80, suite: 120 }
    },
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80'
    ]
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    name: 'Sousse Pearl Marriott',
    title: 'Sousse Pearl Marriott',
    city: 'Sousse',
    location: 'Sousse, Tunisie',
    description: 'Luxe absolu face à la Méditerranée, golf 18 trous, spa et gastronomie raffinée.',
    rating: 9.5,
    stars: 5,
    badge: 'Top Ventes',
    badgeType: 'default',
    amenities: [
      { icon: 'fas fa-wifi', name: 'WiFi' },
      { icon: 'fas fa-golf-ball', name: 'Golf' },
      { icon: 'fas fa-dumbbell', name: 'Fitness' },
      { icon: 'fas fa-concierge-bell', name: 'Butler' },
    ],
    features: ["WiFi Très Haut Débit", "Golf 18 trous", "Centre de Fitness", "Service Butler", "Gastronomie"],
    priceOptions: [
      { label: 'LPD', value: 220 },
      { label: 'DP', value: 290 },
      { label: 'PC', value: 380 },
      { label: 'AI', value: 480 },
    ],
    priceFrom: 220,
    basePrice: 220,
    pricing: {
      board: { LP: 0, DP: 70, PC: 160, ALL: 260 },
      roomType: { standard: 0, vue_mer: 100, suite: 300 }
    },
    gallery: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
      'https://images.unsplash.com/photo-1568310579941-6b6e1e6f3f35?w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80'
    ]
  },
];
