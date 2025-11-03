<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Guide Halal</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="success" class="mb-4">
          <v-icon size="50" color="white">mdi-book-open-variant</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Guide Halal</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Comprendre les certifications et le statut halal</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Les statuts Halal</h2>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-chip color="success" class="mr-4">✓</v-chip>
              </template>
              <v-list-item-title>Halal</v-list-item-title>
              <v-list-item-subtitle>Produit conforme aux principes islamiques</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-chip color="error" class="mr-4">✗</v-chip>
              </template>
              <v-list-item-title>Haram</v-list-item-title>
              <v-list-item-subtitle>Produit interdit selon les principes islamiques</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-chip color="warning" class="mr-4">⚠</v-chip>
              </template>
              <v-list-item-title>Douteux</v-list-item-title>
              <v-list-item-subtitle>Le statut halal est incertain ou débattu</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-chip color="grey" class="mr-4">?</v-chip>
              </template>
              <v-list-item-title>Non vérifié</v-list-item-title>
              <v-list-item-subtitle>Aucune information disponible pour le moment</v-list-item-subtitle>
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
          <v-list>
            <v-list-item prepend-icon="mdi-certificate">
              <v-list-item-title>AVS (Association Véritas)</v-list-item-title>
            </v-list-item>
            <v-list-item prepend-icon="mdi-certificate">
              <v-list-item-title>SFCVH (Société Française de Contrôle Vérité Halal)</v-list-item-title>
            </v-list-item>
            <v-list-item prepend-icon="mdi-certificate">
              <v-list-item-title>JAKIM (Malaisie)</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
</script>

<style scoped></style>
