import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/omrastyle.css';

import VoyageSearchBar from '../../components/VoyageSearchBar';
import VoyageCard      from '../../components/VoyageCard';
import Navbar          from '../../components/Navbar';
import Footer          from '../../components/Footer';

/* ══════════════════════════════════════════════
   MOCK DATA  –  replace with your API call
   ══════════════════════════════════════════════ */
const ALL_VOYAGES = [
  {
    id: 1,
    titre: "Cappadoce & Istanbul — L'Orient Enchanté",
    destination: 'Istanbul · Cappadoce',
    pays: 'Turquie',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=700&q=80',
    prix: 2850,
    duree: '9 jours / 8 nuits',
    rating: 4.9,
    avis: 218,
    badge: 'Best-seller',
    depart: 'Tunis',
    places: 6,
    description:
      "Explorez les paysages lunaires de Cappadoce en montgolfière, puis plongez dans l'effervescence cosmopolite d'Istanbul entre bazars et mosquées ottomanes.",
    programme: [
      'Vol Tunis – Istanbul, arrivée & installation, visite du Grand Bazar',
      'Visite de Sainte-Sophie, Mosquée Bleue, Palais de Topkapi',
      "Croisière sur le Bosphore, dîner au bord de l'eau",
      'Vol Istanbul – Nevşehir, arrivée en Cappadoce',
      'Lever en montgolfière au-dessus des cheminées de fées',
      'Vallée de Göreme, musée en plein air, grottes troglodytes',
      'Randonnée dans la Vallée Rose, coucher de soleil panoramique',
      'Journée libre, souvenirs & céramiques locales',
      'Retour Tunis',
    ],
    inclus: ['Vol A/R', 'Hôtel 5★', 'Petits-déjeuners', 'Transferts', 'Guide', 'Montgolfière'],
    nonInclus: ['Déjeuners & dîners', 'Visas', 'Assurance voyage'],
  },
  {
    id: 2,
    titre: 'Marrakech & Désert du Sahara',
    destination: 'Marrakech · Merzouga',
    pays: 'Maroc',
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=700&q=80',
    prix: 1990,
    duree: '7 jours / 6 nuits',
    rating: 4.8,
    avis: 174,
    badge: 'Coup de cœur',
    depart: 'Tunis',
    places: 12,
    description:
      'Des ruelles colorées de la médina de Marrakech aux dunes dorées du Sahara — une immersion totale dans la magie marocaine.',
    programme: [
      'Arrivée Marrakech, Djemaa el-Fna, dîner aux souks',
      'Palais Bahia, Jardin Majorelle, hammam traditionnel',
      'Route des Kasbahs vers Ouarzazate, paysages du Haut Atlas',
      'Arrivée Merzouga, dromadaire au coucher du soleil',
      'Nuit sous les étoiles en camp berbère, lever de soleil sur les dunes',
      'Retour Marrakech via les gorges du Todra',
      'Shopping, détente & vol retour',
    ],
    inclus: ['Vol A/R', 'Hôtels & riad', 'Petits-déjeuners', 'Nuit désert', 'Dromadaire', 'Guide'],
    nonInclus: ['Repas du soir', 'Entrées musées', 'Pourboires'],
  },
  {
    id: 3,
    titre: 'Dubaï — Luxe & Futur',
    destination: 'Dubaï · Abu Dhabi',
    pays: 'Émirats Arabes Unis',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80',
    prix: 3600,
    duree: '6 jours / 5 nuits',
    rating: 4.7,
    avis: 302,
    badge: 'Premium',
    depart: 'Tunis',
    places: 8,
    description:
      "Burj Khalifa, désert en 4×4, plages privées et shopping en or — vivez l'excès futuriste des Émirats dans toute sa splendeur.",
    programme: [
      'Arrivée Dubaï, check-in hôtel 5★ avec vue skyline',
      'Burj Khalifa, Dubai Mall, fontaines nocturnes',
      'Safari désert en 4×4, sandboarding, dîner bédouin',
      'Plage JBR, Dubai Marina, Dubai Frame',
      'Excursion Abu Dhabi — Grande Mosquée Sheikh Zayed, Corniche',
      'Journée libre, shopping & vol retour',
    ],
    inclus: ['Vol A/R', 'Hôtel 5★', 'Petits-déjeuners', 'Transferts', 'Safari désert', 'Guide francophone'],
    nonInclus: ['Repas', 'Activités optionnelles', 'Assurance'],
  },
  {
    id: 4,
    titre: 'Santorin & Mykonos — Îles Grecques',
    destination: 'Santorin · Mykonos',
    pays: 'Grèce',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80',
    prix: 2450,
    duree: '8 jours / 7 nuits',
    rating: 4.9,
    avis: 189,
    badge: 'Romantique',
    depart: 'Tunis',
    places: 4,
    description:
      'Dômes bleus perchés sur la caldeira, couchers de soleil à Oia, eaux cristallines et tavernes grecques — la Grèce dans toute sa poésie.',
    programme: [
      'Vol Tunis – Athènes, correspondance pour Santorin',
      'Oia, coucher de soleil magique, dîner avec vue caldeira',
      'Excursion bateau caldeira, sources chaudes, plage rouge',
      'Village de Fira, dégustation vins santoriniotes',
      'Ferry Santorin – Mykonos',
      'Little Venice, moutons, plages de party',
      'Détente, shopping, plages secrètes',
      'Retour Tunis via Athènes',
    ],
    inclus: ['Vols & ferry', 'Hôtels', 'Petits-déjeuners', 'Transferts'],
    nonInclus: ['Repas principaux', 'Activités nautiques', 'Visas'],
  },
  {
    id: 5,
    titre: 'Louxor & Assouan — Les Trésors du Nil',
    destination: 'Louxor · Assouan · Abou Simbel',
    pays: 'Égypte',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=700&q=80',
    prix: 2100,
    duree: '8 jours / 7 nuits',
    rating: 4.6,
    avis: 143,
    badge: 'Historique',
    depart: 'Tunis',
    places: 15,
    description:
      'Remontez le temps sur les bords du Nil, entre temples pharaoniques, croisière fluviale et le mystère intemporel des sphinx et obélisques.',
    programme: [
      'Vol Tunis – Louxor, visite Karnak by night',
      "Vallée des Rois, Temple d'Hatchepsout, colosses de Memnon",
      'Embarquement croisière Nil, Louxor – Esna',
      'Temple de Kom Ombo & Edfu, navigation',
      'Arrivée Assouan, Temple de Philae, barrage',
      'Vol Assouan – Abou Simbel, temple de Ramsès II',
      'Souk nubien, coucher de soleil sur le Nil',
      'Retour Tunis',
    ],
    inclus: ['Vols', 'Croisière 5★', 'Pension complète bord', 'Visites & guide', 'Transferts'],
    nonInclus: ['Visa Égypte (25 USD)', 'Pourboires', 'Dépenses personnelles'],
  },
  {
    id: 6,
    titre: 'Maldives — Paradis sur Eau',
    destination: 'Atoll de Malé',
    pays: 'Maldives',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=700&q=80',
    prix: 5800,
    duree: '7 jours / 6 nuits',
    rating: 5.0,
    avis: 97,
    badge: 'Luxe absolu',
    depart: 'Tunis',
    places: 3,
    description:
      'Bungalows sur pilotis, lagon turquoise, plongée avec les raies mantas — les Maldives sont le summum du voyage de rêve accessible depuis la Tunisie.',
    programme: [
      'Vol Tunis – Dubaï – Malé, transfert en hydravion vers le resort',
      "Snorkeling, massage spa sur l'eau",
      'Plongée avec les raies mantas et les tortues',
      'Pique-nique sur île déserte & pêche traditionnelle',
      'Journée découverte village local maldivien',
      'Coucher de soleil en catamaran, dîner pieds dans le sable',
      'Retour Tunis',
    ],
    inclus: ['Vols A/R', 'Hydravion', 'Bungalow sur pilotis', 'Pension complète', 'Snorkeling', 'Spa'],
    nonInclus: ['Plongée certifiée', 'Alcool', 'Excursions premium'],
  },
];

