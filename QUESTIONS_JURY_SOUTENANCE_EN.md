# TicTac Voyage — Jury Questions (Technical)

For each question:
- **A ** = short answer in **very simple English** (what you can say to the jury).
- **(FR)** = longer explanation in French (to understand + add details if they ask more).

---

## 1) Project understanding

**Q1. What problem does your application solve?**  
**A :** It puts the travel agency work in one web platform: browse offers, book, and let admins process requests.  
( Le problème initial est la gestion “manuelle” : demandes dispersées (messages/appels), suivi difficile, risques d’erreurs (dates, prix, statut), manque de traçabilité. Notre solution centralise : le client consulte et remplit des formulaires structurés, la demande arrive clairement côté admin, l’admin met à jour le statut et le client reçoit des notifications. Donc on améliore la qualité de service, la vitesse de traitement, et la satisfaction client.)

**Q2. What are your main objectives?**  
**A :** Better user experience, faster admin work, and fewer errors.  
( Objectifs : (1) rendre la réservation simple et claire (UX), (2) donner un tableau de bord admin pour traiter vite, (3) réduire les erreurs grâce à des données standardisées (mêmes champs, mêmes statuts, validations). On vise aussi un système plus “moderne” avec intégrations (vols temps réel, traduction, carte, chatbot) pour rendre le site crédible.)

**Q3. Who are the main actors/users of the system?**  
**A :** Visitor, User, Admin, and Super Admin, with different permissions.  
( Visitor = non connecté (consultation + certaines actions). User = connecté (profil, réservations, fidélité, promotions). Admin = traite les réservations, gère contenus/offres, répond aux messages. Super Admin = gère les comptes admin et des actions sensibles. Le point important : les droits sont séparés et contrôlés (pages + endpoints).)

**Q4. What is the functional scope of your system?**  
**A :** Trips, Omra, circuits, hotels, flights, transport, custom trips, payment flow, profile, loyalty, promotions, favorites, contact, and admin dashboard.  
( Le périmètre couvre les services (omra, voyages, circuits, hôtels, vols, transport, sur-mesure) + la réservation + la gestion des statuts + la communication (contact / chatbot) + l’espace client (profil, fidélité, promotions, favoris) + l’espace admin (dashboard, traitement, gestion). Même si certaines parties restent perfectibles, vous devez montrer que vous maîtrisez la liste des modules.)

---

## 2) Methodology (Agile / Scrum)

**Q5. Why did you choose Agile Scrum?**  
**A :** Because needs can change, Scrum helps us deliver step by step and get feedback early.  
( Dans un projet web, le besoin évolue souvent après les premiers tests (champs à ajouter, écrans à améliorer, règles métier). Scrum découpe le travail en sprints : on livre une version fonctionnelle à chaque sprint, on collecte des retours, et on améliore. Ça réduit le risque de livrer “trop tard” quelque chose qui ne correspond pas.)

**Q6. How did you apply Scrum in your project?**  
**A :** We used a backlog, built features in sprints, and reviewed results at the end of each sprint.  
( Expliquez avec vos sprints : Sprint 0 = fondations (comptes, auth, gestion admin/users, gestion offres de base). Sprint 1 = réservation + traitement + paiement (flux). Sprint 2 = consultation services, profil, fidélité, communication, chatbot, etc. Après chaque sprint, on teste les parcours, on corrige, puis on passe au sprint suivant.)

**Q7. Can you give one example of an improvement driven by feedback?**  
**A :** We improved forms and admin actions after reviews to make the flow smoother and reduce mistakes.  
( Le jury veut voir que vous itérez. Donnez 1 exemple concret : amélioration d’un formulaire (libellés plus clairs, champs requis), correction d’un bug de saisie, amélioration d’une page admin (filtre, confirmation). Même si l’exemple est simple, il prouve la boucle “feedback → correction → amélioration”.)

