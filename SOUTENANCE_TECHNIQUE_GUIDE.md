# Guide de soutenance technique - Tictac Voyage

Ce document sert de support oral pour expliquer l'architecture, le module "voyages organises", les choix techniques, et anticiper les questions du jury.

## 1. Reponses aux questions sensibles

### Pourquoi on utilise parfois des controllers sans model ?

Reponse courte :
Un `model` est utile quand on a une entite metier persistante avec des operations reutilisables sur la base de donnees. Mais parfois, une route ou un controller fait surtout de l'orchestration, de l'agregation ou un traitement technique ponctuel. Dans ce cas, creer un model separe peut ajouter de la complexite inutile.

Reponse detaillee :
- Le controller recoit la requete HTTP, valide les donnees, appelle la logique necessaire et retourne une reponse JSON.
- Le model represente plutot l'acces aux donnees d'une entite : `voyageOrganiseModel`, `voyageReservationModel`, `hotelModel`, etc.
- Quand le code est un simple upload, une route technique, une aggregation de plusieurs tables ou un appel a un service externe, on peut ne pas avoir de model dedie.
- Exemple : `adminStatsRoutes.js` ne manipule pas une table unique `admin_stats`. Il calcule des statistiques a partir de plusieurs tables : clients, reservations, hotels, voyages, circuits, omra, vols, transports.

Phrase pour le jury :
"On ne cree pas un model uniquement pour respecter une forme. On le cree quand il represente une entite ou une logique de donnees reutilisable. Pour les routes d'agregation ou de service technique, on peut garder la logique dans la route ou le controller si elle reste locale et lisible."

### Pourquoi `adminStats` est juste une route ?

Reponse courte :
Parce que `adminStats` n'est pas une ressource CRUD classique. C'est un endpoint d'agregation pour le dashboard admin.

Reponse detaillee :
- Le fichier `backend/routes/adminStatsRoutes.js` expose principalement `GET /api/admin/stats`.
- Il interroge plusieurs tables et construit un objet final :
  - `clients`
  - `reservations`
  - `revenue`
  - `offers`
  - `contacts`
  - `recentReservations`
  - `reservationsByModule`
  - `revenueByMonth`
- Il utilise `information_schema.tables` pour verifier dynamiquement quelles tables existent.
- Il utilise `safe()` et `safeOne()` pour eviter qu'une table manquante casse tout le dashboard.
- Comme il n'y a pas une table `admin_stats`, creer `adminStatsModel` serait discutable. La route joue le role de composition de donnees pour une seule page.

Phrase pour le jury :
"AdminStats est une route de reporting. Elle ne gere pas une entite metier, elle agrege des donnees de plusieurs modules. C'est pour cela qu'elle est directement dans la route, avec des fonctions internes `safe` et `safeOne` pour rendre le dashboard robuste."

## 2. Architecture generale a expliquer

### Frontend

Le frontend est en React avec React Router.

Fichier central :
- `frontend/src/App.jsx`

Role :
- definit les routes publiques : hotels, omra, voyages organises, circuits, transport, vols, contact
- definit les tunnels de reservation : liste -> detail -> reserver -> paiement
- definit les pages admin : dashboard, packages, reservations, clients, promotions

Structure typique d'une page React :
- imports
- constantes API
- states avec `useState`
- chargement avec `useEffect`
- calculs derives avec `useMemo`
- handlers : `handleSubmit`, `handleChange`, `handleDelete`, `handleStatusChange`
- rendu JSX

### Backend

Le backend est en Node.js / Express avec PostgreSQL.

Structure typique :
- `routes` : definit les URLs et les verbes HTTP
- `controllers` : valide la requete, applique les regles metier, retourne JSON
- `models` : execute les requetes SQL
- `utils` : fonctions transversales comme emails, vouchers, media
- `services` : integration externe comme Duffel pour les vols

Exemple voyage organise :
- route : `backend/routes/voyageOrganiseRoutes.js`
- controller : `backend/controllers/voyageOrganiseController.js`
- model : `backend/models/voyageOrganiseModel.js`

## 3. Module voyages organises - cote client frontend

