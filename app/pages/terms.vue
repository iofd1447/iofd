<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Conditions d'utilisation</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>3088540004440

  <v-main>
    <v-container class="py-8" style="max-width: 900px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="info" class="mb-4">
          <v-icon size="50" color="white">mdi-file-document-edit</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Conditions d'utilisation</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Dernière mise à jour : {{ lastUpdated }}</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">1. Acceptation des conditions</h2>
          <p class="text-body-1 mb-4">
            En accédant et en utilisant IOFD (Islamic Open Food Database), vous acceptez d'être lié par ces conditions
            d'utilisation.
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce service.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">2. Utilisation du service</h2>
          <p class="text-body-1 mb-4">
            IOFD est une base de données collaborative permettant de vérifier le statut halal des produits alimentaires.
            Vous vous engagez à utiliser ce service de manière légale et conforme à ces conditions.
          </p>
          <v-list>
            <v-list-item prepend-icon="mdi-check-circle" title="Vous pouvez consulter les informations disponibles" />
            <v-list-item prepend-icon="mdi-check-circle"
              title="Vous pouvez contribuer en ajoutant des produits ou des informations" />
            <v-list-item prepend-icon="mdi-alert-circle"
              title="Vous ne devez pas utiliser le service à des fins commerciales sans autorisation" />
            <v-list-item prepend-icon="mdi-alert-circle" title="Vous ne devez pas diffuser de fausses informations" />
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">3. Contenu et contributions</h2>
          <p class="text-body-1 mb-4">
            En contribuant à IOFD, vous garantissez que :
          </p>
          <v-list>
            <v-list-item prepend-icon="mdi-shield-check"
              title="Les informations fournies sont exactes et vérifiables" />
            <v-list-item prepend-icon="mdi-shield-check" title="Vous avez le droit de partager ces informations" />
            <v-list-item prepend-icon="mdi-shield-check"
              title="Vous respectez les droits de propriété intellectuelle" />
          </v-list>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">4. Avertissement</h2>
          <p class="text-body-1 mb-4">
            Les informations présentes sur IOFD sont fournies à titre informatif uniquement.
            Bien que nous nous efforcions de maintenir l'exactitude des données, nous ne garantissons pas
            que toutes les informations sont complètes, à jour ou exemptes d'erreurs.
          </p>
          <p class="text-body-1">
            Les utilisateurs doivent effectuer leurs propres vérifications et consulter des experts religieux
            qualifiés pour des questions spécifiques concernant le statut halal des produits.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">5. Limitation de responsabilité</h2>
          <p class="text-body-1 mb-4">
            IOFD ne peut être tenu responsable des dommages directs, indirects, accessoires ou consécutifs
            résultant de l'utilisation ou de l'impossibilité d'utiliser ce service.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">6. Modifications des conditions</h2>
          <p class="text-body-1">
            Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment.
            Les modifications entrent en vigueur dès leur publication sur cette page.
            Il est de votre responsabilité de consulter régulièrement ces conditions.
          </p>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-4">7. Contact</h2>
          <p class="text-body-1 mb-4">
            Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter :
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
// @ts-nocheck
import moment from 'moment-hijri';
import 'moment/locale/fr';

useHead({
  title: 'IOFD - Conditions d\'utilisation'
})

const lastUpdated = moment().locale('fr').format('iD iMMMM iYYYY');
</script>

<style scoped></style>