**Q8. Scrum vs Waterfall (V-model): what’s the difference?**  
**A :** Scrum is iterative and flexible; Waterfall is linear with late validation.  
( En Waterfall, on fige tôt les exigences et on valide souvent à la fin, donc si on se trompe on le découvre tard. Scrum valide plus tôt et accepte les changements : on peut ajuster à chaque sprint. Pour notre cas (plateforme web métier), Scrum est plus adapté.)

---

## 3) Global architecture

**Q9. Describe your high-level architecture.**  
**A :** React frontend + Node/Express REST API + PostgreSQL database, plus external APIs.  
( C’est une architecture full-stack classique : React gère l’interface et les formulaires, Express expose l’API REST avec la logique métier, PostgreSQL stocke les données. Les APIs externes (Duffel, traduction, map, chatbot) sont intégrées pour enrichir certaines fonctionnalités. Le jury veut entendre : “frontend → API → database”.)

**Q10. How do you connect the frontend and backend?**  
**A :** The frontend calls REST endpoints with Axios and exchanges JSON.  
( Liaison front/back = requêtes HTTP (GET/POST/PUT/DELETE). Le frontend envoie des données en JSON, le backend répond en JSON. Pour les routes protégées, le frontend envoie le token dans `Authorization: Bearer <JWT>`. C’est important de dire : “Axios côté frontend” + “routes Express côté backend” + “status codes HTTP”.)

**Q11. Why did you choose REST instead of GraphQL?**  
**A :** REST is simpler and enough for our use cases.  
( REST est plus simple à mettre en place et à tester. Les endpoints sont clairs (auth, réservations, admin…). GraphQL est utile si on a beaucoup de clients différents et des besoins complexes de requêtes, mais ça ajoute un coût (schema, resolvers, sécurité). Pour notre PFE, REST suffit.)

**Q12. Why not microservices?**  
**A :** One modular API is simpler for this project size and easier to maintain.  
( Les microservices demandent du DevOps (déploiement multiple, communication, monitoring, CI/CD avancé). Pour la taille du projet, ce serait trop complexe. On préfère un monolithe modulaire : code séparé par modules (routes/controllers/services) mais un seul déploiement. C’est plus réaliste et stable.)

---

## 4) Frontend choices (React, Vite, Router, Tailwind, i18n…)

**Q13. Why React and not Angular?**  
**A :** React is flexible, good for components, and our team knows it better.  
( React est très adapté aux SPA avec beaucoup de composants (cartes, formulaires, tableaux). Angular est un framework complet mais plus lourd et impose des patterns. Pour ce projet, React permet d’avancer vite, de factoriser des composants, et l’équipe le maîtrise mieux, donc moins de risques.)

**Q14. Why not Vue?**  
**A :** Vue is good too, but we chose React because we are more comfortable with it.  
( Ne critiquez pas Vue. Dites : “Vue est excellent aussi, mais on a choisi React par maîtrise équipe et écosystème (router, i18n, tooling) déjà choisi.” Le jury attend surtout une justification pragmatique.)

**Q15. What is the role of React in your project?**  
**A :** React builds the UI: pages, forms, dashboards, and reusable components.  
( React gère l’interface : navigation SPA, affichage dynamique des listes, formulaires de réservation, pages admin, etc. Les composants sont réutilisables (même style, moins de duplication). Le rendu réactif améliore l’UX : mises à jour immédiates sans rechargement complet.)

**Q16. Why Vite?**  
**A :** Vite is fast for development and for production build.  
( Vite accélère le dev (serveur très rapide, hot reload) et produit un build moderne. On gagne du temps pendant le développement et on a un frontend plus performant au build.)

**Q17. Why React Router?**  
**A :** It manages navigation between pages without reloading the site.  
( React Router gère les routes : pages publiques, espace client, espace admin. Il permet une navigation fluide (SPA). On peut aussi mettre des redirections côté UI (ex: si pas connecté → login), mais la vraie sécurité reste côté backend.)