### 3.1 Page liste : `VoyagesOrganise.jsx`

Route :
- `/VoyagesOrganise/VoyagesOrganise`

Role :
Afficher le catalogue public des voyages organises avec recherche, filtres, tri, promotions et favoris.

Fonctions importantes :

`normalize(v)`
- Transforme les noms backend en noms utilisables cote UI.
- Exemple : `title` devient `titre`, `price` devient `prix`, `available_spots` devient `places`.
- Interet : le composant React travaille avec une structure stable, meme si la base utilise d'autres noms.

`useEffect()`
- Charge les voyages depuis `GET /api/voyages-organises?public=true`.
- Charge l'apparence du hero depuis `GET /api/voyages-organises/voyage-covers`.
- Met a jour `loading`, `error`, `voyages`, `cover`.

`displayed = useMemo(...)`
- Filtre et trie les voyages sans refaire d'appel backend.
- Criteres :
  - destination / pays
  - nombre de personnes
  - duree
  - date de depart
  - categorie
  - continent
  - saison
  - budget
- Trie par prix, duree, rating ou popularite.

`clearFilters()`
- Reinitialise les filtres avances.

`clearSearch()`
- Reinitialise la recherche principale.

`handleDetails(voyage)`
- Navigue vers la page detail avec `navigate('/VoyagesOrganise/Detail/:id', { state: { voyage } })`.
- Le `state` evite de recharger immediatement toutes les donnees.

`handleReserver(voyage)`
- Navigue vers la page reservation.

`handleFavoriteToggle(voyage)`
- Verifie si l'utilisateur est connecte.
- Si non connecte : redirection vers `/SignIn`.
- Si connecte : ajoute ou retire le voyage des favoris via `useFavorites`.

Composants utilises :
- `Navbar`
- `Footer`
- `VoyageSearchBar`
- `VoyageCard`
- `SortFilter`
- `AdvancedFilters`
- `PromotionsSection`

Question possible :
"Pourquoi utiliser `useMemo` pour `displayed` ?"

Reponse :
"Parce que le filtrage et le tri peuvent etre recalcules souvent. `useMemo` evite de recalculer inutilement tant que `voyages`, `search`, `filters` ou `sortBy` ne changent pas."

### 3.2 Page detail : `Detail.jsx`

Route :
- `/VoyagesOrganise/Detail/:id`

Role :
Afficher la fiche complete d'un voyage : image, galerie, programme, inclus, non inclus, prix, rating, CTA reservation.

Fonctions importantes :

`normalizeVoyage(voyage)`
- Harmonise les donnees venant soit du state React Router, soit de l'API backend.
- Garde une forme commune pour la page detail.

`buildGallery(mainImage, galleryImages, destination)`
- Utilise les images de la base si elles existent.
- Sinon, construit une galerie de fallback avec des images externes.
- Permet d'eviter une page detail vide visuellement.

`useEffect()`
- Si un `id` existe dans l'URL, recharge le voyage depuis `GET /api/voyages-organises/:id`.
- C'est important si l'utilisateur ouvre directement l'URL sans passer par la liste.

`handleReserver()`
- Envoie vers `/VoyagesOrganise/Reserver/:id`.

`prevPhoto()` et `nextPhoto()`
- Gerent la navigation dans la lightbox de galerie.

Question possible :
"Pourquoi charger depuis l'API alors qu'on passe deja le voyage dans `state` ?"

Reponse :
"Le state ameliore la rapidite quand on vient de la liste, mais il disparait si on recharge la page ou si on ouvre un lien direct. L'appel API garantit que la page fonctionne aussi en acces direct."

### 3.3 Page reservation : `Reserver.jsx`

Route :
- `/VoyagesOrganise/Reserver/:id`

Role :
Collecter les informations client avant paiement.

Fonctions importantes :

Lecture de `localStorage`
- Recupere le client connecte.
- Pre-remplit prenom, nom, email et telephone.

`form`
- Stocke :
  - prenom
  - nom
  - email
  - telephone
  - personnes
  - chambre
  - notes

`totalPrix`
- Calcule `prix * nombre de personnes`.

`handleChange(e)`
- Met a jour le champ modifie.

