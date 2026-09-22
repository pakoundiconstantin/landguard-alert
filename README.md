# Land Dispute Sentinel

aide moi a developper cette application bien professionnelle c'est pour ma soutenance 
# CAHIER DES CHARGES

## Mise en place d’un système d’alerte SIG Web pour la gestion des litiges fonciers en lien avec le cadastre

### Cas de la région Maritime du Sud-Togo

---

# 1. PRÉSENTATION GÉNÉRALE

## 1.1. Intitulé du projet

**Mise en place d’un système d’alerte SIG Web pour la gestion des litiges fonciers en lien avec le cadastre : cas de la région Maritime du Sud-Togo.**

## 1.2. Nature du projet

Le projet consiste à concevoir et développer une application Web-GIS permettant de centraliser, consulter et gérer les informations relatives aux parcelles foncières et aux litiges qui leur sont associés.

Le système devra permettre aux acteurs autorisés de consulter les parcelles sur une carte interactive, d’enregistrer les plaintes et litiges, de transmettre les informations entre les acteurs concernés et de générer automatiquement des alertes lorsqu’une parcelle fait l’objet d’une procédure ou d’une décision judiciaire.

## 1.3. Zone d’étude

Le système est destiné à couvrir la **région Maritime du Sud-Togo**.

Le mémoire identifie notamment huit préfectures dans cette région : Golfe, Agoè-Nyivé, Bas-Mono, Lacs, Vo, Yoto, Avé et Zio.

---

# 2. CONTEXTE ET JUSTIFICATION

La gestion foncière est confrontée à plusieurs difficultés liées notamment à l'occupation informelle des terres, à l'insuffisance de données fiables, à la coexistence de différents régimes fonciers et à la fragmentation des informations entre les institutions.

Ces difficultés peuvent contribuer à l’apparition de conflits fonciers, notamment lorsque plusieurs informations concernant une même parcelle ne sont pas correctement centralisées ou lorsqu’une transaction intervient alors qu’une procédure concernant cette parcelle est en cours.

Le projet propose donc de mettre en place un système permettant de regrouper les informations cadastrales, domaniales et géospatiales dans une base de données géoréférencée et accessible via une interface Web-GIS.

L'objectif est également de faciliter la communication entre les acteurs concernés par la gestion foncière et judiciaire.

---

# 3. PROBLÉMATIQUE

La gestion des litiges fonciers nécessite la disponibilité d’informations fiables, cohérentes et accessibles concernant les parcelles.

L’absence d’une plateforme centralisée peut rendre difficile :

* l’identification rapide d’une parcelle ;

* la consultation de son historique ;

* le suivi des plaintes ;

* la transmission des informations entre institutions ;

* l’identification des parcelles faisant l’objet d’un litige ;

* la prise en compte rapide des décisions judiciaires.

Le problème principal auquel le projet cherche à répondre est donc :

**Comment mettre en place un système Web-GIS permettant d’améliorer la gestion des litiges fonciers grâce à la centralisation des données, à la visualisation cartographique et à un système d’alertes automatiques ?**

---

# 4. OBJECTIFS DU PROJET

## 4.1. Objectif général

Concevoir et développer un système d’alerte SIG Web permettant de contribuer à la gestion et à la prévention des litiges fonciers dans la région Maritime du Sud-Togo.

## 4.2. Objectifs spécifiques

Le système devra permettre de :

1. centraliser les informations relatives aux parcelles ;

2. intégrer les données cadastrales, domaniales et géospatiales ;

3. visualiser les parcelles sur une carte interactive ;

4. rechercher et identifier une parcelle ;

5. enregistrer les plaintes liées aux parcelles ;

6. créer et suivre les dossiers de litiges ;

7. générer automatiquement des alertes concernant les parcelles faisant l’objet d’un litige ;

8. enregistrer les décisions judiciaires ;

9. transmettre les informations pertinentes aux acteurs concernés ;

10. conserver l’historique des opérations réalisées sur une parcelle ;

11. permettre le suivi de l’évolution d’un litige jusqu’à sa résolution.