**Q18. Why Axios?**  
**A :** Axios makes API calls easier and consistent.  
( Axios simplifie les appels : envoi JSON, lecture réponse JSON, gestion d’erreurs, headers (JWT). Dans une SPA, on a beaucoup de requêtes, donc Axios standardise la communication.)

**Q19. Why Tailwind CSS?**  
**A :** Tailwind helps us build a clean responsive UI faster.  
( Tailwind = classes utilitaires. Ça accélère la construction d’une UI cohérente et responsive. Ça limite les styles CSS “diffus” et évite les incohérences, surtout quand on travaille à plusieurs.)

**Q20. How do you implement multilingual support?**  
**A :** We use i18next to translate the UI and let users change language.  
( i18next gère des fichiers de traduction (clés → textes). On peut détecter la langue du navigateur ou laisser l’utilisateur choisir. C’est utile pour une agence de voyage : plus de compréhension, moins d’abandon, meilleure accessibilité.)

---

## 5) Backend choices (Node/Express) + structure

**Q21. Why Node.js and Express?**  
**A :** They are good to build REST APIs and to connect database, emails, and external APIs.  
( Node est très bon pour les opérations I/O : DB, appels vers Duffel, envoi d’emails. Express est simple pour exposer des endpoints, utiliser des middlewares (auth, rate limit) et structurer l’API. L’écosystème Node propose beaucoup de librairies utiles (JWT, bcrypt, etc.).)

**Q22. How is your backend organized?**  
**A :** Routes define endpoints, controllers hold logic, models talk to the database, and services handle external APIs.  
( Détail : `routes/` = mapping URL → handler. `controllers/` = règles métier (validation, statuts). `models/` = requêtes PostgreSQL. `services/` = intégrations (Duffel, chatbot…). `utils/` = mailer. Cette séparation rend le code lisible, testable, et plus facile à faire évoluer.)

**Q23. Why dotenv?**  
**A :** To keep secrets and config out of the code.  
( Les secrets ne doivent pas être dans Git. `dotenv` charge `JWT_SECRET`, les clés API (Duffel, Groq…), la config email, la config DB, etc. On peut avoir des valeurs différentes dev/prod. C’est une bonne pratique sécurité + déploiement.)

**Q24. What is the purpose of helmet?**  
**A :** It adds basic security HTTP headers.  
( Helmet ajoute des headers de sécurité (baseline). Ça réduit certains risques côté navigateur (ex : protections liées aux en-têtes). Ce n’est pas suffisant seul, mais c’est une bonne base.)

**Q25. What is the purpose of morgan?**  
**A :** It logs HTTP requests to help debug.  
( Morgan montre les requêtes (route, status, temps). Pendant le dev, ça aide à comprendre “quelle route est appelée”, “pourquoi on a un 401/500”, etc.)

**Q26. Why express-rate-limit?**  
**A :** To limit requests and reduce abuse.  
( On évite le bruteforce sur login, le spam sur contact/chat, et la surcharge. Rate limiting = protection simple mais efficace. Le jury aime entendre “anti-abuse”.)

---

## 6) Database (PostgreSQL + pg)

**Q27. Why PostgreSQL instead of MongoDB?**  
**A :** Because our data is relational and needs strong consistency.  
( Nos entités sont liées : client ↔ réservations, statuts, promos, etc. PostgreSQL gère bien les relations, contraintes, et requêtes SQL fiables. MongoDB est utile pour des documents très flexibles, mais ici les relations sont importantes et la cohérence est un besoin fort.)

**Q28. How do you access PostgreSQL from Node?**  
**A :** We use `pg` with a connection pool and SQL queries.  
( `pg` (node-postgres) fournit un pool pour réutiliser les connexions. On fait des requêtes SQL paramétrées. Ça améliore performance et sécurité.)

