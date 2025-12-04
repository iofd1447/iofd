const getHalalColor = (status: string) => {
  const colors: Record<string, string> = {
    mustahab: 'mustahab',
    halal: 'success',
    haram: 'error',
    mashbuh: 'warning',
    makruh: 'makruh'
  }
  return colors[status] || 'grey'
}

const getHalalLabel = (status: string) => {
  const labels: Record<string, string> = {
    mustahab: 'Mustahab',
    halal: 'Halal',
    haram: 'Haram',
    mashbuh: 'Mashbuh',
    makruh: 'Makruh'
  }
  return labels[status] || 'Non vérifié'
}

const getHalalIcon = (status: string) => {
  const icons: Record<string, string> = {
    mustahab: 'mdi-check-decagram',
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    mashbuh: 'mdi-alert-circle',
    makruh: 'mdi-alert-decagram'
  }
  return icons[status] || 'mdi-help-circle'
}

const getIngredientColor = (status: string) => {
  return getHalalColor(status)
}

export { getHalalColor, getHalalLabel, getHalalIcon, getIngredientColor }