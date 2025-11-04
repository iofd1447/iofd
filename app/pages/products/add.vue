<template>
  <v-app-bar elevation="0" class="px-4" color="surface">

    <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />

    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Nouveau produit</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn icon="mdi-help-circle-outline" variant="text" @click="showHelp = true" />

  </v-app-bar>

  <v-main>
    <section class="hero-section">
      <v-container class="py-6" style="max-width: 900px;">
        <div class="text-center mb-6">
          <v-chip color="primary" variant="tonal" size="large" class="mb-4">
            <v-icon start>mdi-plus-circle</v-icon>
            Contribution communautaire
          </v-chip>
          <h1 class="hero-title mb-2">
            Ajouter un produit à la base
          </h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Partagez vos connaissances et aidez la communauté
          </p>
        </div>

        <v-stepper v-model="step" :items="steps" hide-actions flat color="primary" class="elevation-0 mb-6">
        </v-stepper>
      </v-container>
    </section>

    <v-container style="max-width: 900px;" class="py-4">
      <v-alert v-if="!user" type="warning" variant="tonal" rounded="xl" class="mb-4" prominent>
        <template #prepend>
          <v-icon size="32">mdi-alert-circle</v-icon>
        </template>
        <div class="d-flex flex-column flex-md-row align-center justify-space-between">
          <div class="mb-2 mb-md-0">
            <div class="text-h6 font-weight-bold mb-1">Connexion requise</div>
            <div class="text-body-2">
              Vous devez être connecté pour ajouter un produit à la base de données.
            </div>
          </div>
          <div class="d-flex ga-2">
            <v-btn color="primary" variant="flat" prepend-icon="mdi-login" to="/auth/login">
              Se connecter
            </v-btn>
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-account-plus" to="/auth/signup">
              Créer un compte
            </v-btn>
          </div>
        </div>
      </v-alert>
      <v-card v-show="step === 1" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="primary" size="48" class="mr-4">
              <v-icon color="white" size="24">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Informations de base</h2>
              <p class="text-medium-emphasis mb-0">Commençons par les détails essentiels du produit</p>
            </div>
          </div>

          <v-row>

            <v-col cols="12" md="6">
              <v-text-field :model-value="displayBarcode" label="Code-barres (EAN-13)" prepend-inner-icon="mdi-barcode"
                placeholder="301 7620 42200 3" hint="13 chiffres" persistent-hint :rules="[rules.barcode]"
                @input="onBarcodeInput" maxlength="16">
                <template #append-inner>
                  <!-- Bouton Scanner 
                  <v-btn icon="mdi-barcode-scan" variant="text" color="primary" size="small" @click="openScanner" />
                -->
                </template>
              </v-text-field>
            </v-col>


            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="Nom du produit *" prepend-inner-icon="mdi-tag"
                placeholder="Coca-Cola Zero" :rules="[rules.required]" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.brand" label="Marque" prepend-inner-icon="mdi-store"
                placeholder="Coca-Cola" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="form.category_id" :items="categories" item-title="name" item-value="id"
                label="Catégorie *" prepend-inner-icon="mdi-shape" :rules="[rules.required]"
                :loading="loadingCategories" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="form.portion_description" label="Description de la portion"
                prepend-inner-icon="mdi-scale" placeholder="100g, 330ml, 1 pièce..."
                hint="Précisez la taille de référence pour les valeurs nutritionnelles" persistent-hint />
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Photo du produit</div>
              <v-card variant="outlined" class="image-upload" rounded="lg" :class="{ 'has-image': imagePreview }">
                <v-card-text class="pa-6">
                  <div v-if="uploadingImage" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
                    <div class="text-subtitle-1">Upload en cours...</div>
                  </div>
                  <div v-else-if="!imagePreview" class="text-center">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-image-plus</v-icon>
                    <div class="text-h6 mb-2">Ajouter une photo</div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      PNG, JPG jusqu'à 5MB
                    </div>
                    <v-btn color="primary" variant="tonal" prepend-icon="mdi-upload" @click="selectImage">
                      Choisir une image
                    </v-btn>
                    <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageUpload">
                  </div>
                  <div v-else class="position-relative">
                    <v-img :src="imagePreview" height="200" cover rounded="lg" />
                    <v-btn icon="mdi-close" size="small" color="error" class="position-absolute"
                      style="top: 8px; right: 8px;" @click="removeImage" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn size="large" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="nextStep"
            :disabled="!isStep1Valid">
            Continuer
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-show="step === 2" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="success" size="48" class="mr-4">
              <v-icon color="white" size="24">mdi-shield-check</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Statut Halal</h2>
              <p class="text-medium-emphasis mb-0">Informations sur la certification halal</p>
            </div>
          </div>

          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Statut Halal *</div>
              <v-chip-group v-model="form.halal_status" mandatory column>
                <v-chip v-for="status in halalStatuses" :key="status.value" :value="status.value" :color="status.color"
                  size="large" filter variant="outlined" class="px-6">
                  <v-icon start>{{ status.icon }}</v-icon>
                  {{ status.label }}
                </v-chip>
              </v-chip-group>
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="form.certification_body" :items="certificationBodies" label="Organisme certificateur"
                prepend-inner-icon="mdi-certificate" placeholder="AVS, SFCVH..." hint="Laissez vide si non certifié"
                persistent-hint clearable />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.certificate_number" label="Numéro de certificat"
                prepend-inner-icon="mdi-numeric" placeholder="CERT-2024-12345" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.certified_date" label="Date de certification"
                prepend-inner-icon="mdi-calendar" type="date" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.expiry_date" label="Date d'expiration" prepend-inner-icon="mdi-calendar-end"
                type="date" />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="form.halal_notes" label="Notes additionnelles" prepend-inner-icon="mdi-note-text"
                placeholder="Informations complémentaires sur la certification..." rows="3" auto-grow />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn size="large" variant="text" prepend-icon="mdi-arrow-left" @click="prevStep">
            Retour
          </v-btn>
          <v-spacer />
          <v-btn size="large" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="nextStep">
            Continuer
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-show="step === 3" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="secondary" size="48" class="mr-4">
              <v-icon color="white" size="24">mdi-flask</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Ingrédients & Additifs</h2>
              <p class="text-medium-emphasis mb-0">Composition détaillée du produit</p>
            </div>
          </div>

          <v-row>
            <v-col cols="12">
              <v-combobox v-model="selectedIngredients" :items="ingredients" item-title="name" item-value="id"
                label="Ingrédients" prepend-inner-icon="mdi-leaf" placeholder="Eau, sucre, arômes..." multiple chips
                closable-chips hint="Appuyez sur Entrée pour ajouter. Dans l'ordre de la liste" persistent-hint
                :loading="loadingIngredients">
                <template #chip="{ item, props }">
                  <v-chip v-bind="props" :color="getIngredientColor(item.raw)">
                    {{ typeof item.raw === 'string' ? item.raw : item.raw.name }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>

            <v-col cols="12">
              <v-combobox v-model="selectedAdditives" :items="additives" item-title="display" item-value="id"
                label="Additifs" prepend-inner-icon="mdi-flask-outline" placeholder="E330, E471..." multiple chips
                closable-chips hint="Codes E ou noms des additifs" persistent-hint :loading="loadingAdditives">
                <template #chip="{ item, props }">
                  <v-chip v-bind="props" :color="getAdditiveColor(item.raw)">
                    {{ typeof item.raw === 'string' ? item.raw : item.raw.code }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Allergènes</div>
              <v-chip-group v-model="selectedAllergens" multiple column>
                <v-chip v-for="allergen in allergensList" :key="allergen.id" :value="allergen.id" filter
                  variant="outlined" color="warning">
                  {{ allergen.name }}
                </v-chip>
              </v-chip-group>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Labels & Certifications</div>
              <v-chip-group v-model="selectedLabels" multiple column>
                <v-chip v-for="label in labelsList" :key="label.id" :value="label.id" filter variant="outlined"
                  color="tertiary">
                  {{ label.name }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn size="large" variant="text" prepend-icon="mdi-arrow-left" @click="prevStep">
            Retour
          </v-btn>
          <v-spacer />
          <v-btn size="large" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="nextStep">
            Continuer
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-show="step === 4" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="tertiary" size="48" class="mr-4">
              <v-icon color="white" size="24">mdi-nutrition</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Valeurs nutritionnelles</h2>
              <p class="text-medium-emphasis mb-0">Pour {{ form.portion_description || '100g' }}</p>
            </div>
          </div>

          <v-row>
            <v-col v-for="field in nutritionFields" :key="field.key" cols="12" sm="6" md="4">
              <v-text-field v-model.number="form.nutrition[field.key]" :label="`${field.label} ${field.suffix}`"
                type="text" :prepend-inner-icon="field.icon" :suffix="field.suffix" />
            </v-col>
          </v-row>

        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn size="large" variant="text" prepend-icon="mdi-arrow-left" @click="prevStep">
            Retour
          </v-btn>
          <v-spacer />
          <v-btn size="large" color="success" variant="flat" @click="submitProduct" :loading="loading">
            Publier le produit
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-container>
  </v-main>

  <v-dialog v-model="successDialog" max-width="500">
    <v-card rounded="xl">
      <v-card-text class="pa-8 text-center">
        <v-avatar color="success" size="80" class="mb-4">
          <v-icon size="48" color="white">mdi-check-circle</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-3">Produit ajouté !</h2>
        <p class="text-medium-emphasis mb-6">
          Merci pour votre contribution. Le produit a été ajouté avec succès.
        </p>
        <v-btn color="primary" variant="flat" block size="large" @click="goToProduct">
          Voir le produit
        </v-btn>
        <v-btn variant="text" block class="mt-2" @click="addAnother">
          Ajouter un autre produit
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="errorSnackbar" color="error" :timeout="5000">
    {{ errorMessage }}
    <template #actions>
      <v-btn variant="text" @click="errorSnackbar = false">Fermer</v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="showHelp" max-width="600">
    <v-card rounded="xl">
      <v-card-title class="pa-6 d-flex align-center">
        <v-icon class="mr-3" color="primary">mdi-help-circle</v-icon>
        <span class="text-h6">Aide</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="showHelp = false" />
      </v-card-title>
      <v-card-text class="pa-6 pt-0">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="Comment trouver le code-barres ?">
            <v-expansion-panel-text>
              Le code-barres (EAN-13) est généralement situé au dos du produit. Il se compose de 13 chiffres.
              Vous pouvez le scanner avec votre appareil photo ou le saisir manuellement.
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel title="Qu'est-ce qu'un additif ?">
            <v-expansion-panel-text>
              Les additifs sont des substances ajoutées aux aliments (colorants, conservateurs, etc.).
              Ils sont identifiés par un code E suivi de chiffres (ex: E471, E330).
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel title="Comment vérifier le statut halal ?">
            <v-expansion-panel-text>
              Vérifiez si le produit possède une certification halal reconnue (AVS, SFCVH, etc.).
              En cas de doute, marquez-le comme "Douteux" et ajoutez des notes explicatives.
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>

</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { computed, onMounted, ref } from 'vue'

useHead({
  title: 'IOFD - Add a product to the database'
})

const supabase = useSupabase()
const { user, fetchUser, logContribution } = useSupabaseAuth()

const step = ref(1)
const steps = [
  { title: 'Informations', value: 1 },
  { title: 'Statut Halal', value: 2 },
  { title: 'Composition', value: 3 },
  { title: 'Nutrition', value: 4 },
]

const form = ref({
  barcode: '',
  name: '',
  brand: '',
  category_id: null,
  portion_description: '',
  image_url: '',
  halal_status: 'non_verifie',
  certification_body: '',
  certificate_number: '',
  certified_date: '',
  expiry_date: '',
  halal_notes: '',
  nutrition: {
    calories_kcal: null,
    protein_g: null,
    carbs_g: null,
    sugars_g: null,
    fats_g: null,
    saturated_fats_g: null,
    trans_fats_g: null,
    fibres_g: null,
    sodium_mg: null,
    cholesterol_mg: null,
    water_ml: null,
  }
})

type NutritionKey = keyof typeof form.value.nutrition

const nutritionFields: { key: NutritionKey, label: string, icon: string, suffix: string }[] = [
  { key: 'calories_kcal', label: 'Calories', icon: 'mdi-fire', suffix: 'kcal' },
  { key: 'protein_g', label: 'Protéines', icon: 'mdi-egg', suffix: 'g' },
  { key: 'carbs_g', label: 'Glucides', icon: 'mdi-pasta', suffix: 'g' },
  { key: 'sugars_g', label: 'Sucres', icon: 'mdi-candy', suffix: 'g' },
  { key: 'fats_g', label: 'Lipides', icon: 'mdi-oil', suffix: 'g' },
  { key: 'saturated_fats_g', label: 'Graisses saturées', icon: 'mdi-food-drumstick', suffix: 'g' },
  { key: 'fibres_g', label: 'Fibres', icon: 'mdi-barley', suffix: 'g' },
  { key: 'sodium_mg', label: 'Sodium', icon: 'mdi-shaker', suffix: 'mg' },
  { key: 'cholesterol_mg', label: 'Cholestérol', icon: 'mdi-heart-pulse', suffix: 'mg' },
]

const loading = ref(false)
const successDialog = ref(false)
const showHelp = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')
const imagePreview = ref('')
const imageFile = ref<File | null>(null)
const uploadingImage = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const createdProductId = ref('')
const displayBarcode = ref('')

const loadingCategories = ref(false)
const loadingIngredients = ref(false)
const loadingAdditives = ref(false)

const categories = ref<any[]>([])
const ingredients = ref<any[]>([])
const additives = ref<any[]>([])
const allergensList = ref<any[]>([])
const labelsList = ref<any[]>([])

const selectedIngredients = ref<any[]>([])
const selectedAdditives = ref<any[]>([])
const selectedAllergens = ref<string[]>([])
const selectedLabels = ref<string[]>([])

const rules = {
  required: (v: any) => !!v || 'Ce champ est requis',
  barcode: (v: any) => !v || cleanDigits(v).length === 13 || 'Le code-barres doit contenir 13 chiffres',
}

const cleanDigits = (v: string) => (v || '').replace(/\D/g, '').slice(0, 13)

const formatBarcode = (value: string) => {
  const d = cleanDigits(value)
  if (!d) return ''
  if (d.length <= 3) return d
  if (d.length <= 7) return d.replace(/^(\d{3})(\d+)/, '$1 $2')
  if (d.length <= 12) return d.replace(/^(\d{3})(\d{4})(\d+)/, '$1 $2 $3')
  return d.replace(/^(\d{3})(\d{4})(\d{5})(\d{1})/, '$1 $2 $3 $4')
}

const onBarcodeInput = (e: any) => {
  const value = e.target.value
  const cleaned = cleanDigits(value)
  form.value.barcode = cleaned
  displayBarcode.value = formatBarcode(cleaned)
}

watch(() => form.value.barcode, val => {
  displayBarcode.value = formatBarcode(val || '')
})

const selectedCategory = computed(() => {
  return categories.value.find(c => c.id === form.value.category_id) || null
})

const halalStatuses = [
  { value: 'halal', label: 'Halal', icon: 'mdi-check-circle', color: 'success' },
  { value: 'haram', label: 'Haraml', icon: 'mdi-check-circle', color: 'error' },
  { value: 'mashbuh', label: 'Mashbuh', icon: 'mdi-check-circle', color: 'warning' },
  { value: 'non_verifie', label: 'Non vérifié', icon: 'mdi-help-circle', color: 'grey' },
]

const certificationBodies = [
  'AVS',
  'Halal Monitoring Committee',
  'Taiwan Halal Integrity Development Association',
  'Autre'
]

const isStep1Valid = computed(() => {
  return form.value.name && form.value.category_id
})

const nextStep = () => {
  if (step.value < 4) {
    step.value++
  }
}

const prevStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const goBack = () => {
  navigateTo('/products')
}

const selectImage = () => {
  fileInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'L\'image ne doit pas dépasser 5MB'
      errorSnackbar.value = true
      return
    }

    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imagePreview.value = ''
  imageFile.value = null
  form.value.image_url = ''
}

async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('Upload failed', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath)
  return publicUrl
}

const getHalalStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    mashbuh: 'warning',
    non_verifie: 'grey',
  }
  return colors[status] || 'grey'
}

const getHalalStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    mashbuh: 'Mashbuh',
    non_verifie: 'Non vérifié',
  }
  return labels[status] || 'Non vérifié'
}

const getIngredientColor = (ingredient: any) => {
  if (typeof ingredient === 'object' && ingredient.halal_status) {
    const colors: Record<string, string> = {
      halal: 'success',
      variable: 'info',
    }
    return colors[ingredient.halal_status] || 'primary'
  }
  return 'primary'
}

const getAdditiveColor = (additive: any) => {
  if (typeof additive === 'object' && additive.halal_status) {
    const colors: Record<string, string> = {
      halal: 'success',
      variable: 'info',
    }
    return colors[additive.halal_status] || 'secondary'
  }
  return 'secondary'
}


const submitProduct = async () => {
  loading.value = true
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      loading.value = false
      return
    }

    let imageUrl = form.value.image_url
    if (imageFile.value) {
      const uploadedUrl = await uploadImage(imageFile.value)
      if (uploadedUrl) imageUrl = uploadedUrl
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .upsert([{
        barcode: form.value.barcode || null,
        name: form.value.name,
        brand: form.value.brand || null,
        category_id: form.value.category_id,
        portion_description: form.value.portion_description || null,
        image_url: imageUrl,
      }], { onConflict: 'barcode', ignoreDuplicates: false })
      .select()
      .single()

    if (productError) throw productError
    if (!product) throw new Error('Le produit existe déjà ou création impossible')

    const productId = product.id
    createdProductId.value = productId

    const isUpdate = product.updated_at !== product.created_at

    const { error: halalError } = await supabase
      .from('halal_certifications')
      .upsert([{
        product_id: productId,
        halal_status: form.value.halal_status,
        certification_body: form.value.certification_body || null,
        certificate_number: form.value.certificate_number || null,
        certified_date: form.value.certified_date || null,
        expiry_date: form.value.expiry_date || null,
        notes: form.value.halal_notes || null,
      }], { onConflict: 'product_id', ignoreDuplicates: true })
    if (halalError) throw halalError

    const hasNutritionData = Object.values(form.value.nutrition).some(v => v !== null && v !== undefined && v !== '')
    if (hasNutritionData) {
      const { error: nutritionError } = await supabase
        .from('nutrition_facts')
        .upsert([{ product_id: productId, ...form.value.nutrition }], { onConflict: 'product_id', ignoreDuplicates: true })
      if (nutritionError) throw nutritionError
    }

    const ingredientMappings = []
    for (let i = 0; i < selectedIngredients.value.length; i++) {
      const ingredient = selectedIngredients.value[i]
      let ingredientId: string
      if (typeof ingredient === 'string') {
        const { data: existing } = await supabase.from('ingredients').select('id').eq('name', ingredient).single()
        if (existing) ingredientId = existing.id
        else {
          const { data: newIngredient, error } = await supabase.from('ingredients').insert([{ name: ingredient }]).select().single()
          if (error) continue
          ingredientId = newIngredient.id
        }
      } else ingredientId = ingredient.id
      ingredientMappings.push({ product_id: productId, ingredient_id: ingredientId, position: i + 1 })
    }
    if (ingredientMappings.length)
      await supabase.from('product_ingredients').upsert(ingredientMappings, { ignoreDuplicates: true })

    const additiveMappings = []
    for (const additive of selectedAdditives.value) {
      let additiveId: string
      if (typeof additive === 'string') {
        const code = additive.toUpperCase()
        const { data: existingAdditive } = await supabase.from('additives').select('id').eq('code', code).single()
        if (existingAdditive) additiveId = existingAdditive.id
        else {
          const { data: newAdditive, error } = await supabase.from('additives').insert([{ code, name: code }]).select().single()
          if (error) continue
          additiveId = newAdditive.id
        }
      } else additiveId = additive.id
      additiveMappings.push({ product_id: productId, additive_id: additiveId })
    }
    if (additiveMappings.length)
      await supabase.from('product_additives').upsert(additiveMappings, { ignoreDuplicates: true })

    if (selectedAllergens.value.length > 0) {
      const allergenMappings = selectedAllergens.value.map(id => ({
        product_id: productId,
        allergen_id: id,
        presence_type: 'contient'
      }))
      await supabase.from('product_allergens').upsert(allergenMappings, { ignoreDuplicates: true })
    }

    if (selectedLabels.value.length > 0) {
      const labelMappings = selectedLabels.value.map(id => ({ product_id: productId, label_id: id }))
      await supabase.from('product_labels').upsert(labelMappings, { ignoreDuplicates: true })
    }

    if (currentUser) {
      await logContribution(product.id, currentUser.id, isUpdate ? 'update' : 'create', { ...form.value })
    }

    successDialog.value = true
  } catch (error: any) {
    console.error('Error submitting product:', error)
    errorMessage.value = error.message || 'Erreur lors de la création du produit'
    errorSnackbar.value = true
  } finally {
    loading.value = false
  }
}


