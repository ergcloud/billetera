import Dexie, { type EntityTable } from 'dexie'
import type { Wallet, Transaction, Category } from '../types'

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Income
  { type: 'income', name: 'Sueldo', icon: '💼', color: '#10b981', isDefault: true },
  { type: 'income', name: 'Freelance', icon: '💻', color: '#6366f1', isDefault: true },
  { type: 'income', name: 'Inversión', icon: '📈', color: '#f59e0b', isDefault: true },
  { type: 'income', name: 'Venta', icon: '🏷️', color: '#14b8a6', isDefault: true },
  { type: 'income', name: 'Regalo', icon: '🎁', color: '#ec4899', isDefault: true },
  { type: 'income', name: 'Otro ingreso', icon: '➕', color: '#8b5cf6', isDefault: true },
  // Expense
  { type: 'expense', name: 'Comida', icon: '🛒', color: '#f97316', isDefault: true },
  { type: 'expense', name: 'Transporte', icon: '🚌', color: '#3b82f6', isDefault: true },
  { type: 'expense', name: 'Servicios', icon: '💡', color: '#eab308', isDefault: true },
  { type: 'expense', name: 'Salud', icon: '🏥', color: '#ef4444', isDefault: true },
  { type: 'expense', name: 'Entretenimiento', icon: '🎬', color: '#a855f7', isDefault: true },
  { type: 'expense', name: 'Ropa', icon: '👕', color: '#06b6d4', isDefault: true },
  { type: 'expense', name: 'Educación', icon: '📚', color: '#84cc16', isDefault: true },
  { type: 'expense', name: 'Otro gasto', icon: '➖', color: '#6b7280', isDefault: true },
]

class BilleteraDB extends Dexie {
  wallets!: EntityTable<Wallet, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>

  constructor() {
    super('BilleteraDB')
    this.version(1).stores({
      wallets: '++id, name, alias, cbu, bank, color, createdAt',
      transactions: '++id, walletId, type, amount, category, note, date',
      categories: '++id, type, name, icon, color, isDefault',
    })
  }
}

export const db = new BilleteraDB()

export async function seedCategories() {
  const count = await db.categories.count()
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES as Category[])
  }
}
