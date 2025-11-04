<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/profile')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Mes contributions</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container v-if="!loading && !user" class="text-center py-8 py-md-16" style="max-width: 900px;">
      <v-avatar size="80" size-md="100" color="error" class="mb-4 mb-md-6">
        <v-icon size="40" size-md="50" color="white">mdi-account-off</v-icon>
      </v-avatar>
      <h2 class="text-h6 text-md-h5 mb-3 mb-md-4">Non connecté</h2>
      <p class="text-body-2 text-md-subtitle-1 text-medium-emphasis mb-4 mb-md-6 px-4">
        Vous devez être connecté pour voir vos contributions
      </p>
      <v-btn color="primary" to="/auth/login" prepend-icon="mdi-login" size="large" block class="mx-auto"
        style="max-width: 300px;">
        Se connecter
      </v-btn>
    </v-container>

    <v-container v-else-if="user" class="py-4 py-md-8" style="max-width: 900px;">
      <div class="text-center mb-4 mb-md-8">
        <v-avatar size="80" size-md="100" color="primary" class="mb-4">
          <v-icon size="40" size-md="50" color="white">mdi-history</v-icon>
        </v-avatar>
        <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">Mes contributions</h1>
        <p class="text-body-2 text-md-subtitle-1 text-medium-emphasis">
          Historique de toutes vos contributions à la base de données
        </p>
      </div>

      <v-card elevation="2" rounded="xl" class="mb-4 mb-md-6">
        <v-card-text class="pa-4 pa-md-6">
          <div class="d-flex flex-column flex-md-row align-center justify-space-between mb-4">
            <div class="text-center text-md-left mb-2 mb-md-0">
              <div class="text-h6 text-md-h5 font-weight-bold">{{ contributions.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Contribution{{ contributions.length > 1 ? 's' : '' }}</div>
            </div>
            <v-chip v-if="contributions.length > 0" :color="getTotalContributionsColor()" size="large"
              prepend-icon="mdi-trophy">
              Niveau {{ userLevel }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <div v-else-if="contributions.length === 0" class="text-center py-8">
        <v-avatar size="100" color="grey-lighten-4" class="mb-4">
          <v-icon size="50" color="grey">mdi-inbox</v-icon>
        </v-avatar>
        <h3 class="text-h6 mb-2">Aucune contribution</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Vous n'avez pas encore contribué à la base de données.
        </p>
        <v-btn color="primary" prepend-icon="mdi-plus-circle" to="/products/add" size="large">
          Ajouter un produit
        </v-btn>
      </div>

      <div v-else>
        <v-timeline density="compact" align="start" class="mb-4">
          <v-timeline-item v-for="(contribution, index) in contributions" :key="contribution.id" size="small"
            :dot-color="getChangeTypeColor(contribution.change_type)" class="mb-4">
            <template #icon>
              <v-icon :color="getChangeTypeColor(contribution.change_type)">
                {{ getChangeTypeIcon(contribution.change_type) }}
              </v-icon>
            </template>

            <v-card elevation="2" rounded="xl" class="contribution-card">
              <v-card-text class="pa-4 pa-md-6">
                <div class="d-flex flex-column flex-md-row align-start justify-space-between mb-3">
                  <div class="flex-grow-1 mb-2 mb-md-0">
                    <div class="d-flex align-center mb-2">
                      <v-chip :color="getChangeTypeColor(contribution.change_type)" size="small" variant="flat"
                        prepend-icon="mdi-information">
                        {{ getChangeTypeLabel(contribution.change_type) }}
                      </v-chip>
                      <span class="text-caption text-medium-emphasis ml-3">
                        {{ formatDate(contribution.created_at) }}
                      </span>
                    </div>
                    <h3 v-if="contribution.product" class="text-h6 text-md-h6 font-weight-bold mb-2">
                      {{ contribution.product.name }}
                    </h3>
                    <p v-else class="text-body-2 text-medium-emphasis mb-2">
                      Produit supprimé ou non disponible
                    </p>
                    <div v-if="contribution.product" class="d-flex flex-wrap ga-2 mb-2">
                      <v-chip v-if="contribution.product.brand" size="x-small" variant="tonal">
                        {{ contribution.product.brand }}
                      </v-chip>
                      <v-chip v-if="contribution.product.barcode" size="x-small" variant="tonal">
                        <v-icon start size="x-small">mdi-barcode</v-icon>
                        {{ contribution.product.barcode }}
                      </v-chip>
                    </div>
                  </div>
                  <v-btn v-if="contribution.product" :to="`/products/${contribution.product_id}`" icon="mdi-arrow-right"
                    variant="text" color="primary" class="ml-auto ml-md-2">
                  </v-btn>
                </div>

                <v-expand-transition>
                  <div v-if="expandedContributions.includes(contribution.id)" class="mt-3">
                    <v-divider class="mb-3" />
                    <div class="text-body-2">
                      <strong>Détails de la modification :</strong>
                      <pre class="mt-2 pa-3 bg-surface-variant rounded-lg"
                        style="font-size: 0.75rem; overflow-x: auto;">{{
                          JSON.stringify(contribution.change_data, null, 2)
                        }}</pre>
                    </div>
                  </div>
                </v-expand-transition>

                <v-btn v-if="contribution.change_data" variant="text" size="small" color="primary"
                  @click="toggleExpand(contribution.id)" class="mt-2">
                  <v-icon start size="small">
                    {{ expandedContributions.includes(contribution.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                  </v-icon>
                  {{ expandedContributions.includes(contribution.id) ? 'Masquer' : 'Afficher' }} les détails
                </v-btn>
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { computed, onMounted, ref } from 'vue'

const { user, fetchUser, loading: authLoading } = useSupabaseAuth()
const supabase = useSupabase()

const loading = ref(true)
const contributions = ref<any[]>([])
const expandedContributions = ref<string[]>([])

const userLevel = computed(() => {
  const count = contributions.value.length
  if (count >= 50) return 5
  if (count >= 30) return 4
  if (count >= 15) return 3
  if (count >= 5) return 2
  return 1
})

const formatDate = (date: string) => {
  if (!date) return 'Date inconnue'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Date invalide'

  const formatter = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return formatter.format(d)
}

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
  if (level >= 4) return 'success'
  if (level >= 3) return 'primary'
  if (level >= 2) return 'info'
  return 'grey'
}

const toggleExpand = (id: string) => {
  const index = expandedContributions.value.indexOf(id)
  if (index > -1) {
    expandedContributions.value.splice(index, 1)
  } else {
    expandedContributions.value.push(id)
  }
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

onMounted(async () => {
  await fetchUser()
  await fetchContributions()
})
</script>

<style scoped>
.contribution-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.contribution-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
