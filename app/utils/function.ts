// @ts-ignore
import moment from 'moment-hijri'
import 'moment/locale/fr'

const formatHijriDate = (date: string): string => {
  if (!date) return 'Date inconnue'

  const d = moment(date)
  if (!d.isValid()) return 'Date invalide'

  return d.locale('fr').format('iD iMMMM iYYYY [à] HH:mm')
}

const getHalalColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    mashbuh: 'warning'
  }
  return colors[status] || 'grey'
}

const getHalalLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    mashbuh: 'Douteux'
  }
  return labels[status] || 'Non vérifié'
}

const getHalalIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    mashbuh: 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getIngredientColor = (status: string) => {
  return getHalalColor(status)
}

const getAllergenType = (presence: string): 'success' | 'warning' | 'error' | 'info' => {
  const types: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    contient: 'error',
    traces: 'warning',
    peut_contenir: 'info'
  }
  return types[presence] || 'info'
}

const getAllergenText = (presence: string) => {
  const texts: Record<string, string> = {
    contient: 'Contient cet allergène',
    traces: 'Peut contenir des traces',
    peut_contenir: 'Peut contenir'
  }
  return texts[presence] || ''
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Fruits': 'mdi-fruit-cherries',
    'Légumes': 'mdi-carrot',
    'Viandes': 'mdi-food-steak',
    'Poissons et fruits de mer': 'mdi-fish',
    'Œufs': 'mdi-egg',
    'Produits laitiers': 'mdi-cow',
    'Céréales et dérivés': 'mdi-grain',
    'Légumineuses': 'mdi-peanut',
    'Tubercules': 'mdi-potato',
    'Matières grasses': 'mdi-oil',
    'Produits sucrés': 'mdi-candy',
    'Desserts': 'mdi-cupcake',
    'Boissons': 'mdi-bottle-soda',
    'Plats préparés': 'mdi-food',
    'Conserves': 'mdi-food-can',
    'Sauces et condiments': 'mdi-silverware-fork-knife',
    'Produits végétariens': 'mdi-leaf',
    'Produits véganes': 'mdi-seed',
    'Snacks': 'mdi-food-apple',
    'Compléments alimentaires': 'mdi-pill',
  }
  return icons[category] || 'mdi-tag'
}

export { formatHijriDate, getHalalColor, getHalalLabel, getHalalIcon, getIngredientColor, getAllergenType, getAllergenText, getCategoryIcon }