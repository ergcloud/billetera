# Billetera App

App minimalista para gestionar billeteras, alias/CBU y registrar ingresos y gastos.

## Stack
- Vite + React + TypeScript
- Tailwind CSS v4
- Dexie.js (IndexedDB local-first)
- Zustand (estado global)
- React Router v6
- Lucide React (iconos)

## Instalación

```bash
npm install
npm run dev
```

## Estructura

```
src/
├── components/     # Button, Modal, WalletCard, AddWalletModal, AddTransactionModal, Layout
├── pages/          # Dashboard, Wallets, Transactions
├── store/          # Zustand stores (wallets + transactions)
├── db/             # Dexie schema + seed de categorías
├── lib/            # supabase.ts (stub para sync en v2)
├── types/          # Interfaces TypeScript
└── hooks/          # useClipboard
```

## Escalado futuro (v2)

1. `npm install @supabase/supabase-js`
2. Completar `.env`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```
3. Implementar `pushToCloud()` y `pullFromCloud()` en `src/lib/supabase.ts`

## Funciones v1

- ✅ Billeteras con alias y CBU, copia al portapapeles con un tap
- ✅ Registro de ingresos y gastos con categorías
- ✅ Dashboard con balance mensual
- ✅ Filtros por mes y tipo en movimientos
- ✅ 100% local (IndexedDB), sin cuenta, sin internet
- ✅ Diseño mobile-first, funciona como PWA