const goToProduct = () => {
  navigateTo(`/products/${createdProductId.value}`)
}

const addAnother = () => {
  successDialog.value = false
  resetForm()
  step.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetForm = () => {
  form.value = {
    barcode: '',
    name: '',
    brand: '',
    category_id: null,
    portion_description: '',
    image_url: '',
    halal_status: 'non_verifie',
    certification_body: '',
    certificate_number: '',
    certified_date: '',
    expiry_date: '',
    halal_notes: '',
    nutrition: {
      calories_kcal: null,
      protein_g: null,
      carbs_g: null,
      sugars_g: null,
      fats_g: null,
      saturated_fats_g: null,
      trans_fats_g: null,
      fibres_g: null,
      sodium_mg: null,
      cholesterol_mg: null,
      water_ml: null,
    }
  }
  imagePreview.value = ''
  imageFile.value = null
  selectedIngredients.value = []
  selectedAdditives.value = []
  selectedAllergens.value = []
  selectedLabels.value = []
}

// Load data from Supabase on mount
const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) throw error
    console.log(data)
    categories.value = data || []
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    loadingCategories.value = false
  }
}

const loadIngredients = async () => {
  loadingIngredients.value = true
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, halal_status')
      .order('name')
      .limit(100)

    if (error) throw error
    ingredients.value = data || []
  } catch (error) {
    console.error('Error loading ingredients:', error)
  } finally {
    loadingIngredients.value = false
  }
}