`handleSubmit(e)`
- Ne sauvegarde pas encore en base.
- Prepare les donnees et navigue vers la page paiement avec :
  - `voyage`
  - `booking`
  - `totalPrix`

Question possible :
"Pourquoi la reservation n'est pas creee directement dans `Reserver.jsx` ?"

Reponse :
"Parce que cette page est l'etape information. La reservation finale depend du mode de paiement choisi. On cree la reservation au paiement pour enregistrer un statut coherent : `confirmed/paid` si paiement en ligne, `pending/pending` si paiement agence."

### 3.4 Page paiement : `Payment.jsx`

Route :
- `/VoyagesOrganise/Payment/:id`

Role :
Choisir le mode de paiement, appliquer une promotion, enregistrer la reservation.

Fonctions importantes :

`handleCardChange(e)`
- Formate les champs carte :
  - numero : uniquement chiffres, groupes de 4
  - expiration : format MM/AA
  - CVV : limite a 4 chiffres

`handlePromoChange(e)`
- Met a jour le code promo.
- Supprime la promotion appliquee si le code change.

`handleApplyPromo()`
- Cherche le code promo dans les promotions chargees.
- Si valide : applique la reduction.
- Si invalide : affiche une erreur.

`saveReservation(paymentMethod)`
- Fonction centrale.
- Construit le payload envoye a `POST /api/voyage-reservations`.
- Envoie :
  - voyage_id
  - nom/prenom/email/telephone
  - chambre
  - nombre de personnes
  - total calcule apres promotion
  - mode de paiement
  - promotion appliquee

`handleOnlineSubmit(e)`
- Enregistre une reservation avec `paymentMethod = online`.
- Cote backend, elle devient confirmee et payee.

`handleAgencyConfirm()`
- Enregistre une reservation avec `paymentMethod = agency`.
- Cote backend, elle reste en attente.

Question possible :
"Comment eviter une incoherence entre prix affiche et prix sauvegarde ?"

Reponse :
"Le prix final est calcule dans un objet `pricing` via `getPromotionPricing`, puis ce meme `pricing.finalAmount` est utilise a la fois pour l'affichage et pour le payload envoye au backend."

## 4. Module voyages organises - cote admin frontend

### 4.1 Gestion du catalogue : `VoyagePackages.jsx`

Route :
- `/admin/voyages/VoyagePackages`

Role :
Permettre a l'admin de gerer les voyages organises : creation, modification, suppression, galerie, hero public.

Fonctions et composants importants :

`EMPTY`
- Objet initial du formulaire voyage.
- Contient tous les champs : titre, description, prix, duree, pays, destination, programme, inclus, non inclus, galerie, statut actif.

`DEFAULT_COVER`
- Valeurs par defaut du hero public.

`ModalField`
- Composant utilitaire pour uniformiser les champs du formulaire admin.

`EditableList`
- Gere les listes dynamiques :
  - programme
  - inclus
  - non inclus
- Fonctions internes :
  - `addItem()`
  - `removeItem(index)`
  - `updateItem(index, value)`

`CoversModal`
- Sert a modifier l'apparence de la page publique.
- Fonction `setHero(key, val)` : modifie un champ du hero.
- Fonction `handleSave()` : envoie `PUT /api/voyages-organises/voyage-covers`.

`GalleryEditor`
- Gere les images de galerie.
- Fonctions :
  - `addImage()`
  - `removeImage(index)`
  - `uploadFile(file)`
- `uploadFile` convertit l'image en data URL puis appelle `POST /api/media/upload` avec le token admin.

`PkgModal`
- Modal de creation ou edition d'un voyage.
- `handleSubmit(e)` choisit :
  - `POST /api/voyages-organises` si creation
  - `PUT /api/voyages-organises/:id` si modification

`VoyageDetail`
- Panneau lateral de consultation.
- Affiche prix, infos, disponibilite, nombre de reservations.
- Donne acces a modifier ou supprimer.

`VoyagePackages`
- Composant principal.
- `fetchVoyages()` charge le catalogue admin complet.
- `fetchCovers()` charge le hero actuel.
- `handleDelete(id)` supprime un voyage, seulement si l'admin est principal.
- `stats` calcule total, actifs, inactifs, total reservations.

