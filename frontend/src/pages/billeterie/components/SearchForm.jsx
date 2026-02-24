import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaChevronRight } from "react-icons/fa"

const SearchForm = ({searchParams, setSearchParams, onSearch}) => {
  return (
    <div className="search-card">
      <form onSubmit={onSearch}>
        <div className="search-form-grid">
          <div className="form-group">
            <label>Ville de départ</label>
            <div className="input-wrapper">
              <FaMapMarkerAlt className="input-icon" />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Paris CDG"
                value={searchParams.departure}
                onChange={e => setSearchParams({...searchParams, departure: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ville d'arrivée</label>
            <div className="input-wrapper">
              <FaMapMarkerAlt className="input-icon" />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Marrakech"
                value={searchParams.arrival}
                onChange={e => setSearchParams({...searchParams, arrival: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Date Aller</label>
            <div className="input-wrapper">
              <FaCalendarAlt className="input-icon" />
              <input 
                type="date" 
                className="form-input"
                value={searchParams.dateGo}
                onChange={e => setSearchParams({...searchParams, dateGo: e.target.value})}
                required
              />
            </div>
          </div>

          {!searchParams.oneWay && (
            <div className="form-group">
              <label>Date Retour</label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input 
                  type="date" 
                  className="form-input"
                  value={searchParams.dateReturn}
                  onChange={e => setSearchParams({...searchParams, dateReturn: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Nombre de passagers</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <select 
                className="form-input"
                value={searchParams.passengers}
                onChange={e => setSearchParams({...searchParams, passengers: Number(e.target.value)})}
              >
                {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} passager{num > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="oneWay" 
            checked={searchParams.oneWay} 
            onChange={(e) => setSearchParams({...searchParams, oneWay: e.target.checked})} 
          />
          <label htmlFor="oneWay">Voyage Aller Simple</label>
        </div>

        <button type="submit" className="cta-search-btn">
          Rechercher mon vol <FaChevronRight />
        </button>
      </form>
    </div>
  )
}
export default SearchForm