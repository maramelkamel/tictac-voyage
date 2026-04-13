import React, { useState } from 'react';
import './SearchForm.css';

/**
 * Composant de formulaire de recherche de vols.
 * Permet à l'utilisateur de spécifier :
 * - Aéroport de départ
 * - Aéroport d'arrivée
 * - Date de départ
 * - Nombre de passagers
 */
const SearchForm = ({ onSearch }) => {
    const [formData, setFormData] = useState({
        origin: 'TUN',
        destination: 'CDG',
        departureDate: new Date().toISOString().split('T')[0],
        passengers: 1,
        tripType: 'oneway' // 'oneway' ou 'roundtrip'
    });

    // Aéroports tunisiens et principaux aéroports de destination
    const airports = {
        'Tunisie': [
            { code: 'TUN', name: 'Tunis Carthage' },
            { code: 'DJE', name: 'Djerba Zarzis' },
            { code: 'SFA', name: 'Sfax Thyna' },
            { code: 'TOE', name: 'Tozeur Nefta' },
            { code: 'TBJ', name: 'Tabarka Ain Draham' }
        ],
        'France': [
            { code: 'CDG', name: 'Paris Charles de Gaulle' },
            { code: 'ORY', name: 'Paris Orly' },
            { code: 'LYS', name: 'Lyon' },
            { code: 'MRS', name: 'Marseille' },
            { code: 'NCE', name: 'Nice' }
        ],
        'Europe': [
            { code: 'FCO', name: 'Rome Fiumicino' },
            { code: 'MAD', name: 'Madrid Barajas' },
            { code: 'FRA', name: 'Francfort' },
            { code: 'AMS', name: 'Amsterdam' },
            { code: 'LHR', name: 'Londres Heathrow' }
        ],
        'Moyen-Orient & Afrique': [
            { code: 'DXB', name: 'Dubaï' },
            { code: 'IST', name: 'Istanbul' },
            { code: 'CAI', name: 'Le Caire' },
            { code: 'CMN', name: 'Casablanca' }
        ]
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwapAirports = () => {
        setFormData(prev => ({
            ...prev,
            origin: prev.destination,
            destination: prev.origin
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Valider les données
        if (formData.origin === formData.destination) {
            alert('Veuillez sélectionner des aéroports différents.');
            return;
        }
        if (new Date(formData.departureDate) < new Date()) {
            alert('Veuillez sélectionner une date future.');
            return;
        }
        // Appeler la fonction de recherche
        onSearch(formData);
    };

    return (
        <form className="search-form" onSubmit={handleSubmit}>
            <div className="form-title">
                <h2>Rechercher un Vol</h2>
                <p>Trouvez les meilleurs tarifs pour votre destination</p>
            </div>

            {/* Type de voyage */}
            <div className="trip-type-selector">
                <label>
                    <input
                        type="radio"
                        name="tripType"
                        value="oneway"
                        checked={formData.tripType === 'oneway'}
                        onChange={handleInputChange}
                    />
                    Aller simple
                </label>
                <label>
                    <input
                        type="radio"
                        name="tripType"
                        value="roundtrip"
                        checked={formData.tripType === 'roundtrip'}
                        onChange={handleInputChange}
                    />
                    Aller-retour
                </label>
            </div>

            {/* Aéroports et dates */}
            <div className="form-row">
                {/* Aéroport de départ */}
                <div className="form-group">
                    <label htmlFor="origin">Départ</label>
                    <select
                        id="origin"
                        name="origin"
                        value={formData.origin}
                        onChange={handleInputChange}
                    >
                        {Object.entries(airports).map(([region, airportList]) => (
                            <optgroup key={region} label={region}>
                                {airportList.map(airport => (
                                    <option key={airport.code} value={airport.code}>
                                        {airport.code} - {airport.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Bouton d'échange */}
                <button
                    type="button"
                    className="swap-button"
                    onClick={handleSwapAirports}
                    title="Échanger les aéroports"
                >
                    ⇄
                </button>

                {/* Aéroport d'arrivée */}
                <div className="form-group">
                    <label htmlFor="destination">Arrivée</label>
                    <select
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                    >
                        {Object.entries(airports).map(([region, airportList]) => (
                            <optgroup key={region} label={region}>
                                {airportList.map(airport => (
                                    <option key={airport.code} value={airport.code}>
                                        {airport.code} - {airport.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Date de départ */}
                <div className="form-group">
                    <label htmlFor="departureDate">Date de départ</label>
                    <input
                        type="date"
                        id="departureDate"
                        name="departureDate"
                        value={formData.departureDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Nombre de passagers */}
                <div className="form-group">
                    <label htmlFor="passengers">Passagers</label>
                    <select
                        id="passengers"
                        name="passengers"
                        value={formData.passengers}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>
                                {num} {num === 1 ? 'passager' : 'passagers'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bouton de recherche */}
            <div className="form-actions">
                <button type="submit" className="search-button">
                    Rechercher des Vols
                </button>
            </div>
        </form>
    );
};

export default SearchForm;
