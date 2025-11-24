<template>
  <v-dialog v-model="internalModel" :max-width="$vuetify.display.xs ? '95%' : '900px'" scrollable>
    <v-card rounded="xl">
      <v-card-title :class="['font-weight-bold pa-4 pa-sm-6']">
        <v-icon start color="primary" :size="$vuetify.display.xs ? '20' : '24'">mdi-pencil</v-icon>
        <span :class="['text-subtitle-1 text-sm-h6']">Modifier le produit</span>
      </v-card-title>

      <v-card-text :class="['pa-3 pa-sm-6 pt-2 pt-sm-4']">
        <v-alert v-if="!user" type="warning" variant="tonal" rounded="xl" class="mb-3 mb-sm-4" prominent>
          <template #prepend>
            <v-icon :size="$vuetify.display.xs ? '24' : '28'">mdi-alert-circle</v-icon>
          </template>
          <div class="d-flex flex-column flex-sm-row align-start align-sm-center w-100 ga-2">
            <div class="mr-sm-4">
              <div :class="['text-subtitle-2 text-sm-subtitle-1 font-weight-bold mb-1']">Connexion requise</div>
              <div class="text-caption text-sm-body-2 text-medium-emphasis">
                Connectez-vous pour modifier les informations du produit.
              </div>
            </div>
            <div class="d-flex ga-2 ml-sm-auto w-100 w-sm-auto">
              <v-btn color="primary" variant="flat" to="/auth/login" block
                :size="$vuetify.display.xs ? 'small' : 'default'">
                Se connecter
              </v-btn>
              <v-btn color="primary" variant="outlined" to="/auth/signup" block
                :size="$vuetify.display.xs ? 'small' : 'default'">
                Créer un compte
              </v-btn>
            </div>
          </div>
        </v-alert>

        <v-stepper v-model="step" :items="steps" hide-actions flat color="primary" class="elevation-0 mb-4"
          :mobile="$vuetify.display.xs" />

        <div v-show="step === 1">
          <div class="d-flex align-center mb-4 mb-sm-6">
            <v-avatar color="primary" :size="$vuetify.display.xs ? '40' : '48'" class="mr-3 mr-sm-4">
              <v-icon color="white" :size="$vuetify.display.xs ? '20' : '24'">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h6 text-sm-h5 font-weight-bold mb-1">Informations de base</h2>
              <p class="text-caption text-sm-body-2 text-medium-emphasis mb-0 d-none d-sm-block">
                Détails essentiels du produit
              </p>
            </div>
          </div>

          <v-row :dense="$vuetify.display.xs">
            <v-col cols="12" md="4">
              <v-text-field v-model="form.barcode" label="Code-barres" prepend-inner-icon="mdi-barcode"
                placeholder="3017620422003" hint="Jusqu'à 32 caractères" persistent-hint maxlength="32">
              </v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.name" label="Nom du produit *" prepend-inner-icon="mdi-tag"
                :rules="[v => !!v || 'Requis']" :density="$vuetify.display.xs ? 'comfortable' : 'default'" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.brand" label="Marque" prepend-inner-icon="mdi-store"
                :density="$vuetify.display.xs ? 'comfortable' : 'default'" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="form.category_id" :items="categories" item-title="name" item-value="id"
                label="Catégorie *" prepend-inner-icon="mdi-shape" :rules="[v => !!v || 'Requis']"
                :loading="loadingCategories" :density="$vuetify.display.xs ? 'comfortable' : 'default'">
                <template #selection="{ item }">
                  {{ item.raw?.name || item.raw }}
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.portion_description" label="Description de la portion"
                prepend-inner-icon="mdi-scale" placeholder="100g, 330ml, 1 pièce..."
                :density="$vuetify.display.xs ? 'comfortable' : 'default'" />
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Photo du produit</div>
              <v-card variant="outlined" class="image-upload" rounded="lg" :class="{ 'has-image': previewUrl }">
                <v-card-text class="pa-4">
                  <div v-if="!previewUrl" class="text-center">
                    <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-image-plus</v-icon>
                    <div class="text-body-2 mb-2">Ajouter une photo</div>
                    <v-btn color="primary" variant="tonal" prepend-icon="mdi-upload" size="small" @click="selectImage">
                      Choisir une image
                    </v-btn>
                    <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageUpload">
                  </div>
                  <div v-else class="position-relative">
                    <v-img :src="previewUrl" height="200" cover rounded="lg" />
                    <v-btn icon="mdi-close" size="small" color="error" class="position-absolute"
                      style="top: 8px; right: 8px;" @click="removeImage" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-show="step === 2">
          <div class="d-flex align-center mb-4 mb-sm-6">
            <v-avatar color="success" :size="$vuetify.display.xs ? '40' : '48'" class="mr-3 mr-sm-4">
              <v-icon color="white" :size="$vuetify.display.xs ? '20' : '24'">mdi-shield-check</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h6 text-sm-h5 font-weight-bold mb-1">Statut Halal</h2>
              <p class="text-caption text-sm-body-2 text-medium-emphasis mb-0 d-none d-sm-block">
                Informations sur la certification halal
              </p>
            </div>
          </div>

          <v-row :dense="$vuetify.display.xs">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Statut Halal *</div>
              <v-chip-group v-model="form.halal_status" mandatory column>
                <v-chip v-for="status in halalStatuses" :key="status.value" :value="status.value" :color="status.color"
                  :size="$vuetify.display.xs ? 'default' : 'large'" filter variant="outlined" class="px-4 px-sm-6">
                  <v-icon start>{{ status.icon }}</v-icon>
                  {{ status.label }}
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col cols="12">
              <v-combobox v-model="form.certification_body" :items="certificationBodies" label="Organisme certificateur"
                prepend-inner-icon="mdi-certificate" placeholder="AVS, SFCVH..." clearable
                :density="$vuetify.display.xs ? 'comfortable' : 'default'" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.halal_notes" label="Notes additionnelles" prepend-inner-icon="mdi-note-text"
                placeholder="Informations complémentaires..." rows="3" auto-grow
                :density="$vuetify.display.xs ? 'comfortable' : 'default'" />
            </v-col>
          </v-row>
        </div>

        <div v-show="step === 3">
          <div class="d-flex align-center mb-4 mb-sm-6">
            <v-avatar color="secondary" :size="$vuetify.display.xs ? '40' : '48'" class="mr-3 mr-sm-4">
              <v-icon color="white" :size="$vuetify.display.xs ? '20' : '24'">mdi-flask</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h6 text-sm-h5 font-weight-bold mb-1">Ingrédients & Additifs</h2>
              <p class="text-caption text-sm-body-2 text-medium-emphasis mb-0 d-none d-sm-block">
                Composition détaillée du produit
              </p>
            </div>
          </div>

          <v-row :dense="$vuetify.display.xs">
            <v-col cols="12">
              <v-text-field v-model="ingredientsInput" label="Ingrédients" prepend-inner-icon="mdi-leaf"
                placeholder="Eau, sucre, arômes..." hint="Séparez par des virgules. Dans l'ordre de la liste"
                persistent-hint :density="$vuetify.display.xs ? 'comfortable' : 'default'" />
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Additifs</div>
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-flask-outline" append-icon="mdi-chevron-right"
                block :size="$vuetify.display.xs ? 'default' : 'large'" @click="showAdditivesDialog = true"
                class="additives-select-btn">
                <span v-if="selectedAdditives.length === 0">Sélectionner des additifs</span>
                <span v-else>{{ selectedAdditives.length }} additif{{ selectedAdditives.length > 1 ? 's' : '' }}
                  sélectionné{{
                    selectedAdditives.length > 1 ? 's' : '' }}</span>
              </v-btn>
              <div v-if="selectedAdditives.length > 0" class="mt-3">
                <v-chip-group>
                  <v-chip v-for="additive in selectedAdditives"
                    :key="typeof additive === 'string' ? additive : additive.id" :color="getAdditiveColor(additive)"
                    closable @click:close="removeAdditive(additive)" :size="$vuetify.display.xs ? 'small' : 'default'">
                    <v-icon start size="16">{{ getAdditiveIcon(additive) }}</v-icon>
                    {{ typeof additive === 'string' ? additive : additive.code }}
                  </v-chip>
                </v-chip-group>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Allergènes</div>
              <v-chip-group v-model="selectedAllergens" multiple column>
                <v-chip v-for="allergen in allergensList" :key="allergen.id" :value="allergen.id" filter
                  variant="outlined" color="warning" :size="$vuetify.display.xs ? 'small' : 'default'">
                  {{ allergen.name }}
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Labels & Certifications</div>
              <v-chip-group v-model="selectedLabels" multiple column>
                <v-chip v-for="label in labelsList" :key="label.id" :value="label.id" filter variant="outlined"
                  color="tertiary" :size="$vuetify.display.xs ? 'small' : 'default'">
                  {{ label.name }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </div>

        <div v-show="step === 4">
          <div class="d-flex align-center mb-4 mb-sm-6">
            <v-avatar color="tertiary" :size="$vuetify.display.xs ? '40' : '48'" class="mr-3 mr-sm-4">
              <v-icon color="white" :size="$vuetify.display.xs ? '20' : '24'">mdi-nutrition</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h6 text-sm-h5 font-weight-bold mb-1">Valeurs nutritionnelles</h2>
              <p class="text-caption text-sm-body-2 text-medium-emphasis mb-0 d-none d-sm-block">
                Pour {{ form.portion_description || '100g' }}
              </p>
            </div>
          </div>

          <v-row :dense="$vuetify.display.xs">
            <v-col v-for="field in nutritionFields" :key="field.key" cols="12" sm="6" md="4">
              <v-text-field v-model="form.nutrition[field.key]" :label="`${field.label} ${field.suffix}`" type="number"
                step="any" inputmode="decimal" :prepend-inner-icon="field.icon" :suffix="field.suffix"
                :density="$vuetify.display.xs ? 'comfortable' : 'default'" />
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-card-actions class="pa-3 pa-sm-6 pt-0">
        <v-btn v-if="step > 1" variant="text" prepend-icon="mdi-arrow-left" @click="prevStep"
          :size="$vuetify.display.xs ? 'default' : 'large'" class="mb-2 mb-sm-0">
          Retour
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close" :size="$vuetify.display.xs ? 'default' : 'large'">Annuler</v-btn>
        <v-btn v-if="step < 4" color="primary" append-icon="mdi-arrow-right" @click="nextStep"
          :size="$vuetify.display.xs ? 'default' : 'large'">
          Continuer
        </v-btn>
        <v-btn v-else color="primary" :loading="saving" @click="onSubmit"
          :size="$vuetify.display.xs ? 'default' : 'large'">
          <v-icon start>mdi-content-save</v-icon>
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showAdditivesDialog" :fullscreen="$vuetify.display.xs"
    :max-width="$vuetify.display.xs ? '100%' : '800'" scrollable>
    <v-card rounded="xl">
      <v-card-title class="pa-4 pa-sm-6 d-flex align-center">
        <v-icon class="mr-3" color="primary" size="24">mdi-flask-outline</v-icon>
        <span class="text-h6">Sélectionner des additifs</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="showAdditivesDialog = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4 pa-sm-6">
        <div class="dialog-sticky">
          <v-text-field v-model="additiveSearchQuery" prepend-inner-icon="mdi-magnify"
            placeholder="Rechercher par code (E330) ou nom..." variant="outlined" density="compact" clearable
            class="mb-3" />
          <div class="d-flex flex-wrap ga-2 mb-3">
            <v-chip v-for="status in additiveFilterStatuses" :key="status.value" :color="status.color"
              :variant="selectedAdditiveFilter === status.value ? 'flat' : 'outlined'" filter size="small"
              @click="selectedAdditiveFilter = selectedAdditiveFilter === status.value ? null : status.value">
              <v-icon start size="14">{{ status.icon }}</v-icon>
              {{ status.label }}
            </v-chip>
            <v-spacer />
            <v-btn size="small" variant="text"
              @click="selectedAdditiveFilter = null; additiveSearchQuery = ''">Réinitialiser</v-btn>
          </div>
        </div>
        <div class="text-caption text-medium-emphasis mb-3">
          {{ filteredAdditives.length }} additif{{ filteredAdditives.length > 1 ? 's' : '' }} trouvé{{
            filteredAdditives.length > 1 ? 's' : '' }}
        </div>
        <v-divider class="mb-4" />
        <div class="additives-list">
          <v-list>
            <v-list-item v-for="additive in filteredAdditives" :key="additive.id" :value="additive.id"
              @click="toggleAdditive(additive)" class="additive-item" density="compact">
              <template #prepend>
                <v-checkbox :model-value="isAdditiveSelected(additive)" @click.stop="toggleAdditive(additive)"
                  color="primary" hide-details density="compact" />
              </template>
              <v-list-item-title class="d-flex align-center">
                <v-chip :color="getAdditiveColor(additive)" size="x-small" variant="tonal" class="mr-2">
                  {{ additive.code }}
                </v-chip>
                <span class="font-weight-medium">{{ additive.name }}</span>
              </v-list-item-title>
              <v-list-item-subtitle v-if="additive.description" class="mt-1 text-truncate">
                {{ additive.description }}
              </v-list-item-subtitle>
              <template #append>
                <v-icon :color="getAdditiveColor(additive)" size="18">{{ getAdditiveIcon(additive) }}</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4 pa-sm-6">
        <v-spacer />
        <v-btn variant="text" @click="showAdditivesDialog = false">Annuler</v-btn>
        <v-btn color="primary" variant="flat" @click="showAdditivesDialog = false">Valider ({{ selectedAdditives.length
        }})</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useSupabase } from '#imports';
