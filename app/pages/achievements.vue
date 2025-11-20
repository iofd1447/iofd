<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />

    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Jalons communautaires</span>
    </v-app-bar-title>

    <v-spacer />
  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-8" style="max-width: 1000px;">
      <div class="text-center mb-8">
        <v-avatar size="100" color="primary" class="mb-4">
          <v-icon size="50" color="white">mdi-trophy</v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Jalons communautaires</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Suivez notre progression et partagez nos succès</p>
      </div>

      <v-card elevation="4" rounded="xl" class="mb-6">
        <v-card-text class="pa-6 pa-md-8 text-center">
          <v-chip color="primary" variant="flat" size="large" class="mb-6">
            <v-icon start>mdi-package-variant</v-icon>
            Total de produits
          </v-chip>

          <div class="mb-6">
            <h2 class="text-h2 text-md-h1 font-weight-black mb-2" style="color: rgb(var(--v-theme-primary));">
              {{ loading ? '...' : productCount.toLocaleString() }}
            </h2>
            <p class="text-h6 text-medium-emphasis">
              Produits enregistrés dans IOFD
            </p>
            <p v-if="!milestoneUnlocked" class="text-body-1 text-medium-emphasis mt-4">
              Atteignez au moins 10 produits pour débloquer la première carte partageable.
            </p>
          </div>

          <v-skeleton-loader v-if="loading" type="image, text, actions" class="my-6" />

          <div v-else>
            <template v-if="milestoneUnlocked">
              <v-card color="success" variant="tonal" class="mb-6" rounded="xl">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-center ga-3 mb-2">
                    <v-icon color="success" size="32">mdi-check-circle</v-icon>
                    <span class="text-h5 font-weight-bold">Palier atteint !</span>
                  </div>
                  <p class="text-h6 font-weight-bold mb-1">
                    {{ currentMilestone?.toLocaleString() }} produits
                  </p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Merci à chaque contributeur ! Cette carte est prête à être partagée.
                  </p>
                </v-card-text>
              </v-card>

              <v-progress-linear v-if="nextMilestone" :model-value="progressToNext" height="12" color="primary" rounded
                class="mb-4" />
              <p v-if="nextMilestone" class="text-body-2 text-medium-emphasis mb-6">
                Plus que <strong>{{ (nextMilestone - productCount).toLocaleString() }}</strong> produits avant le palier
                de
                <strong>{{ nextMilestone.toLocaleString() }}</strong>.
              </p>

              <v-card class="share-card mb-6" elevation="8" rounded="xl">
                <v-card-text class="pa-6 pa-md-8 text-center">
                  <v-chip color="primary" variant="flat" size="small" class="mb-4">
                    IOFD Community
                  </v-chip>
                  <h2 class="text-h3 text-md-h2 font-weight-black mb-3" style="color: rgb(var(--v-theme-primary));">
                    {{ currentMilestone?.toLocaleString() }} produits halal vérifiés
                  </h2>
                  <p class="text-h6 text-medium-emphasis mb-6">
                    Une étape de plus pour faciliter les choix alimentaires de l'Ummah.
                  </p>
                  <v-avatar size="100" class="mb-4" color="primary">
                    <v-icon size="50" color="white">mdi-package-variant-closed</v-icon>
                  </v-avatar>
                  <p class="text-caption text-uppercase font-weight-bold" style="letter-spacing: 3px; opacity: 0.7;">
                    Islamic Open Food Database
                  </p>
                </v-card-text>
              </v-card>

              <div class="d-flex flex-column flex-sm-row align-center justify-center ga-3">
                <v-btn color="primary" size="large" prepend-icon="mdi-linkedin" @click="shareOnLinkedIn">
                  Partager sur LinkedIn
                </v-btn>
                <v-btn color="secondary" variant="tonal" size="large" prepend-icon="mdi-content-copy"
                  @click="copyShareMessage">
                  Copier le message
                </v-btn>
              </div>
            </template>
          </div>
        </v-card-text>
      </v-card>

      <v-card elevation="4" rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-4 pa-md-6">
          <v-icon start color="primary">mdi-timeline</v-icon>
          Historique des jalons
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4 pa-md-6">
          <v-timeline side="end" truncate-line="end" density="comfortable">
            <v-timeline-item v-for="milestone in milestones" :key="milestone"
              :dot-color="productCount >= milestone ? 'primary' : 'grey'" :fill-dot="productCount >= milestone"
              size="small">
              <template #opposite>
                <span class="text-body-1 font-weight-bold">{{ milestone.toLocaleString() }}</span>
              </template>
              <v-card :class="['milestone-card', productCount >= milestone ? 'achieved' : '']" elevation="2"
                rounded="lg">
                <v-card-text class="py-3">
                  <div class="d-flex align-center ga-2 mb-1">
                    <v-icon v-if="productCount >= milestone" color="success" size="small">mdi-check-circle</v-icon>
                    <v-icon v-else color="grey" size="small">mdi-clock-outline</v-icon>
                    <p class="mb-0 font-weight-bold">
                      {{ productCount >= milestone ? 'Débloqué' : 'À venir' }}
                    </p>
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Carte partageable {{ productCount >= milestone ? 'disponible' : 'dans ' + (milestone -
                      productCount).toLocaleString() + ' produits' }}
                  </p>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref } from 'vue'

