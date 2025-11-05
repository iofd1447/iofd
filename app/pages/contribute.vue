<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Contribuer</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="primary" class="mb-4">
          <v-icon size="50" color="white">mdi-hand-heart</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Contribuez</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Aidez la communauté à grandir</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Comment contribuer ?</h2>
          <v-list>
            <v-list-item prepend-icon="mdi-plus-circle">
              <v-list-item-title>Ajouter des produits</v-list-item-title>
              <v-list-item-subtitle>Enrichissez notre base avec de nouveaux produits</v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-shield-check">
              <v-list-item-title>Vérifier les informations</v-list-item-title>
              <v-list-item-subtitle>Corrigez et améliorez les données existantes</v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-comment">
              <v-list-item-title>Partager vos avis</v-list-item-title>
              <v-list-item-subtitle>Ajoutez vos retours d'expérience sur les produits</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-btn color="primary" class="mt-4" to="/products/add" prepend-icon="mdi-plus">
            Ajouter un produit maintenant
          </v-btn>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Guide de contribution</h2>
          <p class="text-body-1 mb-4">
            Pour garantir la qualité des données, voici quelques recommandations :
          </p>
          <ul class="text-body-1">
            <li class="mb-2">Vérifiez les informations du code-barres</li>
            <li class="mb-2">Ajoutez des photos claires du produit</li>
            <li class="mb-2">Consultez les certifications halal officielles</li>
            <li class="mb-2">Respectez la confidentialité et la tolérance</li>
          </ul>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
useHead({
  title: 'IFOD - Contribute'
})
</script>

<style scoped></style>