import { useProductEditor, type EditableProductFields } from '@/composables/useProductEditor';
import { useSupabaseAuth } from '@/composables/useSupabaseAuth';
import { computed, ref, watch } from 'vue';

type Category = { id: string; name: string }
type Allergen = { id: string; name: string }
type Label = { id: string; name: string }
type Additive = { id: string; code: string; name: string; description?: string; halal_status?: string; display: string }

const props = defineProps<{
  modelValue: boolean
  product: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', value: any): void
}>()

const internalModel = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const step = ref(1)
const steps = [
  { title: 'Informations', value: 1 },
  { title: 'Statut Halal', value: 2 },
  { title: 'Composition', value: 3 },
  { title: 'Nutrition', value: 4 },
]

const formRef = ref()

type EditForm = Omit<EditableProductFields, 'nutrition'> & {
  nutrition: Record<string, number | null>
}

const defaultNutrition: Record<string, number | null> = {
  calories_kcal: null,
  protein_g: null,
  carbs_g: null,
  sugars_g: null,
  fats_g: null,
  saturated_fats_g: null,
  trans_fats_g: null,
  fibres_g: null,
  sodium_mg: null,
  calcium_mg: null,
  water_ml: null,
}

const form = ref<EditForm>({
  barcode: '',
  name: '',
  brand: '',
  category_id: undefined,
  portion_description: '',
  image_file: null,
  image_url: null,
  halal_status: 'non_verifie',
  certification_body: '',
  halal_notes: '',
  nutrition: { ...defaultNutrition },
  ingredients: [],
  additives: [],
  allergens: [],
  labels: [],
})

const imageFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = computed(() => {
  if (imageFile.value) return URL.createObjectURL(imageFile.value)
  return form.value.image_url || props.product?.image_url || null
})

const categories = ref<Category[]>([])
const loadingCategories = ref(false)
const additives = ref<Additive[]>([])
const loadingAdditives = ref(false)
const allergensList = ref<Allergen[]>([])
const labelsList = ref<Label[]>([])

const selectedAdditives = ref<any[]>([])
const selectedAllergens = ref<string[]>([])
const selectedLabels = ref<string[]>([])
const ingredientsInput = ref('')
const showAdditivesDialog = ref(false)
const additiveSearchQuery = ref('')
const selectedAdditiveFilter = ref<string | null>(null)

const halalStatuses = [
  { value: 'halal', label: 'Halal', icon: 'mdi-check-circle', color: 'success' },
  { value: 'haram', label: 'Haram', icon: 'mdi-close-circle', color: 'error' },
  { value: 'mashbuh', label: 'Mashbuh', icon: 'mdi-alert-circle', color: 'warning' }
]

const certificationBodies = [
  'AVS',
  'Halal Monitoring Committee',
  'Taiwan Halal Integrity Development Association',
  'Autre'
]

const nutritionFields = [
  { key: 'calories_kcal', label: 'Calories', icon: 'mdi-fire', suffix: 'kcal' },
  { key: 'protein_g', label: 'Protéines', icon: 'mdi-egg', suffix: 'g' },
  { key: 'carbs_g', label: 'Glucides', icon: 'mdi-pasta', suffix: 'g' },
  { key: 'sugars_g', label: 'Sucres', icon: 'mdi-candy', suffix: 'g' },
  { key: 'fats_g', label: 'Lipides', icon: 'mdi-oil', suffix: 'g' },
  { key: 'saturated_fats_g', label: 'Graisses saturées', icon: 'mdi-food-drumstick', suffix: 'g' },
  { key: 'fibres_g', label: 'Fibres', icon: 'mdi-barley', suffix: 'g' },
  { key: 'sodium_mg', label: 'Sodium', icon: 'mdi-shaker', suffix: 'mg' },
  { key: 'calcium_mg', label: 'Calcium', icon: 'mdi-water', suffix: 'mg' },
]

