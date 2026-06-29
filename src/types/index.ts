export type WalletColor = 'slate' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky'

export interface Wallet {
  id?: number
  name: string
  alias: string
  cbu: string
  bank: string
  color: WalletColor
  createdAt: Date
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id?: number
  walletId: number
  type: TransactionType
  amount: number
  category: string
  note: string
  date: Date
}

export interface Category {
  id?: number
  type: TransactionType
  name: string
  icon: string
  color: string
  isDefault: boolean
}
