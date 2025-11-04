<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Confidentialité</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="warning" class="mb-4">
          <v-icon size="50" color="white">mdi-shield-lock</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Politique de confidentialité</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Dernière mise à jour : {{ lastUpdated }}</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">1. Introduction</h2>
          <p class="text-body-1 mb-4">
            IOFD (Islamic Open Food Database) s'engage à protéger votre vie privée.
            Cette politique explique comment nous collectons, utilisons et protégeons vos informations personnelles.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">2. Informations collectées</h2>
          <p class="text-body-1 mb-4">
            Nous collectons différents types d'informations selon votre utilisation de IOFD :
          </p>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="info" class="mr-4">mdi-information</v-icon>
              </template>
              <v-list-item-title>Informations publiques</v-list-item-title>
              <v-list-item-subtitle>Les contributions que vous faites à la base de données (produits, additifs, etc.)
                sont
                publiques</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon color="info" class="mr-4">mdi-account</v-icon>
              </template>
              <v-list-item-title>Compte utilisateur</v-list-item-title>
              <v-list-item-subtitle>Si vous créez un compte, nous collectons votre nom d'utilisateur et votre adresse
                email</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">3. Utilisation des informations</h2>
          <p class="text-body-1 mb-4">
            Nous utilisons vos informations pour :
          </p>
          <v-list>
            <v-list-item prepend-icon="mdi-check-circle" title="Fournir et améliorer le service IOFD" />
            <v-list-item prepend-icon="mdi-check-circle" title="Vous permettre de contribuer à la base de données" />
            <v-list-item prepend-icon="mdi-check-circle"
              title="Vous contacter concernant vos contributions ou votre compte" />
            <v-list-item prepend-icon="mdi-check-circle" title="Analyser l'utilisation du service pour l'améliorer" />
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">4. Partage des informations</h2>
          <p class="text-body-1 mb-4">
            Nous ne vendons pas vos informations personnelles à des tiers. Nous pouvons partager vos informations
            uniquement
            dans les cas suivants :
          </p>
          <v-list>
            <v-list-item prepend-icon="mdi-shield-check" title="Avec votre consentement explicite" />
            <v-list-item prepend-icon="mdi-shield-check" title="Pour se conformer à une obligation légale" />
            <v-list-item prepend-icon="mdi-shield-check"
              title="Pour protéger nos droits et la sécurité des utilisateurs" />
          </v-list>
          <p class="text-body-1 mt-4">
            Notez que vos contributions publiques (produits, additifs) sont visibles par tous les utilisateurs.
          </p>
        </v-card-text>
      </v-card>


      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">5. Vos droits</h2>
          <p class="text-body-1 mb-4">
            Vous avez le droit de :
          </p>
          <v-list>
            <v-list-item prepend-icon="mdi-file" title="Accéder à vos données personnelles" />
            <v-list-item prepend-icon="mdi-pencil" title="Corriger vos données personnelles" />
            <v-list-item prepend-icon="mdi-delete" title="Demander la suppression de vos données" />
            <v-list-item prepend-icon="mdi-download" title="Exporter vos données" />
            <v-list-item prepend-icon="mdi-cancel" title="Vous opposer au traitement de vos données" />
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">6. Sécurité</h2>
          <p class="text-body-1">
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées
            pour protéger vos informations contre l'accès non autorisé, la modification, la divulgation ou la
            destruction.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">7. Modifications de cette politique</h2>
          <p class="text-body-1">
            Nous pouvons modifier cette politique de confidentialité à tout moment.
            Les modifications seront publiées sur cette page avec une mise à jour de la date de dernière modification.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">8. Contact</h2>
          <p class="text-body-1 mb-4">
            Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits,
            veuillez nous contacter :
          </p>
          <v-btn color="primary" prepend-icon="mdi-email" href="mailto:contact@iofd.org">
            iofd1447@gmail.com
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">

useHead({
  title: 'IOFD - Vos données sont notre priorité'
})

const lastUpdated = new Intl.DateTimeFormat('fr-FR-u-ca-islamic', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())
</script>

<style scoped></style>
