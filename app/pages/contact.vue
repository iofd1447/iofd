<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Contact</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="primary" class="mb-4">
          <v-icon size="50" color="white">mdi-email</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Contactez-nous</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Nous sommes là pour vous aider</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Informations de contact</h2>
          <v-list>
            <v-list-item prepend-icon="mdi-email" title="Email">
              <template #append>
                <v-btn color="primary" variant="text" href="mailto:iofd1447@gmail.com">
                  iofd1447@gmail.com
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Pourquoi nous contacter ?</h2>
          <v-list>
            <v-list-item prepend-icon="mdi-help-circle" title="Questions générales"
              subtitle="Besoin d'informations sur IOFD ?" />
            <v-list-item prepend-icon="mdi-bug" title="Signaler un problème"
              subtitle="Vous avez rencontré un bug ou une erreur ?" />
            <v-list-item prepend-icon="mdi-lightbulb" title="Suggestions"
              subtitle="Vous avez une idée pour améliorer IOFD ?" />
            <v-list-item prepend-icon="mdi-shield-alert" title="Signaler du contenu"
              subtitle="Vous avez repéré des informations incorrectes ?" />
            <v-list-item prepend-icon="mdi-handshake" title="Partenariats" subtitle="Intéressé par un partenariat ?" />
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Temps de réponse</h2>
          <p class="text-body-1 mb-4">
            Nous nous efforçons de répondre à toutes les demandes dans les meilleurs délais.
            Généralement, vous recevrez une réponse sous 24-48 heures.
          </p>
          <p class="text-body-1">
            Pour les questions urgentes concernant la sécurité ou le contenu inapproprié,
            nous traitons ces demandes en priorité.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">Contribuer à IOFD</h2>
          <p class="text-body-1 mb-4">
            La meilleure façon de nous aider est de contribuer à la base de données en ajoutant
            des produits, des informations sur les additifs, ou en améliorant les données existantes.
          </p>
          <v-btn color="primary" prepend-icon="mdi-plus-circle" @click="$router.push('/products/add')">
            Ajouter un produit
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">

useHead({
  title: 'IOFD - Contact'
})

const lastUpdated = new Intl.DateTimeFormat('fr-FR-u-ca-islamic', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())
</script>

<style scoped></style>
