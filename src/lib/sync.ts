import { supabase, syncEnabled } from '../lib/supabase'
import { db } from '../db'
import type { Wallet, Transaction } from '../types'

// ── WALLETS ──────────────────────────────────────────────

export async function pushWallet(wallet: Wallet, userId: string) {
  if (!syncEnabled) return
  const { id, ...rest } = wallet
  await supabase.from('wallets').upsert({
    id: String(id),
    user_id: userId,
    ...rest,
    created_at: rest.createdAt,
  })
}

export async function deleteWalletRemote(localId: number) {
  if (!syncEnabled) return
  await supabase.from('wallets').delete().eq('id', String(localId))
}

// ── TRANSACTIONS ─────────────────────────────────────────

export async function pushTransaction(tx: Transaction, userId: string) {
  if (!syncEnabled) return
  const { id, walletId, ...rest } = tx
  await supabase.from('transactions').upsert({
    id: String(id),
    user_id: userId,
    wallet_id: String(walletId),
    ...rest,
  })
}

export async function deleteTransactionRemote(localId: number) {
  if (!syncEnabled) return
  await supabase.from('transactions').delete().eq('id', String(localId))
}

// ── FULL PULL (on login) ──────────────────────────────────

export async function pullFromCloud(userId: string) {
  if (!syncEnabled) return

  // Pull wallets
  const { data: remoteWallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)

  if (remoteWallets && remoteWallets.length > 0) {
    const local: Wallet[] = remoteWallets.map((w: Record<string, unknown>) => ({
      id: Number(w.id),
      name: w.name as string,
      alias: w.alias as string,
      cbu: w.cbu as string,
      bank: w.bank as string,
      color: w.color as Wallet['color'],
      createdAt: new Date(w.created_at as string),
    }))
    await db.wallets.bulkPut(local)
  }

  // Pull transactions
  const { data: remoteTx } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)

  if (remoteTx && remoteTx.length > 0) {
    const local: Transaction[] = remoteTx.map((t: Record<string, unknown>) => ({
      id: Number(t.id),
      walletId: Number(t.wallet_id),
      type: t.type as Transaction['type'],
      amount: Number(t.amount),
      category: t.category as string,
      note: (t.note as string) ?? '',
      date: new Date(t.date as string),
    }))
    await db.transactions.bulkPut(local)
  }
}