const loadAdditives = async () => {
  loadingAdditives.value = true
  try {
    const { data, error } = await supabase
      .from('additives')
      .select('id, code, name, halal_status')
      .order('code')

    if (error) throw error
    additives.value = (data || []).map(a => ({
      ...a,
      display: `${a.code} - ${a.name}`
    }))
  } catch (error) {
    console.error('Error loading additives:', error)
  } finally {
    loadingAdditives.value = false
  }
}

const loadAllergens = async () => {
  try {
    const { data, error } = await supabase
      .from('allergens')
      .select('id, name')
      .order('name')

    if (error) throw error
    allergensList.value = data || []
  } catch (error) {
    console.error('Error loading allergens:', error)
  }
}

const loadLabels = async () => {
  try {
    const { data, error } = await supabase
      .from('labels')
      .select('id, name')
      .order('name')

    if (error) throw error
    labelsList.value = data || []
  } catch (error) {
    console.error('Error loading labels:', error)
  }
}

const handleBarcodeDetected = async (barcode: string) => {
  form.value.barcode = barcode
  displayBarcode.value = formatBarcode(barcode)

  await searchProductInfo(barcode)
}

const searchProductInfo = async (barcode: string) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
    const data = await response.json()

    if (data.status === 1 && data.product) {
      const product = data.product

      if (product.product_name && !form.value.name) {
        form.value.name = product.product_name
      }

      if (product.brands && !form.value.brand) {
        form.value.brand = product.brands.split(',')[0].trim()
      }

      if (product.image_url && !imagePreview.value) {
        imagePreview.value = product.image_url
        form.value.image_url = product.image_url
      }

      // Ingrédients
      if (product.ingredients_text) {
        // Parser les ingrédients (simplification)
        const ingredientNames = product.ingredients_text
          .split(',')
          .map((i: string) => i.trim())
          .filter(Boolean)
          .slice(0, 10) // Limiter à 10

        selectedIngredients.value = ingredientNames
      }

      // Notification de succès
      errorMessage.value = `Produit trouvé ! Informations pré-remplies depuis Open Food Facts.`
      errorSnackbar.value = true
    } else {
      // Produit non trouvé dans Open Food Facts
      errorMessage.value = `Code-barres scanné : ${barcode}. Produit non trouvé dans Open Food Facts, veuillez remplir manuellement.`
      errorSnackbar.value = true
    }
  } catch (error) {
    console.error('Erreur lors de la recherche du produit:', error)
  }
}

