<template>
  <v-app-bar elevation="0" class="px-2 px-sm-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />

    <v-app-bar-title class="text-subtitle-1 text-sm-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Additifs alimentaires</span>
      <span class="text-medium-emphasis ml-1 d-sm-none">• Additifs</span>
    </v-app-bar-title>

  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-3 py-sm-6 px-3 px-sm-4">
      <v-row>
        <v-col cols="12">
          <v-card elevation="4" rounded="xl" class="hero-card mb-4 mb-sm-6">
            <v-card-text class="pa-4 pa-sm-8">
              <div class="d-flex align-center mb-4 flex-column flex-sm-row">
                <v-avatar color="warning" size="48" class="mr-0 mr-sm-4 mb-3 mb-sm-0 avatar-hero">
                  <v-icon size="28" class="icon-hero" color="white">mdi-flask</v-icon>
                </v-avatar>
                <div class="text-center text-sm-left">
                  <h1 class="text-h5 text-sm-h4 font-weight-bold mb-2">
                    Base de données des additifs
                  </h1>
                  <p class="text-body-2 text-sm-body-1 text-medium-emphasis mb-0">
                    {{ filteredAdditives.length }} additifs alimentaires référencés avec leur statut halal
                  </p>
                </div>
              </div>

              <v-row dense>
                <v-col v-for="stat in statsItems" cols="4">
                  <v-card variant="tonal" :color="stat.color">
                    <v-card-text class="text-center py-2 py-sm-3">
                      <div class="text-h6 text-sm-h5 font-weight-bold">{{ statsCount[stat.key] }}</div>
                      <div class="text-caption text-xs-caption">{{ stat.name }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-3 pa-sm-4">
              <v-text-field v-model="searchQuery" placeholder="Rechercher par code (E471) ou nom d'additif..."
                prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details density="comfortable"
                class="mb-3 mb-sm-4">
                <template #append-inner>
                  <v-btn v-if="searchQuery" icon="mdi-close" variant="text" size="small" @click="clearSearch" />
                </template>
              </v-text-field>

              <div class="d-flex flex-column flex-sm-row flex-wrap gap-2 align-start align-sm-center mb-3 mb-sm-4">
                <span class="text-subtitle-2 text-medium-emphasis mr-0 mr-sm-2 mb-1 mb-sm-0">Statut halal:</span>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="filter in statusFilters" :key="filter.value"
                    :color="selectedStatus === filter.value ? filter.color : 'default'"
                    :variant="selectedStatus === filter.value ? 'flat' : 'tonal'" size="small" class="chip-filter"
                    @click="toggleStatusFilter(filter.value)">
                    <v-icon start size="x-small">{{ filter.icon }}</v-icon>
                    {{ filter.label }}
                  </v-chip>
                </div>
              </div>

              <div class="d-flex flex-column flex-sm-row flex-wrap gap-2 align-start align-sm-center mb-3 mb-sm-4">
                <span class="text-subtitle-2 text-medium-emphasis mr-0 mr-sm-2 mb-1 mb-sm-0">Fonction:</span>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="func in functionFilters" :key="func.value"
                    :variant="selectedFunction === func.value ? 'flat' : 'tonal'"
                    :color="selectedFunction === func.value ? 'primary' : 'default'" size="small" class="chip-filter"
                    @click="toggleFunctionFilter(func.value)">
                    <v-icon start size="x-small">{{ func.icon }}</v-icon>
                    {{ func.label }}
                  </v-chip>
                </div>
              </div>

              <div class="d-flex flex-column flex-sm-row flex-wrap gap-2 align-start align-sm-center">
                <span class="text-subtitle-2 text-medium-emphasis mr-0 mr-sm-2 mb-1 mb-sm-0">Origine:</span>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="origin in originFilters" :key="origin.value"
                    :variant="selectedOrigin === origin.value ? 'flat' : 'tonal'"
                    :color="selectedOrigin === origin.value ? 'secondary' : 'default'" size="small" class="chip-filter"
                    @click="toggleOriginFilter(origin.value)">
                    <v-icon start size="x-small">{{ origin.icon }}</v-icon>
                    {{ origin.label }}
                  </v-chip>
                </div>
              </div>

              <v-divider class="my-3 my-sm-4" />

              <div v-if="hasActiveFilters" class="d-flex align-center gap-2 flex-wrap">
                <span class="text-caption text-medium-emphasis">Filtres actifs:</span>
                <v-btn size="small" variant="text" color="error" prepend-icon="mdi-close-circle"
                  @click="clearAllFilters">
                  Tout effacer
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>


      <v-row>
        <v-col cols="12">
          <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3 mb-4">
            <div class="text-h6 text-sm-h6 font-weight-bold">
              {{ filteredAdditives.length }} additif{{ filteredAdditives.length > 1 ? 's' : '' }}
            </div>
            <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto">
              <v-select v-model="sortBy" :items="sortOptions" variant="outlined" density="compact" hide-details
                class="sort-select" />
              <v-select v-model="selectedRegion" :items="[
                { title: 'Europe (E-code)', value: 'EU' },
                { title: 'International (INS)', value: 'INT' },
              ]" label="Format du code" variant="outlined" density="compact" hide-details class="sort-select" />
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="!loading">
        <v-col v-for="additive in paginatedAdditives" :key="additive.id" cols="12" sm="6" md="4">
          <v-card class="additive-card h-100" elevation="2" rounded="xl" hover @click="goToAdditive(additive.code)">
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center mb-3">
                <v-chip :color="getStatusColor(additive.halal_status)" variant="flat" class="font-weight-bold">
                  {{ getRegionalCode(additive.code) }}
                </v-chip>
                <v-chip :color="getStatusColor(additive.halal_status)" size="small" variant="tonal">
                  <v-icon start size="x-small">{{ getStatusIcon(additive.halal_status) }}</v-icon>
                  {{ getStatusLabel(additive.halal_status) }}
                </v-chip>
              </div>

              <h3 class="text-h6 mb-2">{{ additive.name }}</h3>

              <p class="text-body-2 text-medium-emphasis mb-3 description-text">
                {{ additive.description }}
              </p>

              <v-divider class="my-3" />

              <div class="details-grid">
                <div class="detail-item">
                  <v-icon size="small" color="primary" class="mr-1">mdi-function-variant</v-icon>
                  <span class="text-caption">{{ additive.function }}</span>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="secondary" class="mr-1">{{ getOriginIcon(additive.origin_type) }}</v-icon>
                  <span class="text-caption">{{ additive.origin_type }}</span>
                </div>
              </div>

              <v-alert v-if="additive.health_concerns" type="warning" variant="tonal" density="compact" class="mt-3">
                <div class="text-caption">
                  <v-icon size="small" start>mdi-alert</v-icon>
                  {{ additive.health_concerns }}
                </div>
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="i in 12" :key="i" cols="12" sm="6" md="4">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>

      <v-row v-if="!loading && filteredAdditives.length === 0">
        <v-col cols="12">
          <v-card elevation="0" class="text-center py-16" rounded="xl">
            <v-icon size="120" color="grey-lighten-2">mdi-flask-empty</v-icon>
            <h2 class="text-h5 mt-4 mb-2">Aucun additif trouvé</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <v-btn color="primary" variant="flat" @click="clearAllFilters">
              Réinitialiser les filtres
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="filteredAdditives.length > 0">
        <v-col cols="12" class="d-flex justify-center mt-4 mt-sm-6">
          <v-pagination v-model="page" :length="totalPages" :total-visible="$vuetify.display.mobile ? 5 : 7"
            rounded="circle" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

