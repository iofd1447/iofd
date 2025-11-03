<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• À propos</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="primary" class="mb-4">
          <v-icon size="50" color="white">mdi-information</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">À propos</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Islamic Open Food Database</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Notre mission</h2>
          <p class="text-body-1 mb-4">
            IOFD (Islamic Open Food Database) est une base de données collaborative dédiée à l'identification
            et à la vérification des produits alimentaires conforme aux principes halal.
          </p>
          <p class="text-body-1">
            Notre objectif est de fournir aux consommateurs musulmans une ressource fiable et accessible
            pour faire des choix éclairés dans leur alimentation quotidienne.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Nos valeurs</h2>
          <v-list>
            <v-list-item prepend-icon="mdi-shield-check">
              <v-list-item-title>Transparence</v-list-item-title>
              <v-list-item-subtitle>Informations vérifiables et sourcées</v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-account-group">
              <v-list-item-title>Communauté</v-list-item-title>
              <v-list-item-subtitle>Construire ensemble une ressource collective</v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-globe">
              <v-list-item-title>Accessibilité</v-list-item-title>
              <v-list-item-subtitle>Gratuit et ouvert à tous</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Contact</h2>
          <p class="text-body-1 mb-4">
            Vous avez des questions ou des suggestions ? Contactez-nous :
          </p>
          <v-btn color="primary" prepend-icon="mdi-email" href="mailto:contact@iofd.org">
            contact@iofd.org
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
</script>

<style scoped></style>
