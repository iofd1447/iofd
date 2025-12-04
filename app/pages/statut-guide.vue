<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Guide des statuts</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="success" class="mb-4">
          <v-icon size="50" color="white">mdi-book-open-variant</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Guides des statuts </h1>
        <p class="text-subtitle-1 text-medium-emphasis">Comprendre les différents statuts</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Les statuts</h2>
          <v-list v-for="value in values">
            <v-list-item>
              <template #prepend>
                <v-icon :color="value.color" class="mr-4">{{ value.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ value.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ value.subtitle }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Organismes certificateurs</h2>
          <p class="text-body-1 mb-4">
            Voici quelques organismes de certification halal reconnus :
          </p>
          <v-list v-for="org in halalCheckingCompany">
            <v-list-item prepend-icon="mdi-certificate">
              <v-list-item-title>{{ org }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'IFOD - statut guide'
})

const values = ref([
  { title: 'Mustahab', subtitle: 'Produit recommandé', icon: 'mdi-decagram-check', color: 'mustahab' },
  { title: 'Halal', subtitle: 'Produit conforme aux principes islamiques', icon: 'mdi-check-circle', color: 'success' },
  { title: 'Haram', subtitle: 'Produit interdit selon les principes islamiques', icon: 'mdi-alert-circle', color: 'error' },
  { title: 'Mashbuh', subtitle: 'Le statut halal est incertain ou débattu', icon: 'mdi-alert', color: 'warning' },
  { title: 'Makruh', subtitle: 'Produit non recommandé', icon: 'mdi-decagram-alert', color: 'makruh' },
])

const halalCheckingCompany = ref([
  'AVS',
  'Halal Monitoring Committee',
  'Taiwan Halal Integrity Development Association',
])
</script>

<style scoped></style>