useHead({
  title: 'IOFD - Additifs catalogue'
})

const supabase = useSupabase()
const theme = useTheme()
const router = useRouter()

const isDark = computed(() => theme.global.current.value.dark)

type StatsKey = 'halal' | 'mashbuh' | 'haram' | 'variable';

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const selectedFunction = ref<string | null>(null)
const selectedOrigin = ref<string | null>(null)
const sortBy = ref('code')
const page = ref(1)
const itemsPerPage = 24
const selectedRegion = ref<'EU' | 'INT' | null>('EU')

const statusFilters = [
  { label: 'Halal', value: 'halal', icon: 'mdi-check-circle', color: 'success' },
  { label: 'Mashbuh', value: 'mashbuh', icon: 'mdi-alert-circle', color: 'warning' },
  { label: 'Haram', value: 'haram', icon: 'mdi-close-circle', color: 'error' },
]

const functionFilters = [
  { label: 'Colorant', value: 'colorant', icon: 'mdi-palette' },
  { label: 'Conservateur', value: 'conservateur', icon: 'mdi-clock-alert' },
  { label: 'Émulsifiant', value: 'émulsifiant', icon: 'mdi-water-circle' },
  { label: 'Stabilisant', value: 'stabilisant', icon: 'mdi-molecule' },
  { label: 'Antioxydant', value: 'antioxydant', icon: 'mdi-shield-check' }
]

const originFilters = [
  { label: 'Végétal', value: 'végétal', icon: 'mdi-leaf' },
  { label: 'Animal', value: 'animal', icon: 'mdi-cow' },
  { label: 'Synthétique', value: 'synthétique', icon: 'mdi-test-tube' },
  { label: 'Minéral', value: 'minéral', icon: 'mdi-diamond-stone' },
  { label: 'Animal/Végétal', value: 'animal/végétal', icon: 'mdi-swap-horizontal' }
]

