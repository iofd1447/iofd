# Système de Sitemap Intelligent

Ce système génère automatiquement des sitemaps XML pour améliorer le référencement SEO.

## Structure

1. **`sitemap.xml`** - Sitemap principal (index) qui référence tous les autres sitemaps
2. **`sitemap-static.xml`** - Pages statiques (about, contact, etc.)
3. **`sitemap-products-[index].xml`** - Pages de produits (dynamiques, paginées)
4. **`sitemap-additives-[index].xml`** - Pages d'additifs (dynamiques, paginées)
5. **`sitemap-contributions.xml`** - Pages de contributions (limitées aux 1000 plus récentes)

## Configuration

Ajoutez dans votre `.env` ou `nuxt.config.ts` :

```env
NUXT_PUBLIC_SITE_URL=https://votre-domaine.com
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

## URLs générées

- `/sitemap.xml` - Sitemap principal
- `/sitemap-static.xml` - Pages statiques
- `/sitemap-products-1.xml`, `/sitemap-products-2.xml`, etc. - Produits
- `/sitemap-additives-1.xml`, `/sitemap-additives-2.xml`, etc. - Additifs
- `/sitemap-contributions.xml` - Contributions

## Limites

- Maximum 50 000 URLs par sitemap (recommandation Google)
- Les sitemaps sont automatiquement paginés si nécessaire
- Cache de 1 heure (3600 secondes)

