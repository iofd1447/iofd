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