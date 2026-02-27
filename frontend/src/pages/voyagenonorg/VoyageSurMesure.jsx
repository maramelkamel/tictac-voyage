import React, { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Chatbot from "../../components/Chatbot";

const initialFormData = {
  destination: "",
  dateDepart: "",
  dateRetour: "",
  voyageurs: 1,
  budget: "",
  inclureHotel: false,
  categorieHotel: "4",
  typeChambre: "Double",
  formuleRepas: "Petit-déjeuner",
  inclureTransport: false,
  typeTransport: "Vol",
  villeDepart: "",
  typeBagage: "Standard",
  inclureGuide: false,
  langueGuide: "Français",
  dureeGuide: "1 jour",
  typeVoyage: "Couple",
  rythmeVoyage: "Équilibré",
  niveauConfort: "Standard",
  interets: [],
  demandesSpeciales: "",
  nomComplet: "",
  email: "",
  telephone: "",
  whatsapp: true,
};

const optionsTypeVoyage = ["Couple", "Famille", "Amis", "Solo"];
const optionsRythme = ["Détente", "Équilibré", "Aventure"];
const optionsConfort = ["Économique", "Standard", "Luxe"];
const optionsInterets = [
  "Plage & Détente",
  "Culture & Monuments",
  "Désert & Safari",
  "Aventure & Sports",
  "Shopping",
  "Gastronomie",
];

const VoyageSurMesure = () => {
  const [formData, setFormData] = useState(initialFormData);
  const formSectionRef = useRef(null);

  const scrollVersFormulaire = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Demande de voyage personnalisé:", formData);
    alert(
      "Votre demande de voyage sur mesure a été envoyée. Un conseiller Tictac Voyage vous contactera rapidement."
    );
  };

  const handleChampChange = (field) => (e) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleInteretToggle = (interet) => {
    setFormData((prev) => ({
      ...prev,
      interets: prev.interets.includes(interet)
        ? prev.interets.filter((i) => i !== interet)
        : [...prev.interets, interet],
    }));
  };

  // Classes réutilisables
  const classeInput =
    "mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent-alpha focus:outline-none transition-all duration-300 ease-out";

  const classeLabel =
    "block text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500";

  return (
    <div className="min-h-screen bg-off-white text-gray-700">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 shadow-md">
        <Navbar />
      </header>

      <main className="pt-0">
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[520px] max-h-[720px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
              alt="Voyage à l'étranger"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/55 to-primary/35" />
          </div>

          <div className="relative z-10 flex h-full items-center">
            <div className="container">
              <div className="max-w-2xl text-white">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-light">
                  Tictac Voyage • Voyage Sur Mesure
                </p>
                <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                  Créez Votre Voyage Personnalisé à l'Étranger
                </h1>
                <p className="mb-8 max-w-xl text-sm sm:text-base text-white/90">
                  Construisez votre propre expérience de voyage, étape par étape. Choisissez librement votre destination, votre rythme et vos envies.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={scrollVersFormulaire} className="btn btn-primary btn-lg">
                    Commencer la planification
                  </button>
                  <button onClick={scrollVersFormulaire} className="btn btn-glass btn-lg text-sm">
                    Voir le formulaire détaillé
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-off-white/95 to-transparent" />
        </section>

        {/* FORMULAIRE & RÉCAPITULATIF */}
        <section id="formulaire-voyage-sur-mesure" ref={formSectionRef} className="py-12 lg:py-16">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              {/* FORMULAIRE */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-md">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Voyage Sur Mesure à l'Étranger
                    </h2>
                    <p className="text-sm text-gray-500">
                      Remplissez les informations pour créer votre voyage totalement personnalisé.
                    </p>
                  </div>

                  {/* A) Informations principales */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">A) Informations principales</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className={classeLabel}>
                          Destination (pays ou ville à l'étranger) <span className="text-accent">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.destination}
                          onChange={handleChampChange("destination")}
                          placeholder="Ex: Bali, New York, Tokyo..."
                          className={classeInput}
                        />
                      </div>
                      <div>
                        <label className={classeLabel}>
                          Nombre de voyageurs <span className="text-accent">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={formData.voyageurs}
                          onChange={handleChampChange("voyageurs")}
                          className={classeInput}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className={classeLabel}>
                          Date de départ <span className="text-accent">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateDepart}
                          onChange={handleChampChange("dateDepart")}
                          className={classeInput}
                        />
                      </div>
                      <div>
                        <label className={classeLabel}>
                          Date de retour <span className="text-accent">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateRetour}
                          onChange={handleChampChange("dateRetour")}
                          className={classeInput}
                        />
                      </div>
                      <div>
                        <label className={classeLabel}>Budget (optionnel, €)</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.budget}
                          onChange={handleChampChange("budget")}
                          placeholder="Budget total approximatif"
                          className={classeInput}
                        />
                      </div>
                    </div>
                  </div>

                  {/* B) Hôtel */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-gray-700">B) Hôtel (optionnel)</h3>
                      <label className="inline-flex items-center gap-3 cursor-pointer">
                        <span className="text-xs font-medium text-gray-600">Inclure l'hôtel</span>
                        <input
                          type="checkbox"
                          checked={formData.inclureHotel}
                          onChange={handleToggle("inclureHotel")}
                          className="peer sr-only"
                        />
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors duration-300 peer-checked:bg-accent-dark">
                          <span className="ml-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-4" />
                        </span>
                      </label>
                    </div>
                    {formData.inclureHotel && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className={classeLabel}>Catégorie d'hôtel</label>
                          <select value={formData.categorieHotel} onChange={handleChampChange("categorieHotel")} className={classeInput}>
                            <option value="3">3 étoiles</option>
                            <option value="4">4 étoiles</option>
                            <option value="5">5 étoiles</option>
                          </select>
                        </div>
                        <div>
                          <label className={classeLabel}>Type de chambre</label>
                          <select value={formData.typeChambre} onChange={handleChampChange("typeChambre")} className={classeInput}>
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Family">Familiale</option>
                          </select>
                        </div>
                        <div>
                          <label className={classeLabel}>Formule de repas</label>
                          <select value={formData.formuleRepas} onChange={handleChampChange("formuleRepas")} className={classeInput}>
                            <option value="Petit-déjeuner">Petit-déjeuner</option>
                            <option value="Demi-pension">Demi-pension</option>
                            <option value="All inclusive">All inclusive</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* C) Transport */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-gray-700">C) Transport (optionnel)</h3>
                      <label className="inline-flex items-center gap-3 cursor-pointer">
                        <span className="text-xs font-medium text-gray-600">Inclure le transport</span>
                        <input
                          type="checkbox"
                          checked={formData.inclureTransport}
                          onChange={handleToggle("inclureTransport")}
                          className="peer sr-only"
                        />
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors duration-300 peer-checked:bg-accent-dark">
                          <span className="ml-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-4" />
                        </span>
                      </label>
                    </div>
                    {formData.inclureTransport && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className={classeLabel}>Type de transport</label>
                          <select value={formData.typeTransport} onChange={handleChampChange("typeTransport")} className={classeInput}>
                            <option value="Vol">Vol</option>
                            <option value="Train">Train</option>
                            <option value="Bus">Bus</option>
                            <option value="Location de voiture">Location de voiture</option>
                          </select>
                        </div>
                        <div>
                          <label className={classeLabel}>Ville de départ {formData.inclureTransport && <span className="text-accent">*</span>}</label>
                          <input
                            type="text"
                            required={formData.inclureTransport}
                            value={formData.villeDepart}
                            onChange={handleChampChange("villeDepart")}
                            placeholder="Ex: Paris, Marseille..."
                            className={classeInput}
                          />
                        </div>
                        <div>
                          <label className={classeLabel}>Type de bagage</label>
                          <select value={formData.typeBagage} onChange={handleChampChange("typeBagage")} className={classeInput}>
                            <option value="Standard">Standard</option>
                            <option value="Extra">Extra</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* D) Guide touristique */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-gray-700">D) Guide touristique (optionnel)</h3>
                      <label className="inline-flex items-center gap-3 cursor-pointer">
                        <span className="text-xs font-medium text-gray-600">Inclure un guide</span>
                        <input
                          type="checkbox"
                          checked={formData.inclureGuide}
                          onChange={handleToggle("inclureGuide")}
                          className="peer sr-only"
                        />
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors duration-300 peer-checked:bg-accent-dark">
                          <span className="ml-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-4" />
                        </span>
                      </label>
                    </div>
                    {formData.inclureGuide && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={classeLabel}>Langue du guide</label>
                          <select value={formData.langueGuide} onChange={handleChampChange("langueGuide")} className={classeInput}>
                            <option value="Français">Français</option>
                            <option value="Anglais">Anglais</option>
                          </select>
                        </div>
                        <div>
                          <label className={classeLabel}>Durée</label>
                          <select value={formData.dureeGuide} onChange={handleChampChange("dureeGuide")} className={classeInput}>
                            <option value="1 jour">1 jour</option>
                            <option value="2–3 jours">2–3 jours</option>
                            <option value="Voyage complet">Voyage complet</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* E) Préférences de voyage */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">E) Préférences de voyage</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Type de voyage", options: optionsTypeVoyage, field: "typeVoyage", color: "accent" },
                        { label: "Rythme du voyage", options: optionsRythme, field: "rythmeVoyage", color: "primary" },
                        { label: "Niveau de confort", options: optionsConfort, field: "niveauConfort", color: "secondary" },
                      ].map((group) => (
                        <div key={group.label}>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                            {group.label}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.options.map((opt) => {
                              const active = formData[group.field] === opt;
                              const colorClass =
                                group.color === "accent"
                                  ? "bg-accent-dark border-accent-dark"
                                  : group.color === "primary"
                                  ? "bg-primary border-primary"
                                  : "bg-secondary border-secondary";
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      [group.field]: opt,
                                    }))
                                  }
                                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                                    active
                                      ? `${colorClass} text-white shadow-sm`
                                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-accent-alpha hover:bg-white"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* F) Centres d'intérêt */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">F) Centres d'intérêt</h3>
                    <p className="text-xs text-gray-500">Sélectionnez vos centres d'intérêt principaux pour ce voyage.</p>
                    <div className="flex flex-wrap gap-2">
                      {optionsInterets.map((interet) => {
                        const selected = formData.interets.includes(interet);
                        return (
                          <button
                            key={interet}
                            type="button"
                            onClick={() => handleInteretToggle(interet)}
                            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                              selected
                                ? "bg-accent-alpha text-gray-800 shadow-sm border-transparent"
                                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-accent-alpha hover:bg-white"
                            }`}
                          >
                            {interet}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* G) Demandes spéciales */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700">G) Demandes spéciales</h3>
                    <textarea
                      rows={4}
                      value={formData.demandesSpeciales}
                      onChange={handleChampChange("demandesSpeciales")}
                      className={classeInput}
                      placeholder="Allergies, occasions spéciales (lune de miel, anniversaire...), activités à éviter ou à privilégier, etc."
                    />
                  </div>

                  {/* H) Informations de contact */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-700">H) Informations de contact</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className={classeLabel}>
                          Nom complet <span className="text-accent">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomComplet}
                          onChange={handleChampChange("nomComplet")}
                          className={classeInput}
                        />
                      </div>
                      <div>
                        <label className={classeLabel}>
                          Téléphone <span className="text-accent">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.telephone}
                          onChange={handleChampChange("telephone")}
                          className={classeInput}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={classeLabel}>
                        Email <span className="text-accent">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChampChange("email")}
                        className={classeInput}
                      />
                    </div>
                    <label className="inline-flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.whatsapp}
                        onChange={handleToggle("whatsapp")}
                        className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent-alpha"
                      />
                      <span className="text-xs text-gray-600">
                        J'accepte d'être contacté(e) sur WhatsApp pour ce voyage.
                      </span>
                    </label>
                  </div>

                  {/* Bouton submit */}
                  <div className="pt-2">
                    <button type="submit" className="btn btn-primary btn-lg w-full">
                      Envoyer ma demande de voyage personnalisé
                    </button>
                    <p className="mt-2 text-[11px] text-center text-gray-400">
                      En cliquant, vous acceptez d'être contacté(e) par un conseiller Tictac Voyage.
                    </p>
                  </div>
                </form>
              </div>

              {/* RÉCAPITULATIF STICKY */}
              <aside className="lg:sticky lg:top-32 self-start">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 shadow-lg">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">
                        Résumé de votre voyage
                      </h2>
                      <p className="text-xs text-gray-500">
                        Mise à jour en temps réel selon vos choix.
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                      Sur mesure
                    </span>
                  </div>

                  <div className="space-y-2 border-b border-gray-100 pb-4 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Aperçu du voyage
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.destination || "Destination non définie"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.dateDepart && formData.dateRetour
                        ? `Du ${formData.dateDepart} au ${formData.dateRetour}`
                        : "Sélectionnez vos dates"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.voyageurs
                        ? `${formData.voyageurs} voyageur${formData.voyageurs > 1 ? "s" : ""}`
                        : "Nombre de voyageurs non précisé"}
                    </p>
                  </div>

                  <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Services inclus
                    </p>
                    <ul className="space-y-2 text-xs text-gray-600">
                      {formData.inclureHotel ? (
                        <li>
                          <span className="font-semibold text-gray-700">Hôtel:</span>{" "}
                          {formData.categorieHotel}★, chambre {formData.typeChambre.toLowerCase()}, {formData.formuleRepas.toLowerCase()}
                        </li>
                      ) : (
                        <li className="text-gray-400">
                          Hôtel non inclus - vous le gérez vous-même.
                        </li>
                      )}
                      {formData.inclureTransport ? (
                        <li>
                          <span className="font-semibold text-gray-700">Transport:</span>{" "}
                          {formData.typeTransport}
                          {formData.villeDepart ? ` depuis ${formData.villeDepart}` : ""},{" "}
                          bagage {formData.typeBagage.toLowerCase()}
                        </li>
                      ) : (
                        <li className="text-gray-400">
                          Transport non inclus - vous êtes flexible.
                        </li>
                      )}
                      {formData.inclureGuide ? (
                        <li>
                          <span className="font-semibold text-gray-700">Guide:</span>{" "}
                          {formData.langueGuide}, {formData.dureeGuide}
                        </li>
                      ) : (
                        <li className="text-gray-400">
                          Pas de guide demandé - vous préférez partir à l'aventure.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Style de voyage
                    </p>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <p>
                        <span className="font-semibold text-gray-700">Type:</span>{" "}
                        {formData.typeVoyage}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Rythme:</span>{" "}
                        {formData.rythmeVoyage}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Confort:</span>{" "}
                        {formData.niveauConfort}
                      </p>
                    </div>
                    {formData.interets.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-gray-500">
                          Intérêts:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.interets.map((interet) => (
                            <span
                              key={interet}
                              className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600"
                            >
                              {interet}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Budget estimé
                    </p>
                    <p className="text-2xl font-semibold text-accent-dark">
                      À définir
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Le prix final sera calculé par votre conseiller Tictac Voyage selon vos choix.
                    </p>
                    {formData.budget && (
                      <p className="text-[11px] text-gray-600">
                        Votre budget max indiqué:{" "}
                        <span className="font-semibold">{formData.budget} €</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button onClick={scrollVersFormulaire} className="btn btn-primary w-full">
                      Trouver mon voyage idéal
                    </button>
                    <p className="text-[11px] text-center text-gray-500">
                      {formData.destination && formData.dateDepart && formData.dateRetour && formData.voyageurs
                        ? "Vous pouvez maintenant envoyer votre demande via le formulaire."
                        : "Complétez d'abord la destination, les dates et le nombre de voyageurs."}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default VoyageSurMesure;