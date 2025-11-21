const cleanBarcode = (v: string) => (v || '').toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 32)

const barcodeRule = (v: any) => {
  if (!v) return true
  const cleaned = cleanBarcode(v)
  if (/^[0-9]{8}$/.test(cleaned)) return true
  if (/^[0-9]{12}$/.test(cleaned)) return true
  if (/^[0-9]{13}$/.test(cleaned)) return true
  if (/^[0-9]{10}$/.test(cleaned)) return true
  if (/^[A-Z0-9]{8,32}$/.test(cleaned)) return true
  return 'Code-barres invalide'
}

// @ts-ignore
const rules = {
  required: (v: any) => !!v || 'Ce champ est requis',
  barcode: barcodeRule,
}

export { rules }