Ces objectifs reprennent notamment l’objectif du mémoire de concevoir une base unique et un Web-GIS permettant de visualiser les parcelles, enregistrer les plaintes, générer des alertes et transmettre les décisions judiciaires au cadastre.

---

# 5. PÉRIMÈTRE DU PROJET

## 5.1. Fonctionnalités incluses

Le système couvrira :

* l’authentification des utilisateurs ;

* la gestion des utilisateurs et des rôles ;

* la gestion des parcelles ;

* la cartographie interactive ;

* la recherche des parcelles ;

* la consultation des informations cadastrales ;

* la gestion des plaintes ;

* la gestion des litiges ;

* la gestion des décisions judiciaires ;

* la génération d’alertes ;

* l’historique des événements liés aux parcelles ;

* les tableaux de bord ;

* la recherche et le filtrage des informations.

## 5.2. Fonctionnalités hors périmètre

La première version du système ne prendra pas nécessairement en charge :

* le paiement des taxes foncières ;

* la vente directe des terrains ;

* la signature électronique des actes ;

* la réalisation automatique des opérations cadastrales de terrain ;

* le remplacement des systèmes officiels des institutions.

Ces éléments pourront éventuellement faire l’objet d’évolutions futures.

---

# 6. ACTEURS DU SYSTÈME

Le système devra prévoir différents profils d’utilisateurs.

## 6.1. Administrateur

L’administrateur assure :

* la gestion des utilisateurs ;

* la gestion des rôles ;

* la gestion des droits d’accès ;

* la supervision du système ;

* la consultation des journaux d’activité.

## 6.2. Agent du cadastre

L’agent du cadastre pourra :

* consulter les parcelles ;

* ajouter ou modifier les informations cadastrales selon ses droits ;

* consulter les litiges ;

* recevoir les alertes ;

* consulter les décisions judiciaires ;

* mettre à jour les informations relatives aux parcelles.

## 6.3. Agent du tribunal

L’agent du tribunal pourra :

* enregistrer une plainte ;

* identifier la parcelle concernée ;

* créer ou mettre à jour un dossier de litige ;

* consulter l’état du dossier ;

* enregistrer une décision judiciaire ;

* transmettre la décision aux acteurs concernés.

## 6.4. Utilisateur en consultation

Un utilisateur disposant uniquement d’un accès en consultation pourra :

* consulter la carte ;

* rechercher une parcelle ;

* consulter les informations autorisées ;

* consulter certains historiques selon ses droits.

---

# 7. BESOINS FONCTIONNELS

## BF01 — Authentification

Le système devra permettre aux utilisateurs de se connecter à l’aide de leurs identifiants.

Le système devra :

* vérifier les identifiants ;

* identifier le rôle de l’utilisateur ;

* appliquer les droits correspondant à son rôle ;

* permettre la déconnexion.

---

## BF02 — Gestion des utilisateurs

L’administrateur devra pouvoir :

* créer un utilisateur ;

* modifier un utilisateur ;

* désactiver un compte ;

* attribuer un rôle ;

* consulter la liste des utilisateurs.

---

## BF03 — Gestion des parcelles

Le système devra permettre de gérer les informations relatives aux parcelles.

Une parcelle pourra notamment posséder :

* un identifiant ;

* une référence cadastrale ;

* une localisation ;

* une superficie ;

* une géométrie ;

* les informations relatives au propriétaire ou titulaire selon les données disponibles ;

* un statut ;

* un historique.

---

# 8. CARTOGRAPHIE WEB-GIS

La cartographie constituera une composante centrale du système.

Le système devra fournir une carte interactive permettant :

* d’afficher les parcelles ;

* de zoomer ;

* de se déplacer sur la carte ;

* de sélectionner une parcelle ;

* d’afficher les informations d’une parcelle ;

* de rechercher une parcelle ;

* d’identifier les parcelles faisant l’objet d’un litige.

Le Web-GIS correspond à un système d’information géographique accessible à distance via un navigateur et reposant notamment sur une interface Web, un serveur cartographique et une base de données spatiale.

---

# 9. RECHERCHE DES PARCELLES

