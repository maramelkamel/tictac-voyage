import { FaChevronRight, FaSuitcaseRolling, FaBan } from "react-icons/fa"

const FlightCard = ({flight, isSelected, onSelectFlight}) => {
  return (
    <div 
      className={`flight-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectFlight(flight)}
    >
      <div className="flight-card-header">
        {/* Image de la destination */}
        <img src={flight.destinationImage} alt={flight.to} className="card-image" />

        <div className="flight-card-content">
          <div className="flight-header-row">
            <div className="company-info">
              <img src={flight.companyLogo} alt={flight.company} />
              <span style={{fontWeight: 500, color: 'var(--gray-700)'}}>{flight.company}</span>
            </div>
            <span className="badge-promo">{flight.promo}</span>
          </div>

          <div className="flight-route-row">
            <div>
              <div className="flight-time">{flight.departureTime}</div>
              <div className="flight-city">{flight.from}</div>
            </div>

            <div className="route-separator">
              <FaChevronRight size={14} />
              <span style={{fontSize: '0.75rem'}}>{flight.duration}</span>
              {!flight.isDirect && <span style={{fontSize: '0.7rem', color: 'var(--gray-400)'}}>1 escale</span>}
            </div>

            <div>
              <div className="flight-time">{flight.arrivalTime}</div>
              <div className="flight-city">{flight.to}</div>
            </div>

            <div className="flight-price">
              <div className="price-value">{flight.price}€</div>
              <span style={{fontSize: '0.8rem', color: 'var(--gray-400)'}}>par personne</span>
            </div>
          </div>

          <div className="flight-footer-row">
            <div className="flight-specs">
              <span className="spec-badge">
                {flight.baggageIncluded ? <FaSuitcaseRolling /> : <FaBan />} 
                {flight.baggageIncluded ? "Bagage inclus" : "Bagage payant"}
              </span>
              <span className="spec-badge">
                {flight.freeCancel ? <FaBan /> : <FaBan />}
                {flight.freeCancel ? "Annulation gratuite" : "Annulation payante"}
              </span>
            </div>
            <span style={{color: 'var(--secondary)', fontWeight: 500, fontSize: '0.9rem'}}>{flight.classe}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FlightCard