const sortOptions = [
  { title: 'Code (E100...)', value: 'code' },
  { title: 'Nom (A-Z)', value: 'name' },
  { title: 'Statut halal', value: 'status' },
  { title: 'Fonction', value: 'function' },
  { title: 'Origine', value: 'origin' }
]

const statsItems = ref<Array<{ name: string; key: StatsKey; color: string }>>([
  { name: 'Halal', key: 'halal', color: 'success' },
  { name: 'Mashbuh', key: 'mashbuh', color: 'warning' },
  { name: 'Haram', key: 'haram', color: 'error' },
])

interface Additive {
  id: string,
  code: string,
  name: string,
  description: string,
  halal_status: string,
  origin_type: string,
  function: string,
  health_concerns: string
}

const allAdditives = ref<Additive[]>([
])

const filteredAdditives = computed(() => {

  let additives = [...allAdditives.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    additives = additives.filter(a =>
      a.code.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    additives = additives.filter(a => a.halal_status === selectedStatus.value)
  }

  if (selectedFunction.value) {
    additives = additives.filter(a => a.function === selectedFunction.value)
  }

  if (selectedOrigin.value) {
    additives = additives.filter(a => a.origin_type === selectedOrigin.value)
  }

  additives = sortAdditives(additives)

  return additives
})

const paginatedAdditives = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAdditives.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAdditives.value.length / itemsPerPage)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedStatus.value || selectedFunction.value || selectedOrigin.value
})

const statsCount = computed(() => {
  const counts = {
    halal: 0,
    mashbuh: 0,
    haram: 0,
    variable: 0
  }

  allAdditives.value.forEach(a => {
    if (a.halal_status in counts) {
      counts[a.halal_status as keyof typeof counts]++
    }
  })

  return counts
})

const getRegionalCode = (code: string) => {
  if (!code) return ''
  const number = code.replace(/[^0-9]/g, '')
  switch (selectedRegion.value) {
    case 'INT':
      return `INS${number}`
    default:
      return code
  }
}

const sortAdditives = (additives: any[]) => {
  switch (sortBy.value) {
    case 'code':
      return additives.sort((a, b) => a.code.localeCompare(b.code))
    case 'name':
      return additives.sort((a, b) => a.name.localeCompare(b.name))
    case 'status':
      return additives.sort((a, b) => a.halal_status.localeCompare(b.halal_status))
    case 'function':
      return additives.sort((a, b) => a.function.localeCompare(b.function))
    case 'origin':
      return additives.sort((a, b) => a.origin_type.localeCompare(b.origin_type))
    default:
      return additives
  }
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    mashbuh: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    mashbuh: 'Mashbuh'
  }
  return labels[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    mashbuh: 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getOriginIcon = (origin: string) => {
  const icons: Record<string, string> = {
    'végétal': 'mdi-leaf',
    'animal': 'mdi-cow',
    'synthétique': 'mdi-test-tube',
    'minéral': 'mdi-diamond-stone',
    'animal/végétal': 'mdi-swap-horizontal'
  }
  return icons[origin] || 'mdi-help-circle'
}

const toggleStatusFilter = (value: string) => {
  selectedStatus.value = selectedStatus.value === value ? null : value
  page.value = 1
}

const toggleFunctionFilter = (value: string) => {
  selectedFunction.value = selectedFunction.value === value ? null : value
  page.value = 1
}

const toggleOriginFilter = (value: string) => {
  selectedOrigin.value = selectedOrigin.value === value ? null : value
  page.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  page.value = 1
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedFunction.value = null
  selectedOrigin.value = null
  page.value = 1
}

const goToAdditive = (code: string) => {
  router.push(`/additives/${code}`)
}

watch([selectedStatus, selectedFunction, selectedOrigin, sortBy], () => {
  page.value = 1
})

onMounted(async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('additives')
      .select('*')
      .order('code', { ascending: true })

    if (error) throw error
    allAdditives.value = data || []
  } catch (error) {
    console.error('Erreur chargement additifs:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero-card {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%);
}

.additive-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.additive-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.description-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
}

.details-grid {
  display: grid;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
}

.gap-2 {
  gap: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-card {
  animation: fadeIn 0.4s ease-out;
}

.chip-filter {
  min-width: auto;
  cursor: pointer;
  touch-action: manipulation;
}

.sort-select {
  width: 100%;
}

@media (min-width: 600px) {
  .sort-select {
    width: 200px;
  }
}

@media (max-width: 600px) {
  .additive-card:hover {
    transform: translateY(-4px);
  }

  .v-card-text {
    padding: 12px !important;
  }
}
</style>