L’utilisateur autorisé devra pouvoir rechercher une parcelle à partir de différents critères disponibles dans la base.

Exemples :

* référence cadastrale ;

* propriétaire ou titulaire ;

* localisation ;

* commune ;

* préfecture ;

* statut ;

* numéro de dossier.

Le système devra afficher les résultats sous forme de liste et permettre de localiser la parcelle sélectionnée sur la carte.

---

# 10. GESTION DES PLAINTES

Le système devra permettre à l’acteur habilité d’enregistrer une plainte.

Une plainte pourra contenir :

* numéro de plainte ;

* date ;

* plaignant ;

* partie adverse ;

* parcelle concernée ;

* motif ;

* description ;

* pièces justificatives ;

* statut.

Après enregistrement, la plainte devra être associée à la parcelle concernée.

---

# 11. GESTION DES LITIGES

Une plainte pourra donner lieu à la création d’un dossier de litige.

Le système devra permettre de :

* créer un litige ;

* associer le litige à une parcelle ;

* enregistrer les parties concernées ;

* définir le statut du litige ;

* suivre son évolution ;

* enregistrer les événements importants ;

* clôturer le dossier lorsque le litige est résolu.

Exemples de statuts :

**Nouveau → En cours → En attente de décision → Décidé → Résolu / Clôturé**

---

# 12. SYSTÈME D’ALERTES

Le système devra intégrer un mécanisme d’alertes automatiques.

Une alerte pourra être générée lorsqu’un événement important concerne une parcelle.

Exemples :

* nouvelle plainte enregistrée ;

* création d’un litige ;

* modification du statut d’un litige ;

* décision judiciaire enregistrée ;

* nouvelle information importante concernant une parcelle.

Le principe de l’alerte dans le projet consiste à détecter automatiquement un événement prédéfini concernant une parcelle et à informer les acteurs concernés.

---

# 13. GESTION DES DÉCISIONS JUDICIAIRES

Le système devra permettre à l’acteur habilité d’enregistrer une décision judiciaire associée à un litige.

Une décision pourra contenir :

* numéro de décision ;

* date ;

* référence du dossier ;

* tribunal ;

* résumé de la décision ;

* document associé ;

* statut de la décision ;

* date de transmission.

Après enregistrement, le système pourra générer une notification ou une alerte destinée aux acteurs concernés.

---

# 14. HISTORIQUE D’UNE PARCELLE

Chaque parcelle devra disposer d’un historique permettant de retracer les événements importants.

L’historique pourra contenir :

| Date       | Événement   | Acteur   | Statut          |

| ---------- | ----------- | -------- | --------------- |

| 01/09/2026 | Création    | Cadastre | Actif           |

| 05/09/2026 | Plainte     | Tribunal | Litige          |

| 15/09/2026 | Décision    | Tribunal | Décision rendue |

| 18/09/2026 | Mise à jour | Cadastre | Mis à jour      |

L’objectif est de permettre aux utilisateurs autorisés de comprendre l’évolution d’une situation foncière.

---

# 15. TABLEAU DE BORD

Le système devra disposer d’un tableau de bord permettant de visualiser les principaux indicateurs.

Exemples :

* nombre total de parcelles ;

* nombre de parcelles faisant l’objet d’un litige ;

* nombre de plaintes ;

* nombre de litiges en cours ;

* nombre de litiges résolus ;

* nombre de décisions enregistrées ;

* nombre d’alertes actives.

Des graphiques pourront être utilisés pour faciliter l’analyse.

---

# 16. NOTIFICATIONS

Le système pourra proposer plusieurs types de notifications :

### Notification dans l’application

Une notification sera affichée directement dans l’interface.

### Notification par courrier électronique

Selon les besoins et les possibilités techniques, certaines alertes pourront être envoyées par e-mail.

Chaque notification devra comporter :

* la date ;

* le type d'événement ;

* la parcelle concernée ;

* le dossier concerné ;

* le niveau de priorité ;

* le statut de traitement.

---

# 17. RÈGLES DE GESTION

### RG01

Une parcelle possède un identifiant unique.

