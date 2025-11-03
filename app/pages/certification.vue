<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Certification</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="primary" class="mb-4">
          <v-icon size="50" color="white">mdi-certificate</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Certification</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Processus et informations sur la certification halal</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Le processus de certification</h2>
          <p class="text-body-1 mb-4">
            La certification halal garantit que les produits respectent les normes islamiques strictes.
            Ce processus comprend :
          </p>
          <v-timeline side="end" class="mt-4">
            <v-timeline-item dot-color="primary">
              <div class="text-body-1 font-weight-medium">Inspection des ingrédients</div>
              <div class="text-body-2 text-medium-emphasis">Vérification de l'origine de tous les composants</div>
            </v-timeline-item>
            <v-timeline-item dot-color="primary">
              <div class="text-body-1 font-weight-medium">Contrôle de la production</div>
              <div class="text-body-2 text-medium-emphasis">Audit des installations et des processus</div>
            </v-timeline-item>
            <v-timeline-item dot-color="primary">
              <div class="text-body-1 font-weight-medium">Attribution du certificat</div>
              <div class="text-body-2 text-medium-emphasis">Délivrance du certificat halal officiel</div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Informations importantes</h2>
          <v-alert type="info" variant="tonal" rounded="lg" class="mb-4">
            <strong>Note :</strong> IOFD est une plateforme collaborative. Les informations sont fournies par la
            communauté
            et doivent être vérifiées. Consultez toujours les certifications officielles pour les produits critiques.
          </v-alert>
          <p class="text-body-2 text-medium-emphasis">
            Pour obtenir une certification pour votre entreprise, contactez directement un organisme certificateur
            reconnu.
          </p>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
</script>

<style scoped></style>