Question possible :
"Pourquoi separer `CoversModal`, `GalleryEditor`, `PkgModal` ?"

Reponse :
"Chaque composant gere une responsabilite precise : apparence, galerie, formulaire metier. Cela evite un composant principal trop lourd et rend le code plus lisible."

### 4.2 Gestion des reservations : `VoyageReservations.jsx`

Route :
- `/admin/voyages/VoyageReservations`

Role :
Lister, filtrer et changer le statut des reservations voyages.

Fonctions importantes :

`STATUS_MAP`
- Centralise les labels, couleurs et styles des statuts.

`StatusBadge`
- Affiche visuellement le statut.

`PaymentCell`
- Affiche le mode de paiement : en ligne ou agence.

`ResDetail`
- Panneau lateral de details.
- Affiche contact, voyage, paiement, notes et dates.
- Permet de changer le statut.

`fetchReservations()`
- Appelle `GET /api/voyage-reservations`.

`handleStatusChange(id, status)`
- Verifie la regle admin :
  - annulation reservee a l'admin principal
- Appelle `PATCH /api/voyage-reservations/:id/status`.
- Recharge la liste apres succes.

`filtered`
- Filtre les reservations par :
  - recherche client
  - statut
  - mode de paiement

`stats`
- Calcule les compteurs affiches en haut :
  - total
  - en attente
  - confirmees
  - paiement en ligne
  - paiement agence

Question possible :
"Pourquoi le statut agence est souvent `pending` ?"

Reponse :
"Parce que le client n'a pas encore paye. La reservation est retenue, puis l'admin la passe a `confirmed` apres reception du paiement."

## 5. Module voyages organises - backend

### 5.1 Routes

`backend/routes/voyageOrganiseRoutes.js`
- `GET /voyage-covers` : recuperer le hero public.
- `PUT /voyage-covers` : modifier le hero.
- `GET /` : lister les voyages.
- `GET /:id` : recuperer un voyage.
- `POST /` : creer un voyage.
- `PUT /:id` : modifier un voyage.
- `DELETE /:id` : supprimer un voyage.

`backend/routes/voyageReservationRoutes.js`
- `GET /stats` : statistiques reservations voyages.
- `GET /` : liste des reservations.
- `GET /:id` : detail reservation.
- `POST /` : creation reservation.
- `PATCH /:id/status` : changement statut.
- `DELETE /:id` : suppression reservation.

### 5.2 Controller catalogue : `voyageOrganiseController.js`

`getVoyageCovers(req, res)`
- Lit les parametres d'apparence depuis `settings`.
- Retourne des valeurs par defaut si rien n'existe.

`updateVoyageCovers(req, res)`
- Valide la presence de `hero`.
- Sauvegarde le hero dans `settings`.

`getAll(req, res)`
- Si `public=true`, retourne seulement les voyages actifs.
- Sinon retourne tout pour l'admin.

`getOne(req, res)`
- Retourne un voyage par id.
- Renvoie 404 si introuvable.

`create(req, res)`
- Valide `title`, `price`, `duration`.
- Cree un voyage.

`update(req, res)`
- Valide les champs obligatoires.
- Met a jour le voyage.

`remove(req, res)`
- Supprime le voyage.

### 5.3 Model catalogue : `voyageOrganiseModel.js`

`BASE_QUERY`
- Requete SQL commune.
- Joint `voyages_organises` avec `voyage_reservations`.
- Calcule :
  - `reservation_count`
  - `available_spots`

`ensureTable()`
- Cree la table `settings` si elle n'existe pas.

`getSetting(key)` / `setSetting(key, value)`
- Stockent les reglages JSON du hero.

`ensureGalleryColumn()`
- Ajoute la colonne `gallery` si elle n'existe pas.
- Utile pour evoluer la base sans migration manuelle.

`getAllVoyages()`
- Retourne tout le catalogue admin.

`getActiveVoyages()`
- Retourne seulement les voyages actifs pour le client.

`getVoyageById(id)`
- Retourne le detail d'un voyage.

