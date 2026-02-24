// Import des composants globaux comme demandé
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import Chatbot from '../../components/Chatbot.jsx'

// Import des hooks React
import { useState, useMemo } from 'react'

// Import des composants specifiques a la page
import HeroBilleterie from './components/HeroBilleterie.jsx'
import SearchForm from './components/SearchForm.jsx'
import FilterSidebar from './components/FilterSidebar.jsx'
import FlightCard from './components/FlightCard.jsx'
import ReservationSummary from './components/ReservationSummary.jsx'
import HowItWorks from './components/HowItWorks.jsx'

// Import des donnees
import { flightsData } from '../../data/data.js'

// Import des styles
import '../../styles/Billeterie.css'

const Billeterie = () => {
  // ==============================================
  // ETATS GLOBAUX DE LA PAGE
  // ==============================================
  // Etat du formulaire de recherche
  const [searchParams, setSearchParams] = useState({
    departure: "",
    arrival: "",
    dateGo: "",
    dateReturn: "",
    oneWay: false,
    passengers: 1
  })

  // Etat des filtres
  const [filters, setFilters] = useState({
    sortBy: "Meilleur prix",
    maxPrice: 1000,
    class: "Toutes",
    onlyDirect: false,
    baggageIncluded: false,
    freeCancel: false
  })

  // Etat du vol selectionné par l'utilisateur
  const [selectedFlight, setSelectedFlight] = useState(null)

  // ==============================================
  // FONCTIONS
  // ==============================================
  // Fonction de reinitialisation des filtres
  const resetFilters = () => {
    setFilters({
      sortBy: "Meilleur prix",
      maxPrice: 1000,
      class: "Toutes",
      onlyDirect: false,
      baggageIncluded: false,
      freeCancel: false
    })
  }

  // Fonction de soumission de la recherche
  const handleSearch = (e) => {
    e.preventDefault()
    // Vous pouvez connecter cette fonction a votre API de recherche de vols
    console.log("Recherche pour : ", searchParams)
  }

  // Fonction de selection d'un vol
  const onSelectFlight = (flight) => {
    setSelectedFlight(flight)
  }

  // ==============================================
  // FILTRAGE DES VOLS EN FONCTION DES FILTRES APPLIQUES
  // useMemo permet de ne pas recalculer le filtrage a chaque rendu
  // ==============================================
  const filteredFlights = useMemo(() => {
    let result = [...flightsData]

    // Filtre par prix maximum
    result = result.filter(flight => flight.price <= filters.maxPrice)

    // Filtre par classe
    if(filters.class !== "Toutes") {
      result = result.filter(flight => flight.classe === filters.class)
    }

    // Filtre vol direct uniquement
    if(filters.onlyDirect) result = result.filter(flight => flight.isDirect)

    // Filtre bagage inclus
    if(filters.baggageIncluded) result = result.filter(flight => flight.baggageIncluded)

    // Filtre annulation gratuite
    if(filters.freeCancel) result = result.filter(flight => flight.freeCancel)

    // Tri des resultats
    if(filters.sortBy === "Meilleur prix") result.sort((a,b) => a.price - b.price)
    if(filters.sortBy === "Vol le plus rapide") result.sort((a,b) => a.duration.localeCompare(b.duration))

    return result
  }, [filters])

  return (
    <div className="billeterie-page">
      <Navbar />

      <HeroBilleterie />

      <div className="billeterie-container">
        <SearchForm 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={handleSearch}
        />

        {/* Grille principale 3 colonnes */}
        <div className="main-content-grid">
          <FilterSidebar 
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />

          <div className="flights-list">
            <h2>{filteredFlights.length} vols trouvés</h2>
            {filteredFlights.map(flight => (
              <FlightCard 
                key={flight.id} 
                flight={flight}
                isSelected={selectedFlight?.id === flight.id}
                onSelectFlight={onSelectFlight}
              />
            ))}
          </div>

          <ReservationSummary 
            selectedFlight={selectedFlight}
            passengers={searchParams.passengers}
          />
        </div>

        <HowItWorks />
      </div>
      
      <Footer />
      <Chatbot />
    </div>
  )
}

export default Billeterie