onMounted(async () => {
  await fetchUser()
  await Promise.all([
    loadCategories(),
    loadIngredients(),
    loadAdditives(),
    loadAllergens(),
    loadLabels(),
  ])
})
</script>

<style scoped>
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

.barcode-scanner {
  animation: fadeIn 0.4s ease-out;
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

/* Sticky preview on desktop */
@media (min-width: 1280px) {
  .preview-card {
    position: fixed;
    top: 100px;
    right: 40px;
    width: 300px;
    z-index: 5;
  }
}

/* Animation for step transitions */
.v-card {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Improve chip group spacing */
.v-chip-group .v-chip {
  margin: 4px;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

/* Improve focus states */
.v-text-field:focus-within,
.v-select:focus-within,
.v-combobox:focus-within,
.v-textarea:focus-within {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Responsive padding adjustments */
@media (max-width: 600px) {
  .v-card-text {
    padding: 16px !important;
  }

  .v-card-actions {
    padding: 16px !important;
  }
}

/* Improve stepper visual */
.v-stepper {
  box-shadow: none !important;
  background: transparent !important;
}

/* Smooth color transitions for chips */
.v-chip {
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Better avatar styling */
.v-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Improve dialog entrance */
.v-dialog {
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Loading state improvements */
.v-btn--loading {
  pointer-events: none;
}

/* Better spacing for list items */
.v-list-item {
  margin-bottom: 8px;
}

/* Improve expansion panel */
.v-expansion-panel {
  margin-bottom: 8px;
}

.v-expansion-panel-title {
  font-weight: 500;
}

/* Success dialog special styling */
.v-dialog .v-avatar {
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Mobile optimization */
@media (max-width: 960px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}

/* Print optimization */
@media print {
  .v-app-bar,
  .v-btn,
  .preview-card {
    display: none !important;
  }
}

/* Accessibility improvements */
.v-btn:focus-visible,
.v-chip:focus-visible,
.v-text-field:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.5);
  outline-offset: 2px;
}

/* Dark mode specific adjustments */
.v-theme--dark .image-upload {
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.v-theme--dark .image-upload:hover {
  border-color: rgba(var(--v-theme-primary), 0.7);
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Enhanced card styling */
.card-enhanced {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
}

.card-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.2);
}

/* Hero section styling */
.hero-section {
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(38, 198, 218, 0.08) 100%);
  border-radius: 0 0 40px 40px;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Enhanced avatar glow */
.card-enhanced .v-avatar {
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

/* Improve stepper visual */
.v-stepper {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px;
  overflow: hidden;
}

/* Better button styling */
.card-enhanced .v-btn--variant-flat {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-enhanced .v-btn--variant-flat:hover {
  box-shadow: 0 6px 24px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

/* Enhanced chip styling */
.card-enhanced .v-chip {
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-enhanced .v-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Improved input focus states */
.card-enhanced .v-text-field:focus-within,
.card-enhanced .v-select:focus-within,
.card-enhanced .v-combobox:focus-within,
.card-enhanced .v-textarea:focus-within {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Better image upload area */
.card-enhanced .image-upload {
  transition: all 0.3s ease;
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  background: rgba(var(--v-theme-primary), 0.02);
}

.card-enhanced .image-upload:hover {
  border-color: rgba(var(--v-theme-primary), 0.7);
  background: rgba(var(--v-theme-primary), 0.05);
  transform: scale(1.01);
}

/* Smooth section transitions */
.v-card {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced card header */
.card-enhanced .v-avatar+div h2 {
  position: relative;
}

.card-enhanced .v-avatar+div h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 2px;
}

/* Better spacing for card content */
.card-enhanced .v-card-text {
  padding: 2rem !important;
}

@media (max-width: 600px) {
  .card-enhanced .v-card-text {
    padding: 1.5rem !important;
  }

  .hero-title {
    font-size: 1.5rem;
  }
}
</style>