`createVoyage(data)`
- Insere un voyage.
- Convertit `programme`, `inclus`, `non_inclus`, `gallery` en JSON.

`updateVoyage(id, data)`
- Met a jour tous les champs du voyage.

`deleteVoyage(id)`
- Supprime un voyage.

### 5.4 Controller reservations : `voyageReservationController.js`

`getAll(req, res)`
- Liste les reservations avec filtres optionnels : statut, paiement, email.

`getStats(req, res)`
- Retourne les statistiques du module.

`getOne(req, res)`
- Retourne une reservation par id.

`create(req, res)`
- Valide les champs obligatoires.
- Verifie le mode de paiement : `online` ou `agency`.
- Cree la reservation avec statut automatique :
  - online -> `confirmed` + `paid`
  - agency -> `pending` + `pending`
- Envoie un email selon le mode de paiement.

`updateStatus(req, res)`
- Valide le statut.
- Met a jour `status` et parfois `payment_status`.
- Envoie un email si le statut devient confirme, annule ou termine.

`remove(req, res)`
- Supprime une reservation.

### 5.5 Model reservations : `voyageReservationModel.js`

`getAllReservations(filters)`
- Construit une requete SQL avec filtres dynamiques.
- Joint la table voyages pour afficher titre, pays, destination.

`getReservationById(id)`
- Retourne une reservation avec infos voyage.

`createReservation(data)`
- Insere la reservation.

`updateStatus(id, status, payment_status)`
- Met a jour le statut et renvoie la reservation enrichie avec `voyage_title`.

`deleteReservation(id)`
- Supprime une reservation.

`getStats()`
- Compte les reservations par statut et mode de paiement.

## 6. Fonctions importantes par module

### Authentification client

Frontend :
- `CreateAccount.handleSubmit()` : appelle register et stocke token/client.
- `CreateAccount.validate()` : valide email, mot de passe, confirmation.
- `SignIn.handleSubmit()` : appelle login.
- `ForgotPassword.handleSendEmail()` : demande le code de reset.
- `ForgotPassword.handleVerifyCode()` : verifie le code.
- `ResetPassword.handleSubmit()` : enregistre le nouveau mot de passe.

Backend :
- `authController.register()` : cree un client avec mot de passe hash.
- `authController.login()` : verifie email/password et genere JWT.
- `authController.getMe()` : retourne le client connecte.
- `authController.forgotPassword()` : genere un code.
- `authController.verifyResetCode()` : valide le code.
- `authController.resetPassword()` : change le mot de passe.
- `authModel.createClient()` : insertion SQL.
- `authModel.findByEmail()` : recherche client par email.

Question jury :
"Pourquoi hasher le mot de passe ?"

Reponse :
"On ne stocke jamais un mot de passe en clair. Le hash bcrypt permet de verifier le mot de passe sans pouvoir le relire."

### Admin auth / roles

Frontend :
- `AdminLogin.handleSubmit()` : connexion admin.
- `AdminLayout.handleLogout()` : deconnexion.
- `AdminLayout` : menu admin et navigation.

Backend :
- `adminAuthController.login()` : authentifie admin.
- `middleware/adminMiddleware.requireAdmin` : protege les routes admin.
- `requireMainAdmin` : limite certaines actions sensibles.

Question jury :
"Pourquoi un role `main` ?"

Reponse :
"Certaines actions comme supprimer un admin, annuler une reservation ou supprimer un client sont sensibles. Le role principal limite ces operations."

### Hotels

Frontend :
- `HotelsPage.handleSearch()` : applique la recherche.
- `HotelsPage.filteredHotels` : filtre et trie les hotels.
- `HotelsPage.handleDetails()` : charge un hotel puis navigue.
- `HotelReservationPage.getNights()` : calcule le nombre de nuits.
- `HotelReservationPage.handleSubmit()` : prepare la reservation.
- `HotelPaymentPage.saveReservation()` : cree la reservation hotel.

Backend :
- `hotelController.getPublicHotels()` : liste publique.
- `hotelController.bookHotel()` : reservation hotel.
- `hotelController.getReservations()` : liste admin.
- `hotelController.updateReservationStatus()` : statut admin.
- `hotelModel.getPublicHotels()` : requete avec filtres.
- `hotelReservationModel.create()` : insertion reservation.