const supabase = useSupabase()
const { saving, updateProduct } = useProductEditor()
const { user } = useSupabaseAuth()

watch(() => props.product, (p) => {
  if (!p) return
  const ingredients = (p.ingredients || []).map((i: any) => i.name).join(', ')
  const additiveIds = (p.additives || []).map((a: any) => {
    if (a.id) return { id: a.id, code: a.code }
    if (a.code) return { id: a.code, code: a.code }
    return null
  }).filter(Boolean)
  const allergenIds = (p.allergens || []).map((a: any) => a.id || a.allergen_id).filter(Boolean)
  const labelIds = (p.labels || []).map((l: any) => {
    if (typeof l === 'string') return null
    return l.id || l.label_id
  }).filter(Boolean)

  form.value = {
    barcode: p.barcode || '',
    name: p.name || '',
    brand: p.brand || '',
    category_id: p.category_id || undefined,
    portion_description: p.portion_description || '',
    image_file: null,
    image_url: p.image_url || null,
    halal_status: p.halal_status || 'non_verifie',
    certification_body: p.certification?.body || '',
    halal_notes: p.certification?.notes || '',
    nutrition: { ...defaultNutrition, ...((p.nutrition as any) || {}) },
    ingredients: [],
    additives: [],
    allergens: [],
    labels: [],
  }
  ingredientsInput.value = ingredients
  selectedAdditives.value = additiveIds
  selectedAllergens.value = allergenIds
  selectedLabels.value = labelIds
  imageFile.value = null
}, { immediate: true })

