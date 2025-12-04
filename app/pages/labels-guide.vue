<template>
  <v-app-bar elevation="0" :class="['px-2 px-sm-4']" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="$router.back()" />

    <v-app-bar-title :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Guide des labels</span>
    </v-app-bar-title>

    <v-spacer />
  </v-app-bar>

  <v-main>
    <section class="hero-section">
      <v-container class="py-6 py-sm-8" style="max-width: 1200px;">
        <div class="text-center mb-6 mb-sm-8">
          <v-chip color="tertiary" variant="tonal" :size="$vuetify.display.xs ? 'default' : 'large'"
            class="mb-3 mb-sm-4">
            <v-icon start :size="$vuetify.display.xs ? '18' : '20'">mdi-certificate</v-icon>
            <span class="d-none d-sm-inline">Certifications & Labels</span>
            <span class="d-inline d-sm-none">Labels</span>
          </v-chip>
          <h1 class="hero-title mb-3">
            Guide des Labels Alimentaires
          </h1>
          <p class="text-body-2 text-sm-subtitle-1 text-medium-emphasis px-2 px-sm-4"
            style="max-width: 700px; margin: 0 auto;">
            Découvrez la signification des différents labels et certifications que vous retrouvez sur les produits
            alimentaires
          </p>
        </div>
      </v-container>
    </section>

    <v-container style="max-width: 1200px;" class="py-4 py-sm-6">
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="text-body-2 text-medium-emphasis mt-4">Chargement des labels...</p>
      </div>

      <v-row v-else>
        <v-col v-for="label in sortedLabels" :key="label.id" cols="12" sm="6" md="4">
          <v-card class="label-card h-100" elevation="2" rounded="xl" hover>
            <v-card-text class="pa-4 pa-sm-6">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-avatar :color="getLabelColor(label.name)" size="48" class="mr-3">
                  <v-icon color="white" size="24">{{ getLabelIcon(label.name) }}</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-bold">{{ label.name }}</h3>
                  <v-chip v-if="getLabelCategory(label.name)"
                    :color="getCategoryColorByName(getLabelCategory(label.name))" size="x-small" variant="tonal"
                    class="mt-1">
                    {{ getLabelCategory(label.name) }}
                  </v-chip>
                </div>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ label.description }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6 mt-sm-8">
        <v-col cols="12">
          <v-card elevation="0" rounded="xl" color="primary-lighten-5" class="border-primary-lighten-4 border">
            <v-card-text class="pa-4 pa-sm-6">
              <div class="d-flex align-start">
                <v-icon color="primary" size="28" class="mr-3 mt-1">mdi-information</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold text-primary mb-2">À propos des labels</h3>
                  <p class="text-body-2 text-medium-emphasis mb-2">
                    Les labels alimentaires sont des certifications qui garantissent certaines qualités ou
                    caractéristiques
                    des produits. Ils permettent aux consommateurs de faire des choix éclairés selon leurs besoins et
                    convictions.
                  </p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Sur IOFD, nous référençons les principaux labels pour vous aider à identifier rapidement les
                    produits
                    qui correspondent à vos critères de consommation.
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="0" rounded="xl" variant="outlined">
            <v-card-text class="pa-4 pa-sm-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">Catégories de labels</h3>
              <div class="d-flex flex-wrap ga-2">
                <v-chip color="success" variant="tonal" size="small">
                  <v-icon start size="16">mdi-leaf</v-icon>
                  Environnement & Bio
                </v-chip>
                <v-chip color="info" variant="tonal" size="small">
                  <v-icon start size="16">mdi-food-variant</v-icon>
                  Régimes alimentaires
                </v-chip>
                <v-chip color="secondary" variant="tonal" size="small">
                  <v-icon start size="16">mdi-shield-check</v-icon>
                  Certifications religieuses
                </v-chip>
                <v-chip color="warning" variant="tonal" size="small">
                  <v-icon start size="16">mdi-alert</v-icon>
                  Santé & Allergies
                </v-chip>
                <v-chip color="tertiary" variant="tonal" size="small">
                  <v-icon start size="16">mdi-star</v-icon>
                  Qualité & Origine
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref } from 'vue'

useHead({
  title: 'IOFD - Guide des labels alimentaires'
})

const supabase = useSupabase()
const labels = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadLabels()
})

async function loadLabels() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error loading labels:', error)
      return
    }

    labels.value = data || []
  } catch (error) {
    console.error('Error loading labels:', error)
  } finally {
    loading.value = false
  }
}

// Sort labels by category
const sortedLabels = computed(() => {
  const categoryOrder = ['Religieux', 'Environnement', 'Régime', 'Santé', 'Qualité', 'Origine', 'Avertissement']

  return [...labels.value].sort((a, b) => {
    const catA = getLabelCategory(a.name)
    const catB = getLabelCategory(b.name)

    const indexA = categoryOrder.indexOf(catA)
    const indexB = categoryOrder.indexOf(catB)

    if (indexA !== indexB) {
      return indexA - indexB
    }

    return a.name.localeCompare(b.name)
  })
})

const getLabelIcon = (name: string): string => {
  const icons: Record<string, string> = {
    'Bio': 'mdi-leaf',
    'Sans OGM': 'mdi-dna',
    'Commerce équitable': 'mdi-earth',
    'Vegan': 'mdi-sprout',
    'Halal': 'mdi-food-halal',
    'Casher': 'mdi-food-kosher',
    'Sans lactose': 'mdi-cow-off',
    'Sans gluten': 'mdi-barley-off',
    'Label Rouge': 'mdi-medal',
    'AOP / AOC': 'mdi-map-marker-check',
    'Médecine prophétique': 'mdi-book-open-variant',
    'Ultra sucré': 'mdi-candy'
  }
  return icons[name] || 'mdi-certificate'
}

const getLabelColor = (name: string): string => {
  const colors: Record<string, string> = {
    'Bio': 'success',
    'Sans OGM': 'success',
    'Commerce équitable': 'tertiary',
    'Vegan': 'success',
    'Halal': 'secondary',
    'Casher': 'secondary',
    'Sans lactose': 'warning',
    'Sans gluten': 'warning',
    'Label Rouge': 'error',
    'AOP / AOC': 'tertiary',
    'Médecine prophétique': 'secondary',
    'Ultra sucré': 'warning'
  }
  return colors[name] || 'primary'
}

const getLabelCategory = (name: string): string => {
  const categories: Record<string, string> = {
    'Bio': 'Environnement',
    'Sans OGM': 'Environnement',
    'Commerce équitable': 'Qualité',
    'Vegan': 'Régime',
    'Halal': 'Religieux',
    'Casher': 'Religieux',
    'Sans lactose': 'Santé',
    'Sans gluten': 'Santé',
    'Label Rouge': 'Qualité',
    'AOP / AOC': 'Origine',
    'Médecine prophétique': 'Religieux',
    'Ultra sucré': 'Avertissement'
  }
  return categories[name] || ''
}

const getCategoryColorByName = (category: string): string => {
  const colors: Record<string, string> = {
    'Environnement': 'success',
    'Régime': 'info',
    'Religieux': 'secondary',
    'Santé': 'warning',
    'Qualité': 'tertiary',
    'Origine': 'tertiary',
    'Avertissement': 'error'
  }
  return colors[category] || 'primary'
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-secondary), 0.05) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.hero-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.label-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.label-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15) !important;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.75rem;
  }
}
</style>