### RG02

Un litige doit être associé à au moins une parcelle.

### RG03

Une plainte doit être enregistrée par un utilisateur autorisé.

### RG04

Une plainte peut donner lieu à un litige.

### RG05

Une parcelle faisant l’objet d’un litige doit pouvoir être identifiée rapidement dans la cartographie.

### RG06

Un événement important concernant une parcelle peut générer une alerte.

### RG07

Une décision judiciaire doit être associée au dossier concerné.

### RG08

Les modifications importantes doivent être conservées dans l’historique.

### RG09

L’accès aux données dépend du rôle de l’utilisateur.

### RG10

Un utilisateur désactivé ne doit plus pouvoir accéder au système.

---

# 18. BESOINS NON FONCTIONNELS

## 18.1. Sécurité

Le système devra :

* protéger les comptes utilisateurs ;

* sécuriser les mots de passe ;

* contrôler les permissions ;

* protéger les données sensibles ;

* conserver les traces des opérations importantes.

## 18.2. Performance

L’application devra afficher rapidement les informations et permettre la consultation de la carte sans temps d’attente excessif.

## 18.3. Disponibilité

Le système devra être accessible aux utilisateurs autorisés lorsque le serveur est disponible.

## 18.4. Ergonomie

L'interface devra être :

* simple ;

* claire ;

* responsive ;

* adaptée aux utilisateurs non spécialistes de l'informatique.

## 18.5. Maintenabilité

Le code devra être organisé de manière modulaire afin de faciliter les évolutions et corrections.

---

# 19. ARCHITECTURE TECHNIQUE PROPOSÉE

Une architecture en trois niveaux est proposée :

### 1. Frontend

Interface Web permettant aux utilisateurs d'interagir avec le système.

Technologies possibles :

* Angular ou React ;

* HTML/CSS/JavaScript ;

* OpenLayers ou Leaflet pour la cartographie.

### 2. Backend

Le backend assurera :

* la logique métier ;

* l'authentification ;

* la gestion des utilisateurs ;

* la gestion des parcelles ;

* la gestion des plaintes ;

* la gestion des litiges ;

* la gestion des alertes ;

* la gestion des décisions ;

* les API.

Une solution possible est :

**Laravel + API REST**

### 3. Base de données

Une base de données relationnelle et spatiale sera utilisée.

Technologie proposée :

**PostgreSQL + PostGIS**

PostGIS permettra de stocker et manipuler les géométries des parcelles.

### 4. Serveur cartographique

Un serveur cartographique pourra être utilisé pour publier les données géographiques.

Technologie proposée :

**GeoServer**

---

# 20. ARCHITECTURE GÉNÉRALE

L'architecture envisagée est la suivante :

**Utilisateur**

↓

**Interface Web**

↓

**API / Backend Laravel**

↓

**Base de données PostgreSQL + PostGIS**

↓

**Données cadastrales / données géographiques**

Et parallèlement :

**PostGIS ↔ GeoServer ↔ Web-GIS**

Le frontend communiquera avec le backend à travers des API REST.

---

# 21. BASE DE DONNÉES

Les principales entités envisagées sont :

* Utilisateur

* Rôle

* Parcelle

* Propriétaire/Titulaire

* Plainte

* Litige

* Décision judiciaire

* Alerte

* Notification

* Historique

* Document

Relations principales :

**Utilisateur → crée → Plainte**

**Plainte → concerne → Parcelle**

**Plainte → peut créer → Litige**

**Litige → concerne → Parcelle**

**Litige → possède → Décision**

**Parcelle → possède → Historique**

**Parcelle → peut générer → Alerte**

**Alerte → est destinée à → Utilisateur**

---

# 22. INTERFACES PRÉVUES

## Interface 1 — Connexion

* Identifiant

* Mot de passe

* Bouton Connexion

## Interface 2 — Tableau de bord

* statistiques ;

* graphiques ;

* alertes récentes ;

* litiges récents ;

* notifications.

## Interface 3 — Carte

* carte interactive ;

* recherche ;

* filtres ;

* parcelles ;

* informations détaillées.

