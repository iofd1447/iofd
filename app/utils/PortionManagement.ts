export type Unit = 'g' | 'ml' | 'oz' | 'lb' | 'cup' | 'cac' | 'cas';

export const UNITS: { label: string; value: Unit }[] = [
  { label: 'Grammes (g)', value: 'g' },
  { label: 'Millilitres (ml)', value: 'ml' },
  { label: 'Once (oz)', value: 'oz' },
  { label: 'Livre (lb)', value: 'lb' },
  { label: 'Tasse (cup)', value: 'cup' },
  { label: 'Cuillère à café (CaC)', value: 'cac' },
  { label: 'Cuillère à soupe (CaS)', value: 'cas' },
];

export const getPortionDescription = (portion: { amount: number | null; unit: Unit; extraInfo: string }) => {
  const { amount, unit, extraInfo } = portion;
  if (!amount) return extraInfo || '';
  return `${amount} ${unit}${extraInfo ? ` (${extraInfo})` : ''}`;
}

export function parsePortionDescription(desc: any) {
  const text = (desc ?? '').toString().trim()

  if (!text) {
    return { amount: 100, unit: 'g', extraInfo: '' }
  }

  const fullMatch = text.match(/^([\d.,]+)\s*(\w+)\s*\((.*?)\)$/)
  if (fullMatch) {
    const amount = parseFloat((fullMatch[1] || '0').replace(',', '.'))
    const unit = (fullMatch[2] || '').toLowerCase()
    return {
      amount: isFinite(amount) && amount > 0 ? amount : 100,
      unit,
      extraInfo: fullMatch[3] || ''
    }
  }

  const simpleMatch = text.match(/^([\d.,]+)\s*(\w+)?$/)
  if (simpleMatch) {
    const amount = parseFloat((simpleMatch[1] || '0').replace(',', '.'))
    const unit = (simpleMatch[2] || '').toLowerCase()
    return {
      amount: isFinite(amount) && amount > 0 ? amount : 100,
      unit,
      extraInfo: ''
    }
  }

  return { amount: 100, unit: 'g', extraInfo: '' }
}

