# Guide admin

## Objectif

Ce guide explique comment utiliser l'espace administrateur du site TicTac Voyage pour gerer les contenus, les reservations et la relation client.

## Connexion admin

1. Ouvrir la page admin.
2. Se connecter avec un compte administrateur.
3. Une fois connecte, acceder au tableau de bord.

Route frontend :

- `/admin/login`

## Tableau de bord

Le tableau de bord sert de point d'entree vers les differents modules admin :

- reservations Omra
- voyages organises
- circuits
- hotels
- vols
- demandes transport
- demandes sur mesure
- promotions
- clients
- messages de contact
- gestion des administrateurs

## Gestion des reservations

### Circuits

Depuis la partie reservations circuits, l'admin peut :

- consulter les reservations
- verifier les informations du client
- suivre le statut
- confirmer ou mettre a jour le dossier selon le flux metier

### Voyages organises

Depuis la partie voyages organises, l'admin peut :

- suivre les nouvelles reservations
- verifier le mode de paiement
- mettre a jour le statut
- gerer le suivi client

### Omra

Depuis la partie Omra, l'admin peut :

- suivre les reservations en attente
- confirmer les dossiers
- traiter les paiements et le suivi

### Hotels et vols

L'admin peut consulter les reservations recues depuis le site et suivre leur traitement.

## Paiements

Le projet gere deux grands cas :

- paiement en ligne
- paiement a l'agence

Quand un paiement en ligne est valide sur les modules deja relies, la reservation peut passer directement en statut confirme selon la logique backend mise en place.

## Demandes sur mesure

Route frontend :

- `/admin/sur-mesure`

Usage :

1. Ouvrir une demande.
2. Lire les besoins du client.
3. Saisir un prix de proposition.
4. Ecrire le message de reponse.
5. Envoyer le devis au client.

Note :

- le probleme qui bloquait la saisie caractere par caractere dans ce module a deja ete corrige

## Messages de contact

Route frontend :

- `/admin/contact`

L'admin peut :

- lire les messages recus
- repondre au client
- declencher l'envoi d'un email de reponse

## Promotions

Route frontend :

- `/admin/promotions`

L'admin peut :

- creer une promotion
- definir le titre
- definir la reduction
- ajouter un code promo
- definir les dates de validite
- publier l'offre

Les promotions publiees peuvent ensuite apparaitre dans l'espace client.

## Clients

Route frontend :

- `/admin/clients/ClientsAdmin`

Cette partie permet de consulter la base clients et de suivre l'activite des utilisateurs.

## Gestion des contenus

Les pages admin dediees permettent de gerer plusieurs catalogues :

- packages Omra
- voyages organises
- circuits
- hotels
- tarification des vols
- transports

Bonnes pratiques :

- verifier les prix avant publication
- verifier les dates et disponibilites
- garder les descriptions coherentes en francais
- tester un parcours client apres une grosse modification

## Statuts et suivi

Quand un admin change un statut de reservation, il faut verifier :

- que le client est correct
- que le mode de paiement correspond au dossier
- qu'un email de suivi est bien envoye si le flux le prevoit

## Conseils d'utilisation

- traiter d'abord les reservations en attente
- verifier les paiements en ligne avant toute action manuelle inutile
- garder les messages clients clairs et professionnels
- mettre a jour les promotions expirees
- utiliser les commentaires ou messages admin avec un texte simple et exploitable

## Checklist rapide admin

- verifier les nouvelles reservations
- verifier les paiements recus
- repondre aux messages en attente
- suivre les demandes sur mesure
- mettre a jour les promotions
- controler les packages et disponibilites