### Omra

Frontend :
- `Omra.useEffect()` : charge packages et covers.
- `Omra.handleDetails()` : va vers detail.
- `Omra.handleReserve()` : va vers reservation.
- `OmraPayment.saveReservation()` : enregistre la reservation.

Backend :
- `omraController.getAll()` : liste packages.
- `omraController.create/update/remove()` : CRUD admin.
- `omraReservationController.create()` : reservation.
- `omraReservationController.updateStatus()` : suivi admin.
- `omraModel.getActivePackages()` : packages publics actifs.

### Circuits

Frontend :
- `circuit.jsx` : liste publique des circuits.
- `CircuitDetails` : fiche detail.
- `CircuitReserver.handleSubmit()` : prepare reservation.
- `CircuitPayment.saveReservation()` : enregistre reservation.
- `CircuitPackages.handleSeedCircuits()` : insere des circuits tunisiens de depart.

Backend :
- `Circuitcontroller.getAll/getOne/create/update/remove()`.
- `Circuitreservationcontroller.create/updateStatus`.
- `Circuitmodel.getActiveCircuits()`.

### Transport

Frontend :
- `Transport.jsx` : page client pour demander un transport.
- `TransportAdmin.fetchTransports()` : liste vehicules admin.
- `TransportAdmin.handleSubmit()` : creation/modification.
- `RequestsAdmin.handleStatusChange()` : suivi des demandes client.

Backend :
- `transportController.getAllTransports()`.
- `transportController.createTransport()`.
- `transportController.createRequest()`.
- `transportController.updateRequestStatus()`.
- `transportModel.createTransport()`.
- `transportModel.createRequest()`.

### Vols

Frontend :
- `FlightSearch.handleSearch()` : recherche de vols.
- `FlightsListPage.filtered` : filtres resultats.
- `FlightReservation` : formulaire passager.
- `FlightPayment.saveReservation()` : paiement et reservation.

Backend :
- `flightController.searchFlights()` : interroge le service Duffel.
- `flightController.getOffer()` : recupere une offre.
- `flightController.bookFlight()` : cree une reservation.
- `flightController.updateReservationStatus()` : admin.
- `duffelService` : logique externe Duffel.

### Voyage sur mesure

Frontend :
- `CustomTripAbroad.handleSubmit()` : envoie une demande personnalisée.
- `CustomTripAbroad.getPriceEstimate()` : estimation indicative.
- `SurMesureAdmin.fetchTrips()` : liste les demandes.
- `SurMesureAdmin.handleStatusChange()` : change statut.
- `SurMesureAdmin.handleSendQuote()` : envoie devis.

Backend :
- `customTripController.create()` : cree demande.
- `customTripController.updateStatus()` : statut admin.
- `customTripController.updateQuote()` : prix + message admin.
- `customTripModel.create()`.

### Contact

Frontend :
- `Contact.handleSubmit()` : envoie message client.
- `Footer.handleSubmit()` : mini formulaire contact.
- `ContactAdmin` : suivi admin.

Backend :
- `contactController.create()` : cree message.
- `contactController.getAll()` : liste admin.
- `contactController.updateStatus()` : statut/reponse.
- `contactModel.getStats()` : stats messages.

### Promotions

Frontend :
- `usePromotions()` : charge promotions par categorie.
- `PromotionsAdmin.fetchAll()` : liste admin.
- `PromotionsAdmin.handleSubmit()` : creation/modification.
- `PromotionsAdmin.handleToggle()` : active/desactive.
- `promotionPricing.getPromotionPricing()` : calcule reduction.

Backend :
- `promotionsController.getByCategorie()`.
- `promotionsController.create/update/toggle/remove()`.
- `promotionsController.sendBlast()` : envoi promotion a tous les clients.

### Favoris

Frontend :
- `useFavorites()` : charge, synchronise et toggle les favoris.
- `buildFavoriteItemData()` : normalise les donnees stockees.