**Q29. How do you prevent SQL injection?**  
**A :** We use parameterized queries and validate inputs.  
( Les requêtes paramétrées (`$1`, `$2`) empêchent l’injection car les valeurs sont traitées comme data. On ajoute validation côté serveur (format email, champs requis, tailles). Donc double protection : technique + validation métier.)

---

## 7) Authentication, roles, security

**Q30. How does authentication work?**  
**A :** We verify the password hash, create a JWT token, and protect routes with middleware.  
( Étapes claires : login → comparaison bcrypt → génération JWT → frontend envoie le token dans `Authorization`. Le middleware backend vérifie le token et récupère l’identité (clientId/adminId). Ça protège les routes profil/admin.)

**Q31. Why JWT?**  
**A :** JWT is simple for SPA + API and works without server sessions.  
( JWT = authentification “stateless”. Le serveur vérifie juste la signature du token. C’est pratique pour SPA + REST. L’expiration gère la durée de session. C’est aussi plus simple à scaler qu’une session stockée côté serveur.)

**Q32. Why bcrypt?**  
**A :** Because we never store plain passwords; we store hashes.  
( Stocker un mot de passe en clair est interdit. bcrypt rend le hash robuste et ralentit les attaques. Même si la DB fuite, l’attaquant ne récupère pas facilement les mots de passe.)

**Q33. How do you handle admin permissions?**  
**A :** Admin routes need an admin token, and roles restrict sensitive actions.  
( On a un middleware admin qui exige un token admin. Ensuite, on contrôle le rôle (ex : main admin) pour des actions sensibles (gestion admins). On applique la règle “least privilege” : chaque rôle a seulement les droits nécessaires.)

**Q34. Why CORS?**  
**A :** To allow only our frontend domain to call the API from the browser.  
( Sans CORS, n’importe quel site pourrait tenter d’appeler votre API depuis un navigateur. CORS limite aux origines autorisées. C’est un contrôle important quand frontend et backend sont sur des domaines/ports différents.)

**Q35. How do you manage “forgot password”?**  
**A :** We send a reset code by email, verify it, and then save a new hashed password.  
( Flux : demande reset → code aléatoire + expiration → email → vérification du code → nouveau password hashé. On efface le token après utilisation. C’est une approche simple, claire, et alignée avec un PFE.)

---

## 8) Emails (Nodemailer)

**Q36. Why send transactional emails?**  
**A :** To confirm actions and keep users informed.  
( Emails = preuve et suivi : bienvenue, reset password, confirmation ou mise à jour de réservation, réponses contact. Ça améliore la confiance et réduit les appels/relances. Pour le jury, c’est un bon point “automation”.)

**Q37. How do you implement email sending?**  
**A :** The backend sends emails on key events and logs errors if sending fails.  
( On déclenche l’envoi dans le backend lors d’événements (signup, reset, statut). On évite de bloquer l’API : l’envoi doit être asynchrone ou tolérant à l’échec. On log les erreurs pour debug.)

---

## 9) Booking / Admin processing / Payment flow

**Q38. Describe the booking workflow.**  
**A :** The user fills a form, we save a reservation, then an admin updates the status.  
( Détaillez : formulaire → validation → insertion DB → statut initial `Pending` → admin traite → statut `Confirmed/Rejected/Canceled` → email au client. Le jury veut voir que vous comprenez le cycle de vie d’une réservation.)

**Q39. What does “treat reservations” mean on the admin side?**  
**A :** Admins view requests, filter them, update statuses, and notify users.  
( “Treat” = traiter : l’admin consulte le dashboard des réservations, filtre par statut, ouvre une réservation, change le statut et éventuellement le paiement/infos, puis le système envoie une notification email. C’est le cœur métier côté agence.)

