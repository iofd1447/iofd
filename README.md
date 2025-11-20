# IOFD - Islamic Open Food Database

<div align="center">

[![Nuxt](https://img.shields.io/badge/Nuxt-4.2.0-00DC82?style=flat-square&logo=nuxt.js)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5.22-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.10.8-1867C0?style=flat-square&logo=vuetify)](https://vuetifyjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.78.0-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

</div>

## 📖 À propos

IOFD (Islamic Open Food Database) est une application web collaborative dédiée à l'identification et à la vérification des produits alimentaires conformes aux principes halal. Notre mission est de fournir aux consommateurs musulmans une ressource fiable, accessible et gratuite pour faire des choix éclairés dans leur alimentation quotidienne.

### Nos valeurs

- **Transparence** : Informations vérifiables et sourcées
- **Communauté** : Construire ensemble une ressource collective
- **Accessibilité** : Gratuit et ouvert à tous

## ✨ Fonctionnalités principales

### 🔍 Recherche de produits
- Recherche par nom, code-barres (EAN-13), ou catégorie
- Scanner de code-barres intégré
- Filtrage avancé par statut halal, labels, allergènes

### 📊 Informations détaillées
- **Statut Halal** : Halal, Haram, Douteux (Mashbuh), Non vérifié
- **Certifications** : Organismes certificateurs, numéros de certificat
- **Valeurs nutritionnelles** : Calories, protéines, glucides, lipides, etc.
- **Composition** : Ingrédients, additifs, allergènes
- **Labels et certifications** : Bio, équitable, etc.

### 👥 Contribution communautaire
- **Ajout de produits** : Formulaire complet avec stepper multi-étapes
- **Modification de produits** : Édition complète des informations
- **Avis et commentaires** : Notation et commentaires sur les produits
- **Historique des contributions** : Suivi de toutes vos contributions

### 📱 Responsive Design
- Interface optimisée pour mobile, tablette et desktop
- Navigation intuitive avec menu adaptatif
- Design moderne avec Vuetify 3

### 🔐 Authentification
- Système d'authentification sécurisé avec Supabase
- Gestion de profil utilisateur
- Suivi des contributions personnelles

## 🛠️ Technologies utilisées

### Frontend
- **[Nuxt 4](https://nuxt.com)** - Framework Vue.js pour applications universelles
- **[Vue 3](https://vuejs.org)** - Framework JavaScript progressif
- **[Vuetify 3](https://vuetifyjs.com)** - Framework Material Design pour Vue
- **[TypeScript](https://www.typescriptlang.org)** - Typage statique pour JavaScript

### Backend & Base de données
- **[Supabase](https://supabase.com)** - Backend as a Service (PostgreSQL, Auth, Storage)
- **PostgreSQL** - Base de données relationnelle

### Utilitaires
- **[Moment Hijri](https://github.com/xsoh/moment-hijri)** - Support du calendrier hijri
- **[AOS](https://michalsnik.github.io/aos/)** - Animations au scroll

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Compte Supabase (pour la base de données)


## 📁 Structure du projet

```
IOFD/
├── app/                    # Code source de l'application
│   ├── components/         # Composants Vue réutilisables
│   ├── composables/       # Composable functions (Vue 3)
│   ├── pages/             # Pages de l'application
│   │   ├── products/      # Pages produits
│   │   ├── additives/     # Pages additifs
│   │   ├── auth/          # Authentification
│   │   └── contributions/ # Contributions utilisateur
│   ├── plugins/           # Plugins Nuxt
│   └── utils/             # Fonctions utilitaires
├── db/                    # Scripts SQL
│   └── IOFD.sql          # Schéma de base de données
├── public/                # Fichiers statiques
├── server/                # Routes serveur Nuxt
│   └── routes/           # Sitemaps XML
├── nuxt.config.ts        # Configuration Nuxt
├── package.json          # Dépendances npm
└── README.md            # Ce fichier
```

## 🎯 Fonctionnalités détaillées

### Gestion des produits

- **Recherche avancée** : Par nom, code-barres, catégorie
- **Scanner de code-barres** : Utilisation de la caméra pour scanner
- **Fiche produit complète** : Toutes les informations en un coup d'œil
- **Édition** : Modification complète via dialogue avec stepper

### Système de contribution

- **Ajout de produits** : Formulaire en 4 étapes
  1. Informations de base
  2. Statut Halal
  3. Composition (ingrédients, additifs, allergènes, labels)
  4. Valeurs nutritionnelles
- **Historique** : Suivi de toutes vos contributions
- **Avis** : Laisser des commentaires et notes sur les produits

### Base de données d'additifs

- **Recherche d'additifs** : Par code E ou nom
- **Informations détaillées** : Statut halal, origine, fonction
- **Filtrage** : Par statut halal

## 🗄️ Base de données

La base de données PostgreSQL comprend les tables suivantes :

- `products` - Produits alimentaires
- `categories` - Catégories de produits
- `halal_certifications` - Certifications halal
- `nutrition_facts` - Valeurs nutritionnelles
- `ingredients` - Ingrédients
- `additives` - Additifs alimentaires
- `allergens` - Allergènes
- `labels` - Labels et certifications
- `community_reviews` - Avis de la communauté
- `product_contributors` - Historique des contributions
- `users` - Utilisateurs

Voir `db/IOFD.sql` pour le schéma complet.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines de contribution

- Suivez les conventions de code existantes
- Ajoutez des tests si applicable
- Documentez les nouvelles fonctionnalités
- Assurez-vous que le code est responsive

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

Pour toute question ou suggestion :

- **Email** : iofd1447@gmail.com
- **Site web** : https://iofd.pages.dev (domaine disponible demain)

## 👊 Remerciements

- À tous les contributeurs qui enrichissent la base de données
- À la communauté musulmane pour son soutien
- Aux technologies open-source qui rendent ce projet possible

---

<div align="center">


**IOFD - Islamic Open Food Database**

</div>