## Interface 4 — Détail d’une parcelle

* informations générales ;

* localisation ;

* statut ;

* litiges ;

* plaintes ;

* décisions ;

* historique.

## Interface 5 — Gestion des plaintes

* liste des plaintes ;

* création ;

* modification ;

* consultation ;

* recherche.

## Interface 6 — Gestion des litiges

* liste ;

* création ;

* suivi ;

* changement de statut ;

* historique.

## Interface 7 — Décisions judiciaires

* liste ;

* ajout ;

* consultation ;

* association à un litige.

## Interface 8 — Alertes

* alertes actives ;

* alertes traitées ;

* détail ;

* statut de traitement.

## Interface 9 — Administration

* utilisateurs ;

* rôles ;

* permissions ;

* paramètres.

---

# 23. DIAGRAMMES UML À RÉALISER

Le projet devra être accompagné de plusieurs diagrammes UML.

### Diagramme de cas d’utilisation

Il permettra d’identifier les interactions entre :

* Administrateur ;

* Agent du cadastre ;

* Agent du tribunal ;

* Utilisateur consultant.

### Diagramme de classes

Il représentera notamment :

* Utilisateur ;

* Rôle ;

* Parcelle ;

* Plainte ;

* Litige ;

* Décision ;

* Alerte ;

* Notification ;

* Historique.

### Diagrammes de séquence

Des diagrammes pourront être réalisés pour :

1. authentification ;

2. enregistrement d’une plainte ;

3. création d’un litige ;

4. génération d’une alerte ;

5. enregistrement d’une décision ;

6. mise à jour du statut d’une parcelle.

### Diagramme d’activité

Il représentera le processus global de gestion d’un litige.

### Diagramme de déploiement

Il représentera l’organisation technique du système.

---

# 24. PROCESSUS MÉTIER PRINCIPAL

Le fonctionnement général sera :

### Étape 1 — Dépôt d’une plainte

L’agent habilité enregistre une plainte.

### Étape 2 — Identification de la parcelle

La parcelle concernée est recherchée dans la base.

### Étape 3 — Création du litige

Un dossier de litige est créé et associé à la parcelle.

### Étape 4 — Génération de l’alerte

Le système génère automatiquement une alerte.

### Étape 5 — Notification

Les acteurs autorisés reçoivent l'information.

### Étape 6 — Traitement judiciaire

Le dossier est traité par l’autorité compétente.

### Étape 7 — Décision

La décision judiciaire est enregistrée dans le système.

### Étape 8 — Mise à jour

Les informations relatives à la parcelle et au litige sont mises à jour.

### Étape 9 — Clôture

Le dossier est clôturé lorsque la procédure est terminée.

---

# 25. TECHNOLOGIES PROPOSÉES

| Composant              | Technologie proposée          |

| ---------------------- | ----------------------------- |

| Frontend               | Angular                       |

| Backend                | Laravel                       |

| API                    | REST                          |

| Base de données        | PostgreSQL                    |

| Extension spatiale     | PostGIS                       |

| Serveur cartographique | GeoServer                     |

| Cartographie Web       | OpenLayers                    |

| Authentification       | Laravel Sanctum               |

| Versionnement          | Git / GitHub                  |

| Conception             | UML / PlantUML                |

| Environnement          | VS Code / IntelliJ / PhpStorm |

Ces technologies constituent une **proposition technique** pour réaliser le système et pourront être adaptées après validation des contraintes réelles du projet.

---

# 26. SÉCURITÉ

Le système devra mettre en place :

* authentification sécurisée ;

* gestion des rôles ;

* contrôle d’accès ;

* protection des API ;

* validation des données ;

* journalisation des actions ;

* sauvegarde de la base de données ;

* protection des documents associés aux dossiers.

Les utilisateurs ne devront accéder qu’aux informations correspondant à leurs autorisations.

---

# 27. SAUVEGARDE ET RESTAURATION

Le système devra prévoir :

* des sauvegardes régulières ;

* une procédure de restauration ;

* une sauvegarde de la base de données ;

* une sauvegarde des documents associés ;