Backend :
- `favoritesController.getAll()` : favoris d'un client.
- `favoritesController.toggle()` : ajoute ou retire.
- `favoritesModel.toggle()` : logique SQL insert/delete.

### Profil client

Frontend :
- `ClientProfile.fetchAll()` : recupere infos client et reservations.
- `handleTabChange()` : navigation entre reservations, favoris, promotions, fidelite.
- `Editprofile.handleSave()` : modifie le profil.

Backend :
- `clientController.getAll/getOne/update/deleteClient`.
- `clientModel.getAllClients()`.

### Media upload

Frontend :
- `GalleryEditor.uploadFile()` : lit un fichier image et l'envoie au backend.

Backend :
- `mediaController.parseDataUrl()` : lit le data URL.
- `mediaController.extFromMime()` : determine l'extension.
- `mediaController.uploadImage()` : sauvegarde le fichier.

## 7. Questions tres techniques possibles du jury

### Architecture

1. Quelle est la difference entre route, controller et model ?
Reponse : la route expose l'URL, le controller traite la requete et applique la logique metier, le model accede aux donnees SQL.

2. Pourquoi certaines routes n'ont pas de model ?
Reponse : parce qu'elles font de l'agregation, du middleware ou de l'orchestration et ne representent pas une entite persistante unique.

3. Pourquoi utiliser React Router `state` ?
Reponse : pour transmettre rapidement des donnees entre pages sans refaire immediatement un appel API, tout en gardant un fallback par `id`.

4. Pourquoi garder aussi l'id dans l'URL ?
Reponse : pour permettre le refresh, le partage de lien et l'acces direct.

5. Pourquoi utiliser `localStorage` ?
Reponse : pour conserver le token et les informations client/admin entre les pages et apres rechargement.

### Securite

6. Comment sont proteges les mots de passe ?
Reponse : par hash bcrypt cote backend.

7. Comment sait-on qu'un utilisateur est connecte ?
Reponse : le backend signe un JWT, le frontend le stocke et l'envoie sur les routes protegees.

8. Pourquoi limiter certaines actions a l'admin principal ?
Reponse : suppression et annulation sont des actions irreversibles ou sensibles.

9. Que se passe-t-il si un token est absent ?
Reponse : les routes protegees renvoient une erreur, et le frontend peut rediriger vers login.

### Base de donnees

10. Pourquoi utiliser des requetes parametrees `$1`, `$2` ?
Reponse : pour eviter l'injection SQL.

11. Pourquoi stocker `programme`, `inclus`, `gallery` en JSONB ?
Reponse : ce sont des listes variables. JSONB evite de creer plusieurs tables pour des donnees simples et flexibles.

12. Pourquoi calculer `available_spots` dans SQL ?
Reponse : pour avoir une disponibilite derivee fiable a partir du nombre de places et des reservations confirmees.

13. Pourquoi `LEFT JOIN` entre reservations et voyages ?
Reponse : pour afficher les infos voyage meme dans la liste des reservations, sans perdre une reservation si la relation est absente.

### Frontend

14. Pourquoi utiliser `loading` et `error` ?
Reponse : pour gerer proprement les etats asynchrones et ne pas afficher une interface vide ou trompeuse.

15. Pourquoi pre-remplir les formulaires avec `localStorage.client` ?
Reponse : pour ameliorer l'experience utilisateur et eviter la ressaisie.

16. Pourquoi utiliser `useMemo` pour les filtres ?
Reponse : pour eviter des recalculs inutiles sur les listes.

17. Pourquoi separer les composants `VoyageCard`, `SearchBar`, `AdvancedFilters` ?
Reponse : pour reutiliser, simplifier la page et separer les responsabilites.

### Backend / API

18. Pourquoi retourner `{ success: true, data }` ?
Reponse : pour standardiser les reponses API et simplifier le traitement frontend.

19. Pourquoi utiliser des codes HTTP 400, 404, 500 ?
Reponse : 400 pour erreur client, 404 pour ressource inexistante, 500 pour erreur serveur.

20. Pourquoi `public=true` dans l'API voyages ?
Reponse : pour distinguer la vue client, qui affiche seulement les voyages actifs, de la vue admin, qui affiche tout.

