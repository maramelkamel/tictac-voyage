const ReservationSummary = ({selectedFlight, passengers}) => {
  // Calcul du prix total
  const taxes = 18
  const totalPrice = selectedFlight ? (selectedFlight.price * passengers) + taxes : null

  if(!selectedFlight) {
    return (
      <aside className="reservation-summary">
        <h3>Résumé de réservation</h3>
        <div className="empty-summary">
          <p>Sélectionnez un vol pour voir le détail de votre réservation</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="reservation-summary">
      <h3>Résumé de réservation</h3>
      <div className="summary-flight-info">
        <div className="summary-route">{selectedFlight.from} ➔ {selectedFlight.to}</div>
        <div className="summary-date">{selectedFlight.date} • {selectedFlight.company} • {selectedFlight.classe}</div>
      </div>

      <div className="summary-price-row">
        <span>Prix billet x {passengers}</span>
        <span>{selectedFlight.price * passengers}€</span>
      </div>
      <div className="summary-price-row">
        <span>Taxes et frais</span>
        <span>{taxes}€</span>
      </div>
      <div className="summary-price-row total">
        <span>Total TTC</span>
        <span>{totalPrice}€</span>
      </div>

      <button className="payment-btn">
        Continuer vers le paiement
      </button>
      <p style={{fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '0.75rem'}}>
        Annulation gratuite disponible sur ce vol
      </p>
    </aside>
  )
}
export default ReservationSummary