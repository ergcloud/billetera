import { create } from 'zustand'
import { db } from '../db'
import { pushWallet, deleteWalletRemote, pushTransaction, deleteTransactionRemote } from '../lib/sync'
import { useAuthStore } from './auth'
import type { Wallet, Transaction } from '../types'

const getUserId = () => useAuthStore.getState().user?.id ?? null

interface WalletStore {
  wallets: Wallet[]
  loading: boolean
  fetchWallets: () => Promise<void>
  addWallet: (w: Omit<Wallet, 'id' | 'createdAt'>) => Promise<void>
  updateWallet: (id: number, w: Partial<Wallet>) => Promise<void>
  deleteWallet: (id: number) => Promise<void>
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: [],
  loading: false,
  fetchWallets: async () => {
    set({ loading: true })
    const wallets = await db.wallets.orderBy('createdAt').toArray()
    set({ wallets, loading: false })
  },
  addWallet: async (w) => {
    const id = await db.wallets.add({ ...w, createdAt: new Date() } as Wallet)
    const saved = await db.wallets.get(id)
    if (saved) {
      const userId = getUserId()
      if (userId) pushWallet(saved, userId).catch(console.error)
    }
    const wallets = await db.wallets.orderBy('createdAt').toArray()
    set({ wallets })
  },
  updateWallet: async (id, w) => {
    await db.wallets.update(id, w)
    const saved = await db.wallets.get(id)
    if (saved) {
      const userId = getUserId()
      if (userId) pushWallet(saved, userId).catch(console.error)
    }
    const wallets = await db.wallets.orderBy('createdAt').toArray()
    set({ wallets })
  },
  deleteWallet: async (id) => {
    await db.wallets.delete(id)
    await db.transactions.where('walletId').equals(id).delete()
    deleteWalletRemote(id).catch(console.error)
    const wallets = await db.wallets.orderBy('createdAt').toArray()
    set({ wallets })
  },
}))

interface TransactionStore {
  transactions: Transaction[]
  loading: boolean
  fetchTransactions: () => Promise<void>
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  loading: false,
  fetchTransactions: async () => {
    set({ loading: true })
    const transactions = await db.transactions.orderBy('date').reverse().toArray()
    set({ transactions, loading: false })
  },
  addTransaction: async (t) => {
    const id = await db.transactions.add(t)
    const saved = await db.transactions.get(id)
    if (saved) {
      const userId = getUserId()
      if (userId) pushTransaction(saved, userId).catch(console.error)
    }
    const transactions = await db.transactions.orderBy('date').reverse().toArray()
    set({ transactions })
  },
  deleteTransaction: async (id) => {
    await db.transactions.delete(id)
    deleteTransactionRemote(id).catch(console.error)
    const transactions = await db.transactions.orderBy('date').reverse().toArray()
    set({ transactions })
  },
}))
