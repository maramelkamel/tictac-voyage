# Documentation technique

## Vue d'ensemble

Le projet `tictac-voyage` est une plateforme web de voyage avec :

- un frontend React pour les clients et les administrateurs
- un backend Node.js / Express pour les API metier
- une base PostgreSQL pour stocker les clients, reservations, promotions et contenus
- un systeme d'emails transactionnels pour les confirmations et notifications

## Technologies frontend

### React 19

Utilise pour construire l'interface utilisateur du site, les formulaires de reservation, le compte client et les pages d'administration.

### React Router DOM

Utilise pour la navigation entre les pages :

- pages publiques
- pages de reservation
- espace client
- espace admin

### Axios

Utilise pour envoyer les requetes HTTP du frontend vers le backend :

- connexion
- inscription
- reservations
- promotions
- profil client
- administration

### Vite

Utilise comme outil de developpement et de build frontend :

- serveur local rapide
- bundling de production
- optimisation du build

### i18next + react-i18next

Utilises pour la traduction de l'interface en plusieurs langues. Le projet contient deja des fichiers de langue pour plusieurs modules, notamment les circuits.

### i18next-browser-languagedetector

Utilise pour detecter automatiquement la langue du navigateur ou la langue deja enregistree.

### i18next-locize-backend + locize-lastused

Prevus pour gerer ou synchroniser les traductions avec un service externe de localisation.

### Tailwind CSS + PostCSS + Autoprefixer

Utilises pour le style, la mise en page responsive et le traitement CSS.

### react-hot-toast

Utilise pour afficher les notifications visuelles dans le site :

- succes
- erreur
- confirmation
- feedback utilisateur

### react-icons + lucide-react

Utilises pour les icones dans l'interface client et admin.

## Technologies backend

### Node.js

Runtime principal du serveur backend.

### Express

Framework backend utilise pour :

- exposer les routes API
- gerer les requetes HTTP
- separer les modules par domaine

### PostgreSQL + `pg`

Utilises pour stocker les donnees metier :

- clients
- admins
- reservations
- promotions
- favoris
- contenus transport, circuits, omra, hotels, vols

### dotenv

Utilise pour charger les variables d'environnement :

- cles JWT
- configuration email
- URL frontend
- cles API externes

### cors

Utilise pour autoriser la communication entre le frontend et le backend.

### helmet

Utilise pour ajouter des headers de securite HTTP et durcir l'API.

### morgan

Utilise pour le logging des requetes pendant le developpement et le debug.

## Authentification et securite

### JWT (`jsonwebtoken`)

Utilise pour gerer l'authentification client et admin :

- creation de token a la connexion
- conservation de session cote client
- protection de certaines routes

### bcryptjs

Utilise pour chiffrer les mots de passe avant stockage en base de donnees.

Cas d'usage dans le projet :

- inscription client
- authentification client
- authentification admin
- reinitialisation de mot de passe

### express-rate-limit

Utilise pour proteger certaines routes sensibles contre l'abus.

Exemple actuel :

- limitation de la route du chatbot a 40 messages par IP et par heure

## Emails

### Nodemailer

Utilise pour envoyer les emails transactionnels via Gmail.

Emails deja geres dans le projet :

- bienvenue apres creation de compte
- reinitialisation du mot de passe
- confirmation ou mise a jour d'une reservation
- paiement a l'agence
- promotions
- reponse au formulaire de contact

Le fichier central de cette logique est :

- [mailer.js](/C:/Users/laptop/Desktop/tictac-voyage/backend/utils/mailer.js)

## APIs et services metier

### Duffel API

Utilisee pour la recherche et la reservation de vols.

Le service gere notamment :

- recherche d'offres de vol
- recuperation d'une offre
- reservation
- annulation
- conversion et marge de prix vers le TND

Fichier principal :

- [duffelService.js](/C:/Users/laptop/Desktop/tictac-voyage/backend/services/duffelService.js)

### Groq SDK

Utilise pour le chatbot voyage `Tika`.

Le chatbot sert a :

- comprendre l'intention du client
- poser des questions de cadrage
- recommander des voyages
- proposer des actions rapides vers les pages du site

Fichier principal :

- [chatController.js](/C:/Users/laptop/Desktop/tictac-voyage/backend/controllers/chatController.js)

### Google Generative AI

La dependance est installee dans le backend, mais elle n'est pas branchee activement dans les fichiers principaux lus lors de cette documentation. Elle peut etre reservee a une extension IA future.

### Puppeteer

Dependance disponible dans le backend, utile pour automatisation ou scraping selon les besoins du projet. Elle n'est pas au coeur du flux principal de reservation que nous avons inspecte ici.

### node-cron

Dependance disponible pour les taches planifiees. Elle peut servir a des synchronisations ou traitements automatiques cote serveur.

## Modules fonctionnels du site

Le projet couvre actuellement plusieurs domaines :

- Omra
- Voyages organises
- Circuits
- Vols
- Hotels
- Transport
- Voyage sur mesure
- Promotions
- Favoris
- Contact
- Compte client
- Administration

## Organisation du projet

### Frontend

- `frontend/src/pages` : pages du site
- `frontend/src/components` : composants reutilisables
- `frontend/src/i18n` : configuration et fichiers de traduction
- `frontend/src/styles` : styles CSS

### Backend

- `backend/controllers` : logique metier des routes
- `backend/routes` : declaration des endpoints API
- `backend/models` : acces et logique liee aux donnees
- `backend/services` : integrations externes et traitements metier
- `backend/utils` : outils transverses comme les emails
- `backend/middleware` : verification auth et securite

## Ce que chaque brique apporte concretement

- `JWT` : garde la session connectee et protege les acces
- `bcryptjs` : evite de stocker les mots de passe en clair
- `helmet` : renforce la securite HTTP
- `cors` : permet au frontend d'appeler le backend
- `nodemailer` : envoie les emails automatiques
- `pg` : lit et ecrit les donnees dans PostgreSQL
- `Axios` : fait communiquer l'interface avec l'API
- `React Router` : gere la navigation dans le site
- `i18next` : affiche le site en plusieurs langues
- `Duffel` : alimente la partie vols
- `Groq` : alimente le chatbot voyage
- `Vite` : genere le build frontend

## Commandes utiles

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Notes

- Le backend expose les images uploadees via `/uploads`
- Le frontend et le backend utilisent des variables d'environnement pour les secrets et les cles API
- Les formulaires de reservation clients et les outils admin reposent sur la meme API backend
