import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatEuro(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '€0';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0,0%';
  return new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(value / 100)
}

export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('nl-NL').format(Math.round(value))
}
