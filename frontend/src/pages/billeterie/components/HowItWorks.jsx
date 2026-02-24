import { FaSearch, FaCheck, FaCreditCard, FaTicketAlt } from "react-icons/fa"
import { stepsData } from "../data"

const HowItWorks = () => {
  const icons = {
    search: <FaSearch />,
    select: <FaCheck />,
    payment: <FaCreditCard />,
    ticket: <FaTicketAlt />
  }

  return (
    <section className="steps-section">
      <h2 className="section-title">Réservez en 4 étapes simples</h2>
      <p className="section-subtitle">Plus besoin de passer des heures à comparer les sites</p>

      <div className="steps-grid">
        {stepsData.map(step => (
          <div key={step.id} className="step-card">
            <div className="step-icon">{icons[step.icon]}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
export default HowItWorks