watch(ingredientsInput, (val) => {
  const parts = (val || '').split(',').map(s => s.trim()).filter(Boolean)
  form.value.ingredients = parts
})

watch(selectedAdditives, (arr) => {
  form.value.additives = arr.map((a: any) => {
    if (typeof a === 'string') return a
    if (a && typeof a === 'object') return a.id || a.code || a
    return a
  }).filter(Boolean)
})

watch(selectedAllergens, (arr) => {
  form.value.allergens = arr
})

watch(selectedLabels, (arr) => {
  form.value.labels = arr
})

const getAdditiveColor = (additive: any) => {
  if (typeof additive === 'object' && additive.halal_status) {
    const colors: Record<string, string> = {
      halal: 'success',
      haram: 'error',
      mashbuh: 'warning'
    }
    return colors[additive.halal_status] || 'secondary'
  }
  return 'secondary'
}

const getAdditiveIcon = (additive: any) => {
  if (typeof additive === 'object' && additive.halal_status) {
    const icons: Record<string, string> = {
      halal: 'mdi-check-circle',
      haram: 'mdi-close-circle',
      mashbuh: 'mdi-alert-circle'
    }
    return icons[additive.halal_status] || 'mdi-circle'
  }
  return 'mdi-circle'
}

const additiveFilterStatuses = [
  { value: 'halal', label: 'Halal', color: 'success', icon: 'mdi-check-circle' },
  { value: 'haram', label: 'Haram', color: 'error', icon: 'mdi-close-circle' },
  { value: 'mashbuh', label: 'Mashbuh', color: 'warning', icon: 'mdi-alert-circle' }
]

const filteredAdditives = computed(() => {
  let filtered = additives.value
  if (additiveSearchQuery.value) {
    const query = additiveSearchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.code.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query) ||
      (a as any).description?.toLowerCase?.().includes(query)
    )
  }
  if (selectedAdditiveFilter.value) {
    filtered = filtered.filter(a => (a as any).halal_status === selectedAdditiveFilter.value)
  }
  return filtered
})