* une stratégie permettant de limiter la perte de données.

---

# 28. PLANNING PRÉVISIONNEL

| Phase    | Activités                          |

| -------- | ---------------------------------- |

| Phase 1  | Analyse des besoins                |

| Phase 2  | Rédaction du cahier des charges    |

| Phase 3  | Analyse et conception              |

| Phase 4  | Modélisation UML                   |

| Phase 5  | Conception de la base de données   |

| Phase 6  | Développement Backend              |

| Phase 7  | Développement Frontend             |

| Phase 8  | Intégration Web-GIS                |

| Phase 9  | Développement du système d’alertes |

| Phase 10 | Tests                              |

| Phase 11 | Corrections                        |

| Phase 12 | Déploiement                        |

| Phase 13 | Documentation                      |

---

# 29. LIVRABLES

À la fin du projet, les livrables prévus seront :

1. cahier des charges ;

2. dossier d’analyse ;

3. diagrammes UML ;

4. modèle conceptuel de données ;

5. modèle logique de données ;

6. script de création de la base de données ;

7. code source Backend ;

8. code source Frontend ;

9. configuration du serveur cartographique ;

10. application Web-GIS fonctionnelle ;

11. documentation technique ;

12. manuel utilisateur ;

13. rapport de tests ;

14. version déployée du système.

---

# 30. CRITÈRES DE VALIDATION

Le projet pourra être considéré comme fonctionnel lorsque :

* un utilisateur peut se connecter ;

* les droits d'accès sont respectés ;

* les parcelles peuvent être consultées ;

* les parcelles peuvent être visualisées sur une carte ;

* une plainte peut être enregistrée ;

* une plainte peut être associée à une parcelle ;

* un litige peut être créé ;

* le litige peut être suivi ;

* une alerte peut être générée ;

* une décision judiciaire peut être enregistrée ;

* l'historique d'une parcelle peut être consulté ;

* les informations peuvent être recherchées ;

* les données sont correctement enregistrées ;

* les opérations sensibles sont sécurisées.

---

# 31. CONTRAINTES ET RISQUES

Le développement du système pourra être confronté à plusieurs contraintes :

### Disponibilité des données

La qualité du système dépendra de la disponibilité et de la fiabilité des données cadastrales et géographiques.

### Qualité des données

Les données provenant de différentes sources peuvent présenter des différences de format, de précision ou de structure.

### Sécurité

Les données foncières et judiciaires peuvent nécessiter des niveaux de protection importants.

### Interopérabilité

Le système devra pouvoir échanger des informations avec les systèmes ou bases de données existants lorsque cela sera techniquement et institutionnellement possible.

### Infrastructure

Le fonctionnement du Web-GIS dépendra de la disponibilité du serveur, du réseau et des ressources informatiques nécessaires.

---

# 32. ÉVOLUTIONS FUTURES

Les évolutions possibles pourront inclure :

* application mobile ;

* notifications SMS ;

* signature électronique ;

* intégration avec d’autres systèmes institutionnels ;

* analyse automatique des chevauchements de parcelles ;

* détection automatique d’anomalies spatiales ;

* statistiques avancées ;

* intelligence artificielle pour l’analyse des risques ;

* consultation publique avec données limitées ;

* système avancé de suivi des transactions.

---

# 33. CONCLUSION

Le présent cahier des charges définit les principales fonctionnalités, contraintes et orientations techniques du projet de mise en place d’un système d’alerte SIG Web pour la gestion des litiges fonciers.

Le système aura pour objectif de centraliser les informations relatives aux parcelles, de faciliter leur consultation cartographique, d’améliorer le suivi des plaintes et litiges et de permettre la transmission des informations importantes entre les acteurs concernés.

L’approche proposée repose sur l’utilisation d’une base de données géospatiale, d’un Web-GIS et d’un mécanisme d’alertes permettant de suivre les événements associés aux parcelles.

La conception devra ensuite être approfondie à travers l’analyse des besoins, la modélisation UML, la conception de la base de données et la définition précise de l’architecture technique.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/edbe417d-0702-5053-b49b-7ff9f9095e26).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
