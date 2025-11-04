<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/contributions')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Détail contribution</span>
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
        Vous devez être connecté pour voir cette contribution
      </p>
      <v-btn color="primary" to="/auth/login" prepend-icon="mdi-login" size="large" block class="mx-auto"
        style="max-width: 300px;">
        Se connecter
      </v-btn>
    </v-container>

    <v-container v-else-if="loading" class="text-center py-8" style="max-width: 900px;">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-container>

    <v-container v-else-if="!contribution" class="text-center py-8 py-md-16" style="max-width: 900px;">
      <v-avatar size="80" size-md="100" color="error" class="mb-4 mb-md-6">
        <v-icon size="40" size-md="50" color="white">mdi-alert-circle</v-icon>
      </v-avatar>
      <h2 class="text-h6 text-md-h5 mb-3 mb-md-4">Contribution introuvable</h2>
      <p class="text-body-2 text-md-subtitle-1 text-medium-emphasis mb-4 mb-md-6 px-4">
        Cette contribution n'existe pas ou vous n'avez pas la permission de la voir.
      </p>
      <v-btn color="primary" to="/contributions" prepend-icon="mdi-arrow-left" size="large">
        Retour aux contributions
      </v-btn>
    </v-container>

    <v-container v-else-if="contribution" class="py-4 py-md-8" style="max-width: 900px;">
      <v-card elevation="4" rounded="xl" class="mb-4 mb-md-6">
        <v-card-text class="pa-4 pa-md-8">
          <div class="text-center mb-4 mb-md-6">
            <v-avatar size="80" size-md="100" :color="getChangeTypeColor(contribution.change_type)" class="mb-4">
              <v-icon size="40" size-md="50" color="white">
                {{ getChangeTypeIcon(contribution.change_type) }}
              </v-icon>
            </v-avatar>
            <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">
              {{ getChangeTypeLabel(contribution.change_type) }}
            </h1>
            <v-chip :color="getChangeTypeColor(contribution.change_type)" size="large" variant="flat" class="mb-2">
              {{ formatDate(contribution.created_at) }}
            </v-chip>
          </div>

          <v-divider class="mb-4 mb-md-6" />

          <div v-if="contribution.product" class="mb-4 mb-md-6">
            <h2 class="text-h6 text-md-h5 font-weight-bold mb-3 mb-md-4">
              <v-icon start color="primary">mdi-package-variant</v-icon>
              Produit concerné
            </h2>
            <v-card variant="tonal" color="primary" rounded="lg" class="mb-3">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-3">
                  <v-avatar v-if="contribution.product.image_url" size="60" class="mr-3">
                    <v-img :src="contribution.product.image_url" cover />
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-bold mb-1">{{ contribution.product.name }}</h3>
                    <div v-if="contribution.product.brand" class="text-body-2 text-medium-emphasis">
                      {{ contribution.product.brand }}
                    </div>
                    <div v-if="contribution.product.barcode" class="text-caption text-medium-emphasis">
                      <v-icon size="x-small" start>mdi-barcode</v-icon>
                      {{ contribution.product.barcode }}
                    </div>
                  </div>
                </div>
                <v-btn color="primary" :to="`/products/${contribution.product_id}`" block
                  prepend-icon="mdi-arrow-right">
                  Voir le produit
                </v-btn>
              </v-card-text>
            </v-card>
          </div>

          <div v-else class="mb-4 mb-md-6">
            <v-alert type="warning" variant="tonal" rounded="lg">
              <v-icon start>mdi-alert</v-icon>
              Le produit associé à cette contribution n'est plus disponible ou a été supprimé.
            </v-alert>
          </div>

          <div class="mb-4 mb-md-6">
            <h2 class="text-h6 text-md-h5 font-weight-bold mb-3 mb-md-4">
              <v-icon start color="primary">mdi-information</v-icon>
              Détails de la modification
            </h2>
            <v-card variant="outlined" rounded="lg">
              <v-card-text class="pa-4 pa-md-6">
                <div v-if="contribution.change_data && Object.keys(contribution.change_data).length > 0">
                  <v-list density="comfortable" bg-color="transparent">
                    <v-list-item v-for="(value, key) in contribution.change_data" :key="key" class="px-0">
                      <template #prepend>
                        <v-icon color="primary" size="small">mdi-circle-small</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">
                        <strong>{{ formatKey(String(key)) }}:</strong>
                        <span class="ml-2">{{ formatValue(value) }}</span>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
                <div v-else class="text-body-2 text-medium-emphasis">
                  Aucun détail disponible pour cette contribution.
                </div>
              </v-card-text>
            </v-card>
          </div>

          <div v-if="contribution.change_data && Object.keys(contribution.change_data).length > 0">
            <h2 class="text-h6 text-md-h5 font-weight-bold mb-3 mb-md-4">
              <v-icon start color="primary">mdi-code-json</v-icon>
              Données brutes (JSON)
            </h2>
            <v-card variant="outlined" rounded="lg">
              <v-card-text class="pa-4 pa-md-6">
                <pre class="json-display">{{ JSON.stringify(contribution.change_data, null, 2) }}</pre>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex flex-column flex-md-row ga-3">
        <v-btn color="primary" variant="outlined" to="/contributions" prepend-icon="mdi-arrow-left" block>
          Retour à l'historique
        </v-btn>
        <v-btn v-if="contribution.product" color="primary" variant="flat" :to="`/products/${contribution.product_id}`"
          prepend-icon="mdi-package-variant" block>
          Voir le produit
        </v-btn>
      </div>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { user, fetchUser } = useSupabaseAuth()
const supabase = useSupabase()

const loading = ref(true)
const contribution = ref<any>(null)

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

const formatKey = (key: string) => {
  const labels: Record<string, string> = {
    name: 'Nom',
    brand: 'Marque',
    barcode: 'Code-barres',
    category: 'Catégorie',
    halal_status: 'Statut Halal',
    ingredients: 'Ingrédients',
    additives: 'Additifs',
    nutrition_facts: 'Valeurs nutritionnelles',
    image_url: 'Image'
  }
  return labels[key] || key
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'Non défini'
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

const fetchContribution = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const contributionId = route.params.id as string

    const { data, error } = await supabase
      .from('product_contributors')
      .select(`
        *,
        product:products(id, name, brand, barcode, image_url)
      `)
      .eq('id', contributionId)
      .eq('user_id', user.value.id)
      .single()

    if (error) throw error

    contribution.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de la contribution:', error)
    contribution.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchUser()
  await fetchContribution()
})
</script>

<style scoped>
.json-display {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
  background-color: rgb(var(--v-theme-surface-variant));
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 0;
}

@media (max-width: 960px) {
  .json-display {
    font-size: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
