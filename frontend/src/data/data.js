// ==============================================
// DONNEES DE LA PAGE BILLETTERIE VOLS
// ==============================================

// Liste des vols disponibles
export const flightsData = [
  {
    id: 1,
    from: "Paris CDG",
    to: "Marrakech RAK",
    fromCode: "CDG",
    toCode: "RAK",
    price: 129,
    company: "Royal Air Maroc",
    companyLogo: "https://picsum.photos/id/1/40/40",
    destinationImage: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
    departureTime: "07:15",
    arrivalTime: "09:45",
    duration: "2h30",
    date: "12 Octobre 2024",
    classe: "Economique",
    isDirect: true,
    baggageIncluded: true,
    freeCancel: false,
    promo: "Meilleur prix"
  },
  {
    id: 2,
    from: "Lyon LYS",
    to: "Lisbonne LIS",
    fromCode: "LYS",
    toCode: "LIS",
    price: 89,
    company: "Air France",
    companyLogo: "https://picsum.photos/id/2/40/40",
    destinationImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    departureTime: "18:30",
    arrivalTime: "20:15",
    duration: "1h45",
    date: "18 Octobre 2024",
    classe: "Economique",
    isDirect: true,
    baggageIncluded: false,
    freeCancel: true,
    promo: "Promo Flash"
  },
  {
    id: 3,
    from: "Paris CDG",
    to: "Dubaï DXB",
    fromCode: "CDG",
    toCode: "DXB",
    price: 499,
    company: "Emirates",
    companyLogo: "https://picsum.photos/id/3/40/40",
    destinationImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    departureTime: "14:00",
    arrivalTime: "22:30",
    duration: "6h30",
    date: "05 Novembre 2024",
    classe: "Affaire",
    isDirect: true,
    baggageIncluded: true,
    freeCancel: true,
    promo: "Offre Exclusive"
  },
  {
    id: 4,
    from: "Paris ORY",
    to: "Barcelone BCN",
    fromCode: "ORY",
    toCode: "BCN",
    price: 49,
    company: "Vueling",
    companyLogo: "https://picsum.photos/id/4/40/40",
    destinationImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    departureTime: "09:45",
    arrivalTime: "11:35",
    duration: "1h50",
    date: "22 Octobre 2024",
    classe: "Economique",
    isDirect: true,
    baggageIncluded: false,
    freeCancel: false,
    promo: "Dernier places"
  },
  {
    id: 5,
    from: "Lille LIL",
    to: "New York JFK",
    fromCode: "LIL",
    toCode: "JFK",
    price: 379,
    company: "Delta Air Lines",
    companyLogo: "https://picsum.photos/id/5/40/40",
    destinationImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    departureTime: "11:20",
    arrivalTime: "13:40",
    duration: "7h20",
    date: "15 Decembre 2024",
    classe: "Premium Economique",
    isDirect: false,
    baggageIncluded: true,
    freeCancel: true,
    promo: "Prix Noel"
  },
  {
    id: 6,
    from: "Marseille MRS",
    to: "Istanbul IST",
    fromCode: "MRS",
    toCode: "IST",
    price: 119,
    company: "Turkish Airlines",
    companyLogo: "https://picsum.photos/id/6/40/40",
    destinationImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
    departureTime: "16:10",
    arrivalTime: "19:45",
    duration: "2h35",
    date: "28 Octobre 2024",
    classe: "Economique",
    isDirect: true,
    baggageIncluded: true,
    freeCancel: false,
    promo: "Meilleur prix"
  }
]

// Options des filtres
export const filterOptions = {
  classes: ["Toutes", "Economique", "Premium Economique", "Affaire", "Première"],
  companies: ["Toutes", "Air France", "Royal Air Maroc", "Emirates", "Vueling", "Turkish Airlines"],
  sortOptions: ["Meilleur prix", "Vol le plus rapide", "Horaire de départ", "Horaire d'arrivée"]
}

// Etapes de réservation
export const stepsData = [
  {
    id: 1,
    icon: "search",
    title: "Recherchez votre vol",
    description: "Indiquez votre destination, vos dates et le nombre de passagers."
  },
  {
    id: 2,
    icon: "select",
    title: "Choisissez votre vol",
    description: "Comparez les offres et selectionnez le vol qui vous correspond."
  },
  {
    id: 3,
    icon: "payment",
    title: "Payez en sécurité",
    description: "Remplissez les informations des passagers et payez en toute sécurité."
  },
  {
    id: 4,
    icon: "ticket",
    title: "Recevez votre billet",
    description: "Votre billet électronique vous est envoyé immédiatement par email."
  },
]