const FILTERS = ['Tous', 'Mer', 'Culture', 'Désert', 'Luxe', 'Famille'];

/* ══════════════════════════════════════════════ */

const VoyagesOrganise = () => {
  const navigate = useNavigate();
  const [search, setSearch]       = useState({ destination: '', date: '', personnes: '2' });
  const [activeFilter, setFilter] = useState('Tous');

  const displayed = useMemo(() => {
    return ALL_VOYAGES.filter(v => {
      if (search.destination && !v.pays.toLowerCase().includes(search.destination)) return false;
      return true;
    });
  }, [search]);

  const handleDetails  = (voyage) => navigate(`/VoyagesOrganise/Detail/${voyage.id}`,  { state: { voyage } });
  const handleReserver = (voyage) => navigate(`/VoyagesOrganise/Reserver/${voyage.id}`, { state: { voyage } });

  return (
    <div>
      <Navbar />

      {/* ── Hero ── */}
      <section className="omra-hero">
        <div
          className="omra-hero__bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80')" }}
        />
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />

        <div className="omra-hero__content">
          <span className="omra-hero__tag">
            ✈️ Agence de voyages organisés
          </span>
          <h1 className="omra-hero__title">
            Découvrez le monde,<br />
            <span>sans contraintes</span>
          </h1>
          <p className="omra-hero__subtitle">
            Des séjours clé en main conçus par nos experts pour vous offrir l'expérience parfaite.
          </p>

          <div className="omra-hero__search-wrapper">
            <VoyageSearchBar onSearch={setSearch} />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="omra-stats">
        <div className="container">
          <div className="omra-stats__grid">
            {[
              { icon: '✈️', value: '50+',   label: 'Destinations' },
              { icon: '👥', value: '12 000+', label: 'Voyageurs satisfaits' },
              { icon: '⭐', value: '4.9/5',  label: 'Note moyenne' },
              { icon: '🏆', value: '15 ans', label: "D'expertise" },
            ].map((s, i) => (
              <div className="omra-stats__item" key={i}>
                <div className="omra-stats__icon">{s.icon}</div>
                <div>
                  <div className="omra-stats__value">{s.value}</div>
                  <div className="omra-stats__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Voyages section ── */}
      <section className="omra-section omra-section--gray">
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Nos voyages</span>
            <h2 className="omra-section__title">Explorez nos séjours organisés</h2>
            <p className="omra-section__desc">
              Chaque voyage est soigneusement préparé pour vous garantir confort, découverte et sérénité.
            </p>
          </div>

          {/* Filters */}
          <div className="omra-filters-bar">
            <div className="omra-filters">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`omra-filter-btn ${activeFilter === f ? 'omra-filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="omra-filters-count">
              <strong>{displayed.length}</strong> voyages disponibles
            </p>
          </div>

          {/* Grid */}
          <div className="omra-cards-grid">
            {displayed.map(v => (
              <VoyageCard
                key={v.id}
                voyage={v}
                onDetails={handleDetails}
                onReserver={handleReserver}
              />
            ))}
          </div>

          {displayed.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                Aucun voyage ne correspond à votre recherche.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VoyagesOrganise;