21. Pourquoi envoyer des emails depuis le controller reservation ?
Reponse : l'email est une consequence directe d'un changement metier : creation ou changement de statut.

22. Pourquoi un paiement agence est `pending` ?
Reponse : car l'argent n'a pas ete recu. L'admin confirme apres paiement reel.

23. Pourquoi formatter la carte cote frontend ?
Reponse : pour guider la saisie utilisateur. La vraie validation securisee devrait rester cote backend/passerelle paiement en production.

### Admin

24. Comment le dashboard admin calcule les revenus ?
Reponse : il additionne les `total_price` des reservations confirmees ou terminees sur plusieurs tables.

25. Pourquoi `adminStatsRoutes` verifie les tables existantes ?
Reponse : pour que le dashboard fonctionne meme si certains modules ne sont pas encore migres ou crees.

26. Pourquoi recharger les donnees apres modification ?
Reponse : pour synchroniser l'affichage avec l'etat reel en base.

27. Pourquoi afficher les stats admin cote frontend aussi ?
Reponse : certaines stats simples sont calculees a partir de la liste deja chargee, donc pas besoin d'un appel supplementaire.

### Promotions

28. Pourquoi serialiser la promotion appliquee dans la reservation ?
Reponse : pour garder la trace du code et de la reduction au moment de la reservation, meme si la promotion change ensuite.

29. Comment eviter qu'un code promo d'une autre categorie soit utilise ?
Reponse : le frontend cherche dans les promotions chargees pour la categorie courante. Cote production, il faudrait aussi renforcer cette validation cote backend.

### Questions de defense de conception

30. Si vous deviez ameliorer le projet, que feriez-vous ?
Reponse possible :
- centraliser les URLs API
- ajouter une validation backend plus stricte avec schema
- proteger toutes les routes admin cote backend
- ajouter des tests automatises
- finaliser l'i18n de toutes les pages
- utiliser une vraie passerelle paiement

31. Quelle partie est la plus critique ?
Reponse :
"Les reservations et paiements, car elles changent l'etat metier et declenchent des emails. C'est pour cela qu'on valide les champs, controle les statuts et garde une trace du mode de paiement."

32. Quelle difference entre catalogue et reservation ?
Reponse :
"Le catalogue gere l'offre vendue : voyages, prix, places, contenu. La reservation gere la demande client liee a une offre, avec statut, paiement et suivi."

33. Comment expliquer le flux complet voyage organise ?
Reponse :
"Le client consulte la liste, filtre, ouvre le detail, remplit ses informations, choisit le paiement, puis le backend cree une reservation avec un statut adapte. L'admin peut ensuite suivre et changer le statut."

## 8. Mini-script oral pour presenter voyages organises

"Le module voyages organises est compose d'un cote client et d'un cote administrateur. Cote client, la page liste charge uniquement les voyages actifs avec `public=true`, applique recherche, filtres et tri cote frontend, puis permet d'aller vers la fiche detail ou la reservation. La fiche detail recharge par id pour supporter l'acces direct. La page reservation collecte les informations client et transmet les donnees au paiement. La page paiement applique eventuellement une promotion, choisit entre paiement en ligne et agence, puis cree la reservation via l'API.

Cote admin, `VoyagePackages` gere le catalogue complet : creation, modification, galerie, disponibilite, activation et apparence du hero public. `VoyageReservations` permet de suivre les reservations, filtrer par statut ou paiement, et changer leur etat. Cote backend, les routes appellent les controllers, les controllers valident et orchestrent, et les models executent les requetes PostgreSQL. La disponibilite est calculee dans le model avec une jointure sur les reservations confirmees."

## 9. Points a assumer honnetement devant le jury

- Le projet est fonctionnel mais certaines validations peuvent etre renforcees cote backend.
- Le paiement en ligne est simule dans le frontend, ce n'est pas une passerelle bancaire reelle.
- Certaines routes admin ont des controles cote frontend ; idealement il faut aussi renforcer systematiquement cote backend.
- L'i18n est en cours d'integration module par module.
- Le dashboard admin est volontairement tolerant aux tables manquantes pour faciliter le developpement progressif.

