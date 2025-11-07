# IOFD Mobile App

Application mobile React Native pour IOFD (Base de données islamique).

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
- Copier `.env.example` en `.env`
- Remplir les variables `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. Lancer l'application :
```bash
npm start
```

## Structure

- `app/` - Pages et routes de l'application
  - `index.tsx` - Page d'accueil avec boutons login/signup
  - `(auth)/` - Pages d'authentification (login, signup)
  - `(tabs)/` - Onglets principaux (Contribuer, Scanner, Profil)
  - `product/[barcode].tsx` - Page de détails d'un produit

- `constants/` - Constantes et thèmes
  - `paperTheme.ts` - Thème React Native Paper basé sur Vuetify

- `contexts/` - Contextes React
  - `AuthContext.tsx` - Contexte d'authentification Supabase

- `lib/` - Bibliothèques et utilitaires
  - `supabase.ts` - Client Supabase

## Fonctionnalités

- ✅ Splash screen de 3 secondes
- ✅ Page d'accueil avec login/signup
- ✅ Authentification Supabase
- ✅ 3 onglets : Contribuer, Scanner, Profil
- ✅ Scanner de code-barres
- ✅ Ajout de produits
- ✅ Affichage des détails d'un produit
- ✅ Profil utilisateur avec statistiques

## Technologies

- React Native (Expo)
- React Native Paper
- Expo Router
- Supabase
- Expo Camera (scanner de code-barres)