useHead({
  title: 'IOFD - Jalons communautaires',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Suivez les jalons de produits IOFD et partagez les succès communautaires.' }
  ]
})

const milestones = [10, 100, 1000, 10000, 100000, 1000000]
const supabase = useSupabase()
const loading = ref(true)
const productCount = ref(0)
const milestoneUnlocked = computed(() => {
  const firstMilestone = milestones[0] ?? Number.POSITIVE_INFINITY
  return productCount.value >= firstMilestone
})

const currentMilestone = computed(() => {
  return milestones
    .filter(m => productCount.value >= m)
    .sort((a, b) => b - a)[0]
})

const nextMilestone = computed(() => {
  return milestones.find(m => m > (currentMilestone.value || 0))
})

const progressToNext = computed(() => {
  if (!nextMilestone.value || !currentMilestone.value) return 100
  const range = nextMilestone.value - currentMilestone.value
  const progress = productCount.value - currentMilestone.value
  return Math.min(100, Math.max(0, (progress / range) * 100))
})

const fetchProductCount = async () => {
  loading.value = true
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    productCount.value = count || 0
  } catch (error) {
    console.error('Erreur lors du chargement des jalons', error)
  } finally {
    loading.value = false
  }
}

const shareOnLinkedIn = () => {
  if (typeof window === 'undefined' || !currentMilestone.value) return
  const summary = `Nous venons d'atteindre ${currentMilestone.value.toLocaleString()} produits vérifiés sur IOFD 🚀`
  const url = encodeURIComponent(window.location.origin + '/achievements')
  const encodedSummary = encodeURIComponent(summary)
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${encodedSummary}`, '_blank')
}

const copyShareMessage = async () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.clipboard || !currentMilestone.value) return
  const message = `IOFD vient d'atteindre ${currentMilestone.value.toLocaleString()} produits enregistrés 🎯 Rejoignez-nous : ${window.location.origin}/achievements`
  try {
    await navigator.clipboard.writeText(message)
    alert('Message copié dans le presse-papiers ✅')
  } catch (error) {
    console.error('Impossible de copier le message', error)
  }
}

onMounted(fetchProductCount)
</script>

<style scoped>
.share-card {
  background: linear-gradient(135deg,
      rgb(var(--v-theme-surface)) 0%,
      rgba(var(--v-theme-primary), 0.05) 100%);
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.milestone-card {
  transition: all 0.3s ease;
}

.milestone-card.achieved {
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.08);
}

.milestone-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
