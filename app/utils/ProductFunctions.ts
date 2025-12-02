import { ref } from 'vue'

const step = ref(1)
const steps = [
  { title: 'Informations', value: 1 },
  { title: 'Statut Halal', value: 2 },
  { title: 'Composition', value: 3 },
  { title: 'Nutrition', value: 4 },
]

const halalStatuses = [
  { value: 'mustahab', label: 'Mustahab', icon: 'mdi-check-decagram', color: 'mustahab' },
  { value: 'halal', label: 'Halal', icon: 'mdi-check-circle', color: 'success' },
  { value: 'mashbuh', label: 'Mashbuh', icon: 'mdi-alert-circle', color: 'warning' },
  { value: 'haram', label: 'Haram', icon: 'mdi-close-circle', color: 'error' },
  { value: 'makruh', label: 'Makruh', icon: 'mdi-alert-decagram', color: 'makruh' }
]

const certificationBodies = [
  'AVS',
  'Halal Monitoring Committee',
  'Taiwan Halal Integrity Development Association',
  'Autre'
]

const form = ref({
  barcode: '',
  name: '',
  brand: '',
  category_id: null,
  portion: {
    amount: null,
    unit: 'g',
    extraInfo: '',
  },
  image_url: '',
  halal_status: 'halal',
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
    calcium_mg: null,
    water_ml: null,
    starch_g: null,
    vitamin_c_mg: null,
    iron_mg: null,
  }
})

type NutritionKey = keyof typeof form.value.nutrition

const nutritionFields: { key: NutritionKey, label: string, icon: string, suffix: string, color?: string, reference?: number }[] = [
  { key: 'calories_kcal', label: 'Calories', icon: 'mdi-fire', suffix: 'kcal', color: 'orange', reference: 2000 },
  { key: 'water_ml', label: 'Water', icon: 'mdi-water', suffix: 'ml', color: 'blue', reference: 100 },
  { key: 'protein_g', label: 'Protéines', icon: 'mdi-food-steak', suffix: 'g', color: 'blue', reference: 50 },
  { key: 'carbs_g', label: 'Glucides', icon: 'mdi-pasta', suffix: 'g', color: 'purple', reference: 260 },
  { key: 'sugars_g', label: 'Sucres', icon: 'mdi-candy', suffix: 'g', color: 'pink', reference: 90 },
  { key: 'fats_g', label: 'Lipides', icon: 'mdi-oil', suffix: 'g', color: 'amber', reference: 70 },
  { key: 'saturated_fats_g', label: 'Graisses saturées', icon: 'mdi-food-drumstick', suffix: 'g', color: 'red', reference: 20 },
  { key: 'fibres_g', label: 'Fibres', icon: 'mdi-barley', suffix: 'g', color: 'green', reference: 25 },
  { key: 'sodium_mg', label: 'Sodium', icon: 'mdi-shaker', suffix: 'mg', color: 'cyan', reference: 2300 },
  { key: 'calcium_mg', label: 'Calcium', icon: 'mdi-egg', suffix: 'mg', color: 'blue-darken-2', reference: 900 },
  { key: 'starch_g', label: 'Amidon', icon: 'mdi-rice', suffix: 'g', color: 'brown' },
  { key: 'vitamin_c_mg', label: 'Vitamine C', icon: 'mdi-pill', suffix: 'mg', color: 'orange' },
  { key: 'iron_mg', label: 'Fer', icon: 'mdi-atom', suffix: 'mg', color: 'red-darken-3' },
]

const additiveFilterStatuses = [
  { value: 'halal', label: 'Halal', color: 'success', icon: 'mdi-check-circle' },
  { value: 'haram', label: 'Haram', color: 'error', icon: 'mdi-close-circle' },
  { value: 'mashbuh', label: 'Mashbuh', color: 'warning', icon: 'mdi-alert-circle' }
]

export { step, steps, halalStatuses, certificationBodies, form, nutritionFields, additiveFilterStatuses }