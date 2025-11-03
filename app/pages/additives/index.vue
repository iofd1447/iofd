<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />

    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Additifs alimentaires</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'" variant="text" @click="toggleTheme" />
  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-6">
      <!-- Hero Section -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="4" rounded="xl" class="hero-card mb-6">
            <v-card-text class="pa-8">
              <div class="d-flex align-center mb-4">
                <v-avatar color="warning" size="64" class="mr-4">
                  <v-icon size="36" color="white">mdi-flask</v-icon>
                </v-avatar>
                <div>
                  <h1 class="text-h4 font-weight-bold mb-2">
                    Base de données des additifs
                  </h1>
                  <p class="text-body-1 text-medium-emphasis mb-0">
                    {{ filteredAdditives.length }} additifs alimentaires référencés avec leur statut halal
                  </p>
                </div>
              </div>

              <!-- Stats rapides -->
              <v-row dense>
                <v-col cols="6" sm="3">
                  <v-card variant="tonal" color="success">
                    <v-card-text class="text-center py-3">
                      <div class="text-h5 font-weight-bold">{{ statsCount.halal }}</div>
                      <div class="text-caption">Halal</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-card variant="tonal" color="warning">
                    <v-card-text class="text-center py-3">
                      <div class="text-h5 font-weight-bold">{{ statsCount.douteux }}</div>
                      <div class="text-caption">Douteux</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-card variant="tonal" color="error">
                    <v-card-text class="text-center py-3">
                      <div class="text-h5 font-weight-bold">{{ statsCount.haram }}</div>
                      <div class="text-caption">Haram</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="text-center py-3">
                      <div class="text-h5 font-weight-bold">{{ statsCount.variable }}</div>
                      <div class="text-caption">Variable</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters Section -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-4">
              <!-- Search Bar -->
              <v-text-field v-model="searchQuery" placeholder="Rechercher par code (E471) ou nom d'additif..."
                prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details density="comfortable" class="mb-4">
                <template #append-inner>
                  <v-btn v-if="searchQuery" icon="mdi-close" variant="text" size="small" @click="clearSearch" />
                </template>
              </v-text-field>

              <!-- Filters -->
              <div class="d-flex flex-wrap gap-2 align-center mb-4">
                <span class="text-subtitle-2 text-medium-emphasis mr-2">Statut halal:</span>
                <v-chip v-for="filter in statusFilters" :key="filter.value"
                  :color="selectedStatus === filter.value ? filter.color : 'default'"
                  :variant="selectedStatus === filter.value ? 'flat' : 'tonal'"
                  @click="toggleStatusFilter(filter.value)">
                  <v-icon start size="small">{{ filter.icon }}</v-icon>
                  {{ filter.label }}
                </v-chip>
              </div>

              <div class="d-flex flex-wrap gap-2 align-center mb-4">
                <span class="text-subtitle-2 text-medium-emphasis mr-2">Fonction:</span>
                <v-chip v-for="func in functionFilters" :key="func.value"
                  :variant="selectedFunction === func.value ? 'flat' : 'tonal'"
                  :color="selectedFunction === func.value ? 'primary' : 'default'"
                  @click="toggleFunctionFilter(func.value)">
                  <v-icon start size="small">{{ func.icon }}</v-icon>
                  {{ func.label }}
                </v-chip>
              </div>

              <div class="d-flex flex-wrap gap-2 align-center">
                <span class="text-subtitle-2 text-medium-emphasis mr-2">Origine:</span>
                <v-chip v-for="origin in originFilters" :key="origin.value"
                  :variant="selectedOrigin === origin.value ? 'flat' : 'tonal'"
                  :color="selectedOrigin === origin.value ? 'secondary' : 'default'"
                  @click="toggleOriginFilter(origin.value)">
                  <v-icon start size="small">{{ origin.icon }}</v-icon>
                  {{ origin.label }}
                </v-chip>
              </div>

              <v-divider class="my-4" />

              <!-- Active filters display -->
              <div v-if="hasActiveFilters" class="d-flex align-center gap-2">
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

      <!-- Results Info -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-h6 font-weight-bold">
              {{ filteredAdditives.length }} additif{{ filteredAdditives.length > 1 ? 's' : '' }}
            </div>
            <v-select v-model="sortBy" :items="sortOptions" variant="outlined" density="compact" hide-details
              style="max-width: 200px" />
          </div>

          <v-select v-model="selectedRegion" :items="[
            { title: 'Europe (E-code)', value: 'EU' },
            { title: 'International (INS)', value: 'INT' },
          ]" label="Format du code" variant="outlined" density="compact" hide-details style="max-width: 200px" />
        </v-col>
      </v-row>

      <!-- Additives List -->
      <v-row v-if="!loading">
        <v-col v-for="additive in paginatedAdditives" :key="additive.id" cols="12" sm="6" md="4">
          <v-card class="additive-card h-100" elevation="2" rounded="xl" hover @click="goToAdditive(additive.code)">
            <v-card-text class="pa-4">
              <!-- Header -->
              <div class="d-flex justify-space-between align-center mb-3">
                <v-chip :color="getStatusColor(additive.halal_status)" variant="flat" class="font-weight-bold">
                  {{ getRegionalCode(additive.code) }}
                </v-chip>
                <v-chip :color="getStatusColor(additive.halal_status)" size="small" variant="tonal">
                  <v-icon start size="x-small">{{ getStatusIcon(additive.halal_status) }}</v-icon>
                  {{ getStatusLabel(additive.halal_status) }}
                </v-chip>
              </div>

              <!-- Name -->
              <h3 class="text-h6 mb-2">{{ additive.name }}</h3>

              <!-- Description -->
              <p class="text-body-2 text-medium-emphasis mb-3 description-text">
                {{ additive.description }}
              </p>

              <!-- Details -->
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

              <!-- Health concerns -->
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

      <!-- Loading State -->
      <v-row v-else>
        <v-col v-for="i in 12" :key="i" cols="12" sm="6" md="4">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>

      <!-- Empty State -->
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

      <!-- Pagination -->
      <v-row v-if="filteredAdditives.length > 0">
        <v-col cols="12" class="d-flex justify-center mt-6">
          <v-pagination v-model="page" :length="totalPages" :total-visible="7" rounded="circle" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const supabase = useSupabase()
const theme = useTheme()
const router = useRouter()

const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

// State
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const selectedFunction = ref<string | null>(null)
const selectedOrigin = ref<string | null>(null)
const sortBy = ref('code')
const page = ref(1)
const itemsPerPage = 24
const selectedRegion = ref<'EU' | 'INT' | null>('EU') // EU = E-code, INT = INS


// Filters
const statusFilters = [
  { label: 'Halal', value: 'halal', icon: 'mdi-check-circle', color: 'success' },
  { label: 'Douteux', value: 'douteux', icon: 'mdi-alert-circle', color: 'warning' },
  { label: 'Haram', value: 'haram', icon: 'mdi-close-circle', color: 'error' },
  { label: 'Variable', value: 'variable', icon: 'mdi-swap-horizontal-circle', color: 'primary' }
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

// Mock data - À remplacer par appel API Supabase
const allAdditives = ref([
  {
    id: '1',
    code: 'E100',
    name: 'Curcumine',
    description: 'Colorant jaune extrait du curcuma',
    halal_status: 'halal',
    origin_type: 'végétal',
    function: 'colorant',
    health_concerns: null
  },
  {
    id: '2',
    code: 'E120',
    name: 'Cochineal',
    description: 'Colorant rouge d\'origine animale',
    halal_status: 'haram',
    origin_type: 'animal',
    function: 'colorant',
    health_concerns: 'allergies possibles'
  },
  {
    id: '3',
    code: 'E471',
    name: 'Mono- et diglycérides d\'acides gras',
    description: 'Émulsifiant',
    halal_status: 'variable',
    origin_type: 'animal/végétal',
    function: 'émulsifiant',
    health_concerns: null
  },
  {
    id: '4',
    code: 'E150d',
    name: 'Caramel ammoniacal',
    description: 'Colorant brun caramel',
    halal_status: 'douteux',
    origin_type: 'végétal',
    function: 'colorant',
    health_concerns: null
  },
  {
    id: '5',
    code: 'E441',
    name: 'Gélatine',
    description: 'Épaississant animal',
    halal_status: 'haram',
    origin_type: 'animal',
    function: 'stabilisant',
    health_concerns: null
  },
  {
    id: '6',
    code: 'E300',
    name: 'Acide ascorbique',
    description: 'Antioxydant',
    halal_status: 'halal',
    origin_type: 'végétal',
    function: 'antioxydant',
    health_concerns: null
  }
])

// Computed
const filteredAdditives = computed(() => {
  let additives = [...allAdditives.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    additives = additives.filter(a =>
      a.code.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (selectedStatus.value) {
    additives = additives.filter(a => a.halal_status === selectedStatus.value)
  }

  // Function filter
  if (selectedFunction.value) {
    additives = additives.filter(a => a.function === selectedFunction.value)
  }

  // Origin filter
  if (selectedOrigin.value) {
    additives = additives.filter(a => a.origin_type === selectedOrigin.value)
  }

  // Sort
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
    douteux: 0,
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

// Methods
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
    douteux: 'warning',
    variable: 'primary'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    douteux: 'Douteux',
    variable: 'Variable'
  }
  return labels[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    douteux: 'mdi-alert-circle',
    variable: 'mdi-swap-horizontal-circle'
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

// Watch for filters changes
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

@media (max-width: 600px) {
  .additive-card:hover {
    transform: translateY(-4px);
  }
}
</style>