import { create } from 'zustand'
import { supabase, syncEnabled } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  loading: boolean
  init: () => Promise<void>
  sendMagicLink: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    if (!syncEnabled) { set({ loading: false }); return }

    const { data } = await supabase.auth.getSession()
    set({ user: data.session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null })
    })
  },

  sendMagicLink: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
