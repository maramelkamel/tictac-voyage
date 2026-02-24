import { filterOptions } from "../../../data/data"

const FilterSidebar = ({filters, setFilters, resetFilters}) => {
  return (
    <aside className="filter-sidebar">
      <h3>Filtres</h3>

      {/* Tri */}
      <div className="filter-block">
        <h4>Trier par</h4>
        <select 
          className="form-input"
          value={filters.sortBy}
          onChange={e => setFilters({...filters, sortBy: e.target.value})}
        >
          {filterOptions.sortOptions.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      {/* Plage de prix */}
      <div className="filter-block">
        <h4>Prix maximum : {filters.maxPrice}€</h4>
        <input 
          type="range" 
          min="50" 
          max="1000" 
          className="range-input"
          value={filters.maxPrice}
          onChange={e => setFilters({...filters, maxPrice: Number(e.target.value)})}
        />
        <div className="price-range-values">
          <span>50€</span>
          <span>1000€+</span>
        </div>
      </div>

      {/* Classe de voyage */}
      <div className="filter-block">
        <h4>Classe de voyage</h4>
        {filterOptions.classes.map(classe => (
          <label key={classe} className="filter-checkbox">
            <input 
              type="radio" 
              name="classe" 
              checked={filters.class === classe}
              onChange={() => setFilters({...filters, class: classe})}
            />
            {classe}
          </label>
        ))}
      </div>

      {/* Options */}
      <div className="filter-block">
        <h4>Options</h4>
        <label className="filter-checkbox">
          <input 
            type="checkbox" 
            checked={filters.onlyDirect}
            onChange={e => setFilters({...filters, onlyDirect: e.target.checked})}
          />
          Vols directs uniquement
        </label>
        <label className="filter-checkbox">
          <input 
            type="checkbox" 
            checked={filters.baggageIncluded}
            onChange={e => setFilters({...filters, baggageIncluded: e.target.checked})}
          />
          Bagage inclus
        </label>
        <label className="filter-checkbox">
          <input 
            type="checkbox" 
            checked={filters.freeCancel}
            onChange={e => setFilters({...filters, freeCancel: e.target.checked})}
          />
          Annulation gratuite
        </label>
      </div>

      <button className="reset-filters-btn" onClick={resetFilters}>
        Réinitialiser les filtres
      </button>
    </aside>
  )
}
export default FilterSidebar