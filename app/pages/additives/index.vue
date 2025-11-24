<template>
  <v-app-bar elevation="0" class="px-2 px-sm-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="$router.push('/')" />

    <v-app-bar-title class="text-subtitle-1 text-sm-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Additifs</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn icon="mdi-magnify" variant="text" size="small" class="d-sm-none" @click="showMobileSearch = true" />
  </v-app-bar>

  <v-main>
    <section class="hero-section-additives position-relative overflow-hidden">
      <div class="hero-bg-mesh"></div>
      <v-container class="py-6 py-sm-10 position-relative z-1">
        <div class="d-flex flex-column flex-md-row align-center justify-space-between gap-6">
          <div class="text-center text-md-left max-width-600">
            <v-chip color="warning" variant="tonal" size="small" class="mb-4 font-weight-bold">
              <v-icon start size="small">mdi-flask</v-icon>
              Base de données
            </v-chip>
            <h1 class="text-h4 text-sm-h3 font-weight-black mb-4 text-on-surface">
              Additifs <span class="text-warning">Alimentaires</span>
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Consultez notre base de données complète pour identifier les additifs et vérifier leur statut halal.
            </p>

            <v-card elevation="0" class="search-card d-none d-sm-block" max-width="500" border rounded="xl">
              <v-text-field v-model="searchQuery" placeholder="Rechercher (ex: E471, Colorant...)"
                prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details density="comfortable" height="56"
                class="search-input" clearable @click:clear="clearSearch">
              </v-text-field>
            </v-card>
          </div>

          <div class="w-100 max-width-500">
            <v-row dense>
              <v-col v-for="stat in statsItems" :key="stat.key" cols="4">
                <v-card variant="flat" class="stat-card text-center py-4 h-100" :class="`bg-${stat.color}-lighten-5`"
                  border rounded="xl">
                  <div class="text-h5 text-sm-h4 font-weight-black mb-1" :class="`text-${stat.color}`">
                    {{ statsCount[stat.key] }}
                  </div>
                  <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis ls-1">
                    {{ stat.name }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="py-6">
      <div class="mb-8">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Filtres</h2>
          <v-btn v-if="hasActiveFilters" variant="text" color="error" size="small" prepend-icon="mdi-close"
            @click="clearAllFilters">
            Réinitialiser
          </v-btn>
        </div>

        <div class="mb-4">
          <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-2 d-block">Statut</span>
          <div class="d-flex flex-wrap gap-2">
            <v-chip v-for="filter in statusFilters" :key="filter.value"
              :color="selectedStatus === filter.value ? filter.color : undefined"
              :variant="selectedStatus === filter.value ? 'flat' : 'outlined'" class="filter-chip" filter
              @click="toggleStatusFilter(filter.value)">
              <v-icon start size="18">{{ filter.icon }}</v-icon>
              {{ filter.label }}
            </v-chip>
          </div>
        </div>

        <div class="mb-4">
          <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-2 d-block">Fonction</span>
          <div class="d-flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <v-chip v-for="func in functionFilters" :key="func.value"
              :color="selectedFunction === func.value ? 'primary' : undefined"
              :variant="selectedFunction === func.value ? 'flat' : 'outlined'" class="filter-chip" filter
              @click="toggleFunctionFilter(func.value)">
              <v-icon start size="18">{{ func.icon }}</v-icon>
              {{ func.label }}
            </v-chip>
          </div>
        </div>
      </div>

      <v-divider class="mb-6" />

      <div class="d-flex flex-column flex-sm-row justify-space-between align-center mb-6 gap-4">
        <div class="text-subtitle-1 font-weight-bold">
          {{ filteredAdditives.length }} additifs trouvés
        </div>

        <div class="d-flex gap-2 w-100 w-sm-auto">
          <v-select v-model="selectedRegion" :items="regionOptions" label="Format" variant="outlined" density="compact"
            hide-details class="region-select" rounded="lg" />

          <v-menu>
            <template #activator="{ props }">
              <v-btn variant="outlined" v-bind="props" append-icon="mdi-chevron-down" rounded="lg" height="40">
                Trier
              </v-btn>
            </template>
            <v-list density="compact" rounded="lg">
              <v-list-item v-for="option in sortOptions" :key="option.value" :value="option.value"
                @click="sortBy = option.value" :active="sortBy === option.value" color="primary">
                <v-list-item-title>{{ option.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <v-row v-if="!loading">
        <v-col v-for="additive in paginatedAdditives" :key="additive.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="additive-card h-100 d-flex flex-column" elevation="0" border rounded="xl"
            @click="goToAdditive(additive.code)">
            <v-card-text class="pa-5 flex-grow-1">
              <div class="d-flex justify-space-between align-start mb-4">
                <div class="code-badge"
                  :class="`bg-${getStatusColor(additive.halal_status)}-lighten-5 text-${getStatusColor(additive.halal_status)}`">
                  {{ getRegionalCode(additive.code) }}
                </div>
                <v-icon :color="getStatusColor(additive.halal_status)" size="24">
                  {{ getStatusIcon(additive.halal_status) }}
                </v-icon>
              </div>

              <h3 class="text-h6 font-weight-bold mb-2 line-clamp-1" :title="additive.name">
                {{ additive.name }}
              </h3>

              <p class="text-body-2 text-medium-emphasis mb-4 line-clamp-3">
                {{ additive.description }}
              </p>

              <div class="d-flex flex-wrap gap-2 mt-auto">
                <v-chip size="x-small" variant="tonal" color="primary">
                  {{ additive.function }}
                </v-chip>
                <v-chip size="x-small" variant="tonal" color="secondary">
                  {{ additive.origin_type }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="article" class="rounded-xl border" elevation="0" />
        </v-col>
      </v-row>

      <v-row v-if="!loading && filteredAdditives.length === 0">
        <v-col cols="12">
          <v-card elevation="0" rounded="xl" class="text-center py-16 bg-surface-variant-lighten">
            <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-flask-empty-outline</v-icon>
            <h2 class="text-h6 font-weight-bold mb-2">Aucun additif trouvé</h2>
            <p class="text-body-2 text-medium-emphasis mb-6">
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <v-btn color="primary" variant="flat" rounded="lg" @click="clearAllFilters">
              Réinitialiser
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="filteredAdditives.length > 0" class="d-flex justify-center mt-8">
        <v-pagination v-model="page" :length="totalPages" :total-visible="5" rounded="circle" active-color="primary" />
      </div>
    </v-container>
  </v-main>

  <v-dialog v-model="showMobileSearch" fullscreen transition="dialog-bottom-transition">
    <v-card class="bg-background">
      <v-toolbar color="surface" elevation="1">
        <v-btn icon="mdi-arrow-left" @click="showMobileSearch = false" />
        <v-text-field v-model="searchQuery" placeholder="Rechercher un additif..." variant="plain" hide-details
          autofocus class="mx-2" clearable />
      </v-toolbar>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

useHead({
  title: 'IOFD - Additifs'
})

const supabase = useSupabase()
const theme = useTheme()
const router = useRouter()

const loading = ref(false)
const searchQuery = ref('')
const showMobileSearch = ref(false)
const selectedStatus = ref<string | null>(null)
const selectedFunction = ref<string | null>(null)
const selectedOrigin = ref<string | null>(null)
const sortBy = ref('code')
const page = ref(1)
const itemsPerPage = 24
const selectedRegion = ref<'EU' | 'INT'>('EU')

const regionOptions = [
  { title: 'Europe (E-code)', value: 'EU' },
  { title: 'International (INS)', value: 'INT' },
]

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

const sortOptions = [
  { title: 'Code (E100...)', value: 'code' },
  { title: 'Nom (A-Z)', value: 'name' },
  { title: 'Statut halal', value: 'status' },
]

type StatsKey = 'halal' | 'mashbuh' | 'haram';
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

const allAdditives = ref<Additive[]>([])

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
  return searchQuery.value || selectedStatus.value || selectedFunction.value
})

const statsCount = computed(() => {
  const counts = {
    halal: 0,
    mashbuh: 0,
    haram: 0
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

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    mashbuh: 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const toggleStatusFilter = (value: string) => {
  selectedStatus.value = selectedStatus.value === value ? null : value
  page.value = 1
}

const toggleFunctionFilter = (value: string) => {
  selectedFunction.value = selectedFunction.value === value ? null : value
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
  page.value = 1
}

const goToAdditive = (code: string) => {
  router.push(`/additives/${code}`)
}

watch([selectedStatus, selectedFunction, sortBy], () => {
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
.hero-section-additives {
  background: linear-gradient(135deg, rgba(var(--v-theme-warning), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
  padding-bottom: 2rem;
}

.hero-bg-mesh {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(var(--v-theme-warning), 0.1) 0%, transparent 50%);
  filter: blur(60px);
  z-index: 0;
}

.z-1 {
  z-index: 1;
}

.search-input :deep(.v-field) {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
}

.stat-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.additive-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.additive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.code-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.gap-6 {
  gap: 24px;
}

.ls-1 {
  letter-spacing: 1px;
}

.filter-chip {
  transition: all 0.2s ease;
}

.filter-chip:hover {
  transform: translateY(-1px);
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.region-select {
  width: 140px;
}

@media (max-width: 600px) {
  .hero-section-additives {
    border-radius: 0 0 24px 24px;
  }
}
</style>