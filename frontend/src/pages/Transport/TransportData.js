// Données pour les véhicules
export const vehiclesData = [
  {
    id: 'voiture',
    name: "Voiture Berline",
    capacity: { min: 1, max: 3 },
    luggage: 3,
    icon: "🚗",
    features: ["Climatisation", "WiFi", "Eau minérale offerte"],
    description: "Idéal pour les couples ou voyageurs solo"
  },
  {
    id: 'minibus',
    name: "Minibus",
    capacity: { min: 4, max: 15 },
    luggage: 15,
    icon: "🚐",
    features: ["Climatisation", "WiFi", "Sièges confortables", "Espace bagages"],
    description: "Parfait pour les familles et petits groupes"
  },
  {
    id: 'bus',
    name: "Bus",
    capacity: { min: 16, max: 50 },
    luggage: 50,
    icon: "🚌",
    features: ["Climatisation", "Micro", "Espace bagages XL", "Confort premium"],
    description: "Pour les grands groupes et événements"
  }
];

// Villes tunisiennes
export const tunisianCities = [
  "Tunis", "Sousse", "Hammamet", "Monastir", "Djerba", 
  "Tozeur", "Kairouan", "Sfax", "Bizerte", "Tabarka",
  "Nabeul", "Mahdia", "Gabès", "Tataouine", "Douz"
];

// Avantages
export const advantagesData = [
  {
    icon: "👨‍✈️",
    title: "Chauffeurs professionnels",
    description: "Bilingues français/arabe, formés et courtois"
  },
  {
    icon: "🚗",
    title: "Véhicules récents",
    description: "Flotte moderne, climatisée et entretenue"
  },
  {
    icon: "⏱️",
    title: "Ponctualité garantie",
    description: "Suivi GPS et respect des horaires"
  },
  {
    icon: "💰",
    title: "Prix transparents",
    description: "Devis gratuit, sans surprise ni frais cachés"
  },
  {
    icon: "✈️",
    title: "Suivi des vols",
    description: "Adaptation en cas de retard d'avion"
  },
  {
    icon: "👶",
    title: "Équipements bébé",
    description: "Sièges auto disponibles sur demande"
  }
];

// FAQ
export const faqData = [
  {
    question: "Comment fonctionne la demande de devis ?",
    answer: "Remplissez le formulaire avec vos besoins. Notre équipe vous contacte sous 24h avec une proposition de prix détaillée et sans engagement."
  },
  {
    question: "Puis-je modifier ou annuler ma réservation ?",
    answer: "Oui, toute modification ou annulation est gratuite jusqu'à 48h avant le transfert. Au-delà, des frais peuvent s'appliquer."
  },
  {
    question: "Les chauffeurs parlent-ils français ?",
    answer: "Oui, tous nos chauffeurs sont bilingues français/arabe. Sur demande, nous pouvons fournir des chauffeurs parlant anglais, allemand ou italien."
  },
  {
    question: "Comment se passe le paiement ?",
    answer: "Le paiement s'effectue directement au chauffeur en espèces (Dinars tunisiens ou Euros) ou par virement bancaire préalable. Pas de paiement en ligne."
  },
  {
    question: "Que se passe-t-il si mon vol a du retard ?",
    answer: "Nous suivons votre vol en temps réel. En cas de retard, votre chauffeur sera informé et adaptera son heure d'arrivée sans frais supplémentaires."
  }
];
