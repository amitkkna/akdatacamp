import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateProfit(
  receivedAmountWithoutTax: number,
  vendorExpense: number
): number {
  return receivedAmountWithoutTax - vendorExpense
}

export function calculateMargin(
  receivedAmountWithoutTax: number,
  vendorExpense: number
): number {
  if (receivedAmountWithoutTax === 0) return 0
  const profit = calculateProfit(receivedAmountWithoutTax, vendorExpense)
  return (profit / receivedAmountWithoutTax) * 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