const isAdditiveSelected = (additive: any) => {
  return selectedAdditives.value.some(sel =>
    typeof sel === 'object' && typeof additive === 'object'
      ? (sel.id || sel.code) === (additive.id || additive.code)
      : sel === additive
  )
}

const toggleAdditive = (additive: any) => {
  const index = selectedAdditives.value.findIndex(sel =>
    typeof sel === 'object' && typeof additive === 'object'
      ? (sel.id || sel.code) === (additive.id || additive.code)
      : sel === additive
  )
  if (index > -1) selectedAdditives.value.splice(index, 1)
  else selectedAdditives.value.push(additive)
}

const removeAdditive = (additive: any) => {
  const index = selectedAdditives.value.findIndex(sel =>
    typeof sel === 'object' && typeof additive === 'object'
      ? (sel.id || sel.code) === (additive.id || additive.code)
      : sel === additive
  )
  if (index > -1) selectedAdditives.value.splice(index, 1)
}

async function loadCategories() {
  loadingCategories.value = true
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('Error loading categories:', error)
      throw error
    }
    categories.value = (data || []) as Category[]
    console.log('Categories loaded:', categories.value)
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    loadingCategories.value = false
  }
}

async function loadAdditives() {
  loadingAdditives.value = true
  try {
    const { data, error } = await supabase
      .from('additives')
      .select('id, code, name, description, halal_status')
      .order('code')
    if (!error && data) {
      additives.value = (data || []).map((a: any) => ({
        ...a,
        display: `${a.code} - ${a.name}`
      }))
    }
  } finally {
    loadingAdditives.value = false
  }
}

async function loadAllergens() {
  try {
    const { data, error } = await supabase
      .from('allergens')
      .select('id, name')
      .order('name')
    if (!error && data) allergensList.value = data as Allergen[]
  } catch (error) {
    console.error('Error loading allergens:', error)
  }
}

async function loadLabels() {
  try {
    const { data, error } = await supabase
      .from('labels')
      .select('id, name')
      .order('name')
    if (!error && data) labelsList.value = data as Label[]
  } catch (error) {
    console.error('Error loading labels:', error)
  }
}

watch(internalModel, async (open) => {
  if (open) {
    step.value = 1
    await loadCategories()
    await Promise.all([
      loadAdditives(),
      loadAllergens(),
      loadLabels(),
    ])
  }
})

function nextStep() {
  if (step.value < 4) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

function close() {
  internalModel.value = false
}

function selectImage() {
  fileInput.value?.click()
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
      return
    }
    imageFile.value = file
    form.value.image_file = file
  }
}

function removeImage() {
  imageFile.value = null
  form.value.image_file = null
  form.value.image_url = null
}

async function onSubmit() {
  if (!props.product?.id) return
  try {
    const payload: EditableProductFields = {
      ...form.value,
      image_file: imageFile.value,
    }
    const updated = await updateProduct(props.product.id, payload)
    emit('saved', updated)
    close()
  } catch (error) {
    console.error('Error updating product:', error)
  }
}
</script>

<style scoped>
.v-card-title {
  position: sticky;
  top: 0;
  background: rgba(var(--v-theme-surface), 1);
  z-index: 1;
}

.image-upload {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
}

.image-upload:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background: rgba(var(--v-theme-primary), 0.02);
}

.image-upload.has-image {
  border-style: solid;
  cursor: default;
}

.v-stepper {
  box-shadow: none !important;
  background: transparent !important;
}

@media (max-width: 600px) {
  .v-stepper ::v-deep(.v-stepper-item) {
    padding: 8px 4px;
  }

  .v-stepper ::v-deep(.v-stepper-item__title) {
    font-size: 0.75rem;
  }

  .v-stepper ::v-deep(.v-stepper-item__avatar) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
}

.additives-select-btn {
  transition: all 0.3s ease;
}

.additives-select-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.additive-item {
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 4px;
}

.additive-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

.additives-list {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.additives-list::-webkit-scrollbar {
  width: 6px;
}

.additives-list::-webkit-scrollbar-track {
  background: transparent;
}

.additives-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.additives-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

@media (max-width: 600px) {
  .dialog-sticky {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgb(var(--v-theme-surface));
    padding-bottom: 8px;
  }
}
</style>