**Q40. How does payment work in your system?**  
**A :** Users choose online or on-site payment; online success confirms the booking and sends an email.  
( Le flux décrit : si paiement à l’agence → `Pending`. Si paiement en ligne → passage “payment gateway” → succès = `Confirmed` + email ; échec = rester `Pending` + message d’erreur. Si on vous demande le provider : expliquez que le flux est prêt et que l’intégration d’un provider certifié est une amélioration future (comme écrit dans les perspectives).)

---

## 10) External APIs & integrations

### Duffel (Flights)

**Q41. Why integrate Duffel API?**  
**A :** To get real-time flight offers instead of a static list.  
( Duffel permet d’afficher de vrais vols avec des données à jour. Sans Duffel, on aurait une liste statique (moins réaliste). Avec Duffel, on montre une vraie valeur “produit” : recherche, résultats, détails, prix.)

**Q42. How do you handle Duffel responses?**  
**A :** We simplify the Duffel response for the UI and apply price conversion/margin rules.  
( Duffel renvoie des objets complexes. On normalise : on extrait les champs utiles (compagnie, durée, bagages, prix). On peut convertir le prix en TND et appliquer une marge commerciale (approche décrite). L’objectif : rendre les données faciles à afficher et éviter de “polluer” le frontend avec des objets trop lourds.)

**Q43. Why not store flight offers permanently?**  
**A :** Flight offers change fast, so we store only confirmed bookings.  
( Les offres changent vite : prix et disponibilité. Stocker tout rendrait les données vite fausses et trop volumineuses. La bonne stratégie est : appels temps réel + stockage uniquement des réservations confirmées et données client.)

### Chatbot

**Q44. What is the purpose of the chatbot?**  
**A :** To answer quick questions and guide users to the right service.  
( Le chatbot réduit les questions répétitives, aide l’utilisateur à comprendre les services, et peut orienter vers une page (omra, vol, hotel, etc.). Ça améliore l’UX et donne une impression de support “24/7”.)

**Q45. How is the chatbot integrated?**  
**A :** We can embed a Chatbase widget, and we also have a backend chatbot module.  
( Dans le rapport, Chatbase est intégré par un script (widget). Dans le projet, il existe aussi une logique chatbot côté backend (Groq). Pour ne pas se contredire : dites “we implemented chatbot support; we used an embedded widget, and we also built a backend assistant endpoint for more control”.)

### Translation / i18n

**Q46. Why add multilingual support?**  
**A :** To make the platform easy to use for people who speak different languages.  
( Le tourisme vise des clients variés. La traduction rend le site plus accessible, réduit les incompréhensions et augmente la confiance. Techniquement, i18n rend le contenu plus maintenable (une clé au lieu de texte hardcodé partout).)

### Map / OpenStreetMap

**Q47. Why OpenStreetMap/Nominatim instead of Google Places?**  
**A :** Because it works without billing setup and still gives address suggestions.  
( Google Places demande souvent une clé et une facturation. Pour un PFE, c’est un gros frein. Nominatim (OpenStreetMap) donne l’autocomplete d’adresses sans cette complexité. Ça répond au besoin transport (aider l’utilisateur à saisir une adresse correcte).)

**Q48. How do you optimize autocomplete requests?**  
**A :** We delay requests and cancel old ones to reduce useless calls.  
( Debounce : attendre une petite pause avant d’appeler l’API (ex 400ms). AbortController : si l’utilisateur continue de taper, on annule la requête précédente. Résultat : moins de requêtes, meilleure performance, et suggestions plus cohérentes.)

---

## 11) Quality, error handling, performance

**Q49. How do you handle errors?**  
**A :** We return clear HTTP status codes and messages, and we log server errors.  
( Le backend renvoie 400 (validation), 401 (non authentifié), 403 (interdit), 404 (introuvable), 500 (erreur serveur), avec un JSON clair (`success`, `message`). On log pour debug (morgan + logs). Côté frontend, on affiche un message simple (toast) et on gère les erreurs réseau.)

**Q50. What are your main planned improvements?**  
**A :** Add a real certified payment provider, more automated tests, and CI/CD with monitoring.  
( Perspectives “pro” : intégrer un provider de paiement certifié (finir le paiement réel), ajouter des tests automatiques (unit/integration/e2e), et mettre CI/CD + monitoring/logging. Vous pouvez aussi mentionner mobile app, avis clients, recommandations, optimisation performance.)

---

## 12) One-line “utility” for each technology (simple EN) + long FR

- **React** —  Builds the UI with components.  
  ( Sert à créer une SPA moderne. Les composants (cards, formulaires, tables) sont réutilisables. Le rendu est dynamique : on met à jour l’UI sans recharger. Très pratique pour un site riche en écrans et formulaires.)
- **Vite** —  Fast tool for dev and build.  
  ( Accélère le développement (serveur rapide, hot reload) et produit un build optimisé. Gain de productivité + performance.)
- **React Router** —  Manages navigation in the SPA.  
  ( Gère les routes (client/admin) et la navigation sans rechargement. Améliore l’UX et la structure des pages.)
- **Axios** —  Sends HTTP requests to the API.  
  ( Standardise la communication front → API : envoi JSON, lecture réponse, gestion erreurs, headers JWT. Très utile quand l’app dépend de beaucoup d’endpoints.)
- **Tailwind CSS** —  Helps build responsive UI quickly.  
  ( Classes utilitaires pour style rapide et cohérent. Responsive facile. Moins de CSS “désorganisé”.)
- **i18next / react-i18next** —  Translates the UI.  
  ( Gestion multi-langue propre : clés de traduction + ressources par langue. Plus maintenable que du texte hardcodé.)
- **Node.js** —  Runs the backend server.  
  ( Runtime pour exécuter JavaScript côté serveur. Très bon pour I/O (DB, API externes, emails).)
- **Express** —  Builds REST API endpoints.  
  ( Framework simple pour routes, middlewares, controllers. Permet de structurer l’API et appliquer auth/sécurité.)
- **PostgreSQL** —  Stores business data.  
  ( DB relationnelle robuste. Idéal pour clients/réservations/statuts/relations. Supporte contraintes et requêtes SQL fiables.)
- **pg** —  Connects Node to PostgreSQL.  
  ( Driver PostgreSQL. Pool de connexions + requêtes paramétrées. Performance + sécurité.)
- **JWT (jsonwebtoken)** —  Auth token for protected routes.  
  ( Auth stateless pour SPA/API. Le token est signé et vérifié par le backend. Gère l’expiration.)
- **bcryptjs** —  Hashes passwords.  
  ( Sécurise les mots de passe (jamais en clair). Ralentit les attaques bruteforce.)
- **cors** —  Controls which frontend can call the API.  
  ( Autorise uniquement les origines (domain/port) prévues. Protège contre des appels cross-origin non souhaités.)
- **helmet** —  Adds security headers.  
  ( Durcissement HTTP de base. Aide à réduire certains risques côté navigateur.)
- **express-rate-limit** —  Limits abusive requests.  
  ( Protège login/chat/contact contre spam/bruteforce. Réduit la charge et améliore la stabilité.)
- **nodemailer** —  Sends transactional emails.  
  ( Emails automatiques (welcome, reset password, confirmations). Améliore le suivi et la confiance.)
- **Duffel API** —  Provides real-time flights.  
  ( Apporte des offres de vols à jour. On normalise les réponses pour le frontend et on peut appliquer conversion/marge.)
- **OpenStreetMap / Nominatim** —  Suggests addresses for transport forms.  
  ( Autocomplete d’adresse sans contraintes de billing. Améliore l’UX et réduit les erreurs de saisie.)
- **Chatbase / Groq** —  Chatbot support.  
  ( Permet assistance utilisateur (FAQ, orientation). Chatbase = widget embarqué ; Groq = logique chatbot via backend pour plus de contrôle.)

