# Guide utilisateur

## Objectif

Ce guide explique comment un client peut utiliser le site TicTac Voyage pour chercher une offre, reserver et suivre son compte.

## Creation de compte

1. Ouvrir la page d'inscription.
2. Remplir le prenom, le nom, l'email, le telephone et le mot de passe.
3. Valider la creation du compte.
4. Un email de bienvenue peut etre envoye automatiquement.

Pages utiles :

- `/CreateAccount`
- `/SignIn`

## Connexion

Une fois connecte, le client peut :

- acceder a son espace personnel
- retrouver ses reservations
- voir ses promotions
- beneficier du pre-remplissage de certains formulaires

## Parcours de reservation

Le site propose plusieurs types d'offres :

- Omra
- voyages organises
- circuits
- vols
- hotels
- transport
- voyage sur mesure

Le principe general est le suivant :

1. consulter la fiche detail
2. cliquer sur reserver
3. remplir le formulaire
4. choisir le mode de paiement
5. confirmer la demande

## Reservation circuit

Pour un circuit, le client peut remplir :

- prenom
- nom
- email
- telephone
- nombre de participants
- type de chambre
- demandes speciales

Le formulaire de reservation circuit est maintenant aligne avec les libelles francais du site.

## Paiement

Selon l'offre, deux modes peuvent etre proposes :

- paiement en ligne
- paiement a l'agence

Si le paiement en ligne aboutit sur les modules relies, la reservation peut etre confirmee directement et un email de confirmation peut etre envoye.

## Espace client

Route frontend :

- `/mon-compte`

Depuis son compte, le client peut retrouver :

- ses informations personnelles
- ses reservations
- son niveau de fidelite
- ses promotions

## Fidelite

Le systeme de fidelite suit actuellement cette logique :

- Niveau 0 : nouveau client jusqu'a 2 reservations
- Niveau 1 : a partir de 3 reservations
- Niveau 2 : a partir de 6 reservations
- Niveau 3 : a partir de 10 reservations

## Promotions

Dans l'espace client, une section `Nos promotions` permet de voir :

- les offres disponibles
- les codes promo
- les informations utiles de chaque promotion

## Favoris

Le site contient aussi une logique de favoris pour permettre au client de garder ses offres preferees a portee de main.

## Mot de passe oublie

Le client peut demander une reinitialisation de mot de passe.

Le parcours est generalement :

1. saisir son email
2. recevoir un code par email
3. verifier le code
4. definir un nouveau mot de passe

Pages utiles :

- `/ForgotPassword`
- `/ResetPassword`

## Contacter l'agence

Si le client a besoin d'aide, il peut utiliser :

- le formulaire de contact
- le chatbot voyage
- l'appel ou le contact direct avec l'agence

Page utile :

- `/Contact`

## Conseils pour bien utiliser le site

- creer un compte avant de reserver pour gagner du temps
- verifier l'email avant de confirmer une reservation
- relire les dates, le nombre de participants et le mode de paiement
- consulter les promotions avant de finaliser une commande
- suivre l'etat des reservations depuis l'espace client
