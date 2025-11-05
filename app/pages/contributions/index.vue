<template>
  <v-app-bar elevation="0" :class="['px-2 px-sm-4']" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="$router.push('/profile')" />

    <v-app-bar-title :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Mes contributions</span>
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container v-if="!loading && !user" class="text-center py-8 py-md-16" style="max-width: 900px;">
      <v-avatar :size="$vuetify.display.xs ? '64' : '100'" color="error" class="mb-4 mb-md-6">
        <v-icon :size="$vuetify.display.xs ? '32' : '50'" color="white">mdi-account-off</v-icon>
      </v-avatar>
      <h2 :class="['text-h6 text-md-h5 mb-3 mb-md-4']">Non connecté</h2>
      <p :class="['text-body-2 text-md-subtitle-1 text-medium-emphasis mb-4 mb-md-6 px-2 px-md-4']">
        Vous devez être connecté pour voir vos contributions
      </p>
      <v-btn color="primary" to="/auth/login" prepend-icon="mdi-login" :size="$vuetify.display.xs ? 'default' : 'large'"
        block class="mx-auto" style="max-width: 300px;">
        Se connecter
      </v-btn>
    </v-container>

    <v-container v-else-if="user" class="py-3 py-sm-6 px-2 px-sm-4" style="max-width: 900px;">
      <div class="text-center mb-4 mb-sm-6">
        <v-avatar :size="$vuetify.display.xs ? '64' : '100'" color="primary" class="mb-3 mb-sm-4">
          <v-icon :size="$vuetify.display.xs ? '32' : '50'" color="white">mdi-history</v-icon>
        </v-avatar>
        <h1 :class="['text-h5 text-sm-h4 font-weight-bold mb-2']">Mes contributions</h1>
        <p :class="['text-body-2 text-sm-subtitle-1 text-medium-emphasis']">
          Historique de toutes vos contributions à la base de données
        </p>
      </div>

      <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
        <v-card-text :class="['pa-3 pa-sm-6']">
          <div class="d-flex flex-column flex-sm-row align-center justify-space-between ga-3">
            <div class="text-center text-sm-left">
              <div :class="['text-h6 text-sm-h5 font-weight-bold']">{{ contributions.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Contribution{{ contributions.length > 1 ? 's' : '' }}</div>
            </div>
            <div class="text-center text-sm-left">
              <div :class="['text-h6 text-sm-h5 font-weight-bold']">{{ reviews.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Avis{{ reviews.length > 1 ? '' : '' }}</div>
            </div>
            <v-chip v-if="contributions.length > 0 || reviews.length > 0" :color="getTotalContributionsColor()"
              :size="$vuetify.display.xs ? 'default' : 'large'" prepend-icon="mdi-trophy">
              Niveau {{ userLevel }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <v-tabs v-model="activeTab" :density="$vuetify.display.xs ? 'compact' : 'default'" class="mb-3 mb-sm-4">
        <v-tab value="contributions" :prepend-icon="$vuetify.display.xs ? undefined : 'mdi-pencil'">
          <span :class="['d-none d-sm-inline']">Contributions</span>
          <span class="d-inline d-sm-none">Contrib.</span>
        </v-tab>
        <v-tab value="reviews" :prepend-icon="$vuetify.display.xs ? undefined : 'mdi-star'">
          <span>Avis</span>
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="contributions">
          <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" :size="$vuetify.display.xs ? '48' : '64'" />
          </div>

          <div v-else-if="contributions.length === 0" class="text-center py-8">
            <v-avatar :size="$vuetify.display.xs ? '64' : '100'" color="grey-lighten-4" class="mb-3 mb-sm-4">
              <v-icon :size="$vuetify.display.xs ? '32' : '50'" color="grey">mdi-inbox</v-icon>
            </v-avatar>
            <h3 :class="['text-h6 mb-2']">Aucune contribution</h3>
            <p :class="['text-body-2 text-medium-emphasis mb-4']">
              Vous n'avez pas encore contribué à la base de données.
            </p>
            <v-btn color="primary" prepend-icon="mdi-plus-circle" to="/products/add"
              :size="$vuetify.display.xs ? 'default' : 'large'">
              Ajouter un produit
            </v-btn>
          </div>

          <div v-else>
            <v-timeline density="compact" align="start" class="mb-4">
              <v-timeline-item v-for="(contribution, index) in contributions" :key="contribution.id"
                :size="$vuetify.display.xs ? 'x-small' : 'small'"
                :dot-color="getChangeTypeColor(contribution.change_type)" class="mb-3 mb-sm-4">
                <template #icon>
                  <v-icon :color="getChangeTypeColor(contribution.change_type)"
                    :size="$vuetify.display.xs ? '16' : '20'">
                    {{ getChangeTypeIcon(contribution.change_type) }}
                  </v-icon>
                </template>

                <v-card elevation="2" rounded="xl" class="contribution-card">
                  <v-card-text :class="['pa-3 pa-sm-6']">
                    <div class="d-flex flex-column flex-sm-row align-start justify-space-between ga-2 mb-2 mb-sm-3">
                      <div class="flex-grow-1">
                        <div class="d-flex flex-wrap align-center ga-2 mb-2">
                          <v-chip :color="getChangeTypeColor(contribution.change_type)"
                            :size="$vuetify.display.xs ? 'x-small' : 'small'" variant="flat"
                            prepend-icon="mdi-information">
                            {{ getChangeTypeLabel(contribution.change_type) }}
                          </v-chip>
                          <span :class="['text-caption text-medium-emphasis']">
                            {{ formatHijriDate(contribution.created_at) }}
                          </span>
                        </div>
                        <h3 v-if="contribution.product" :class="['text-h6 text-sm-h6 font-weight-bold mb-2']">
                          {{ contribution.product.name }}
                        </h3>
                        <p v-else :class="['text-body-2 text-medium-emphasis mb-2']">
                          Produit supprimé ou non disponible
                        </p>
                        <div v-if="contribution.product" class="d-flex flex-wrap ga-1 ga-sm-2 mb-2">
                          <v-chip v-if="contribution.product.brand" :size="$vuetify.display.xs ? 'x-small' : 'small'"
                            variant="tonal">
                            {{ contribution.product.brand }}
                          </v-chip>
                          <v-chip v-if="contribution.product.barcode" :size="$vuetify.display.xs ? 'x-small' : 'small'"
                            variant="tonal">
                            <v-icon start :size="$vuetify.display.xs ? '10' : '12'">mdi-barcode</v-icon>
                            {{ contribution.product.barcode }}
                          </v-chip>
                        </div>
                      </div>
                      <v-btn v-if="contribution.product" :to="`/products/${contribution.product_id}`"
                        icon="mdi-arrow-right" variant="text" color="primary"
                        :size="$vuetify.display.xs ? 'small' : 'default'" class="ml-auto ml-sm-2 align-self-start">
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </div>
        </v-window-item>

        <v-window-item value="reviews">
          <div v-if="loadingReviews" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" :size="$vuetify.display.xs ? '48' : '64'" />
          </div>

          <div v-else-if="reviews.length === 0" class="text-center py-8">
            <v-avatar :size="$vuetify.display.xs ? '64' : '100'" color="grey-lighten-4" class="mb-3 mb-sm-4">
              <v-icon :size="$vuetify.display.xs ? '32' : '50'" color="grey">mdi-star-outline</v-icon>
            </v-avatar>
            <h3 :class="['text-h6 mb-2']">Aucun avis</h3>
            <p :class="['text-body-2 text-medium-emphasis mb-4']">
              Vous n'avez pas encore laissé d'avis sur un produit.
            </p>
          </div>

          <div v-else>
            <v-card v-for="review in reviews" :key="review.id" elevation="2" rounded="xl"
              class="mb-3 mb-sm-4 review-card">
              <v-card-text :class="['pa-3 pa-sm-6']">
                <div class="d-flex flex-column flex-sm-row align-start justify-space-between ga-2 mb-2 mb-sm-3">
                  <div class="flex-grow-1">
                    <div class="d-flex flex-wrap align-center ga-2 mb-2">
                      <v-rating :model-value="review.rating" readonly density="compact" color="amber" half-increments
                        :size="$vuetify.display.xs ? 'small' : 'default'" />
                      <v-chip :color="getHalalColor(review.halal_vote)"
                        :size="$vuetify.display.xs ? 'x-small' : 'small'" variant="tonal">
                        {{ getHalalLabel(review.halal_vote) }}
                      </v-chip>
                      <span :class="['text-caption text-medium-emphasis']">
                        {{ formatHijriDate(review.created_at) }}
                      </span>
                    </div>
                    <h3 v-if="review.product" :class="['text-h6 text-sm-h6 font-weight-bold mb-2']">
                      {{ review.product.name }}
                    </h3>
                    <p v-else :class="['text-body-2 text-medium-emphasis mb-2']">
                      Produit supprimé ou non disponible
                    </p>
                    <p v-if="review.comment" :class="['text-body-2 mb-2']">{{ review.comment }}</p>
                    <div v-if="review.product" class="d-flex flex-wrap ga-1 ga-sm-2">
                      <v-chip v-if="review.product.brand" :size="$vuetify.display.xs ? 'x-small' : 'small'"
                        variant="tonal">
                        {{ review.product.brand }}
                      </v-chip>
                    </div>
                  </div>
                  <v-btn v-if="review.product" :to="`/products/${review.product_id}`" icon="mdi-arrow-right"
                    variant="text" color="primary" :size="$vuetify.display.xs ? 'small' : 'default'"
                    class="ml-auto ml-sm-2 align-self-start">
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-window-item>
      </v-window>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { computed, onMounted, ref } from 'vue'
import { formatHijriDate, getHalalColor, getHalalLabel } from '@/utils/function'

useHead({
  title: 'IOFD - Contributions'
})

const { user, fetchUser, loading: authLoading } = useSupabaseAuth()
const supabase = useSupabase()

const loading = ref(true)
const loadingReviews = ref(true)
const contributions = ref<any[]>([])
const reviews = ref<any[]>([])
const activeTab = ref('contributions')

const userLevel = computed(() => {
  const count = contributions.value.length + reviews.value.length
  if (count >= 50) return 5
  if (count >= 30) return 4
  if (count >= 15) return 3
  if (count >= 5) return 2
  return 1
})

const getChangeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    create: 'Création',
    update: 'Modification',
    delete: 'Suppression'
  }
  return labels[type] || type
}

const getChangeTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    create: 'success',
    update: 'primary',
    delete: 'error'
  }
  return colors[type] || 'grey'
}

const getChangeTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    create: 'mdi-plus-circle',
    update: 'mdi-pencil',
    delete: 'mdi-delete'
  }
  return icons[type] || 'mdi-information'
}

const getTotalContributionsColor = () => {
  const level = userLevel.value
  if (level >= 4) return 'secondary'
  if (level >= 3) return 'primary'
  if (level >= 2) return 'info'
  return 'success'
}

const fetchContributions = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('product_contributors')
      .select(`
        *,
        product:products(id, name, brand, barcode, image_url)
      `)
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    contributions.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des contributions:', error)
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  if (!user.value) {
    loadingReviews.value = false
    return
  }

  loadingReviews.value = true
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser?.email) {
      loadingReviews.value = false
      return
    }

    const { data, error } = await supabase
      .from('community_reviews')
      .select(`
        *,
        product:products(id, name, brand, image_url)
      `)
      .or(`user_email.eq.${currentUser.email},user_id.eq.${user.value.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    reviews.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des avis:', error)
  } finally {
    loadingReviews.value = false
  }
}

onMounted(async () => {
  await fetchUser()
  await Promise.all([
    fetchContributions(),
    fetchReviews()
  ])
})
</script>

<style scoped>
.contribution-card,
.review-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.contribution-card:hover,
.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .v-timeline {
    padding-left: 0 !important;
  }

  .v-timeline-item {
    padding-left: 0 !important;
  }
}
</style>
