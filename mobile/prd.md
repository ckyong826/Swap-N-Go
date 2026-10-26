# Product Requirements Document (PRD)

## Swap N Go — React Native Mobile App (Expo)

**Version:** 1.1 (updated to match real backend)
**Author:** Chuah Kee Yong
**Date:** April 2026
**Project Type:** Claude Code Project
**Target Platform:** iOS & Android (Expo Go / Expo EAS Build)

---

## 1. Project Overview

### 1.1 Purpose

Swap N Go is a blockchain-based mobile e-wallet application for Malaysia. It enables fast, low-cost domestic and cross-border payments via the SUI blockchain, using a Malaysia Ringgit-pegged stablecoin (MYRC). This PRD describes the **React Native (Expo) frontend** that connects to the existing Swap N Go Go-language backend.

### 1.2 Problem Statement

Traditional cross-border payments (SWIFT) in Malaysia cost an average of 6.3% in fees and take 1–5 business days. Even modern e-wallets like Touch 'n Go still rely on the same banking infrastructure. Swap N Go solves this using the SUI blockchain to settle transactions in seconds at a fraction of a cent.

### 1.3 Backend Architecture (Important for Frontend Design)

The backend is **async by design**. All financial operations (swap, transfer, deposit, withdraw) go through this flow:

```
POST /initiate  →  backend creates a pending record + emits Kafka event
                →  Kafka worker processes on-chain async (SUI blockchain)
                →  FSM updates status: pending → processing → completed | failed
                →  Frontend polls GET status route until a terminal state is reached
```

This means the frontend must **never assume an operation is complete** after the POST /initiate response. It must always poll for a terminal FSM state. This is the most critical architectural constraint for the mobile app.

### 1.4 Tech Stack

| Layer                    | Technology                            |
| ------------------------ | ------------------------------------- |
| Mobile Framework         | React Native (Expo SDK)               |
| Language                 | TypeScript                            |
| Navigation               | Expo Router (file-based routing)      |
| State Management         | Zustand                               |
| API Communication        | Axios + React Query (TanStack Query)  |
| Auth Token Storage       | Expo SecureStore                      |
| WebSocket (live prices)  | Native WebSocket API                  |
| QR Code                  | expo-camera + react-native-qrcode-svg |
| In-app browser (Billplz) | expo-web-browser                      |
| Styling                  | NativeWind (Tailwind for RN)          |
| Forms                    | React Hook Form + Zod                 |

> **Note on notifications:** OneSignal is NOT present in the backend route list. Real-time feedback will use the WebSocket price feed + status polling on GET routes. Do not build a OneSignal integration.

---

## 2. Project Structure

```
swap-n-go/
├── app/                          # Expo Router file-based routes
│   ├── (auth)/                   # Auth group — no tab bar, no JWT
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main app — tab bar, JWT required
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home / Dashboard
│   │   ├── send.tsx              # Transfer (domestic & overseas)
│   │   ├── swap.tsx              # Token Swap
│   │   ├── history.tsx           # Transaction History
│   │   └── profile.tsx
│   ├── deposit/
│   │   ├── index.tsx             # Initiate deposit (Billplz)
│   │   └── status.tsx            # Poll deposit status
│   ├── withdraw/
│   │   ├── index.tsx
│   │   └── status.tsx
│   ├── scan/
│   │   └── index.tsx             # Fullscreen QR scanner
│   ├── transaction/
│   │   └── [id].tsx              # Detail + auto-poll if non-terminal
│   └── _layout.tsx               # Root layout — auth guard
│
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance + interceptors
│   │   ├── auth.api.ts           # /public/auth/register|login
│   │   ├── wallet.api.ts         # /private/wallet/*
│   │   ├── transfer.api.ts       # /private/transfer/initiate + GET
│   │   ├── swap.api.ts           # /private/swap/initiate + GET
│   │   ├── deposit.api.ts        # /private/deposit/initiate + GET
│   │   └── withdraw.api.ts       # /private/withdraw/initiate + GET
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   ├── useTransfer.ts        # initiate mutation + status polling
│   │   ├── useSwap.ts
│   │   ├── useDeposit.ts
│   │   ├── useWithdraw.ts
│   │   ├── usePriceSocket.ts     # WebSocket ws/prices
│   │   └── useTransactionHistory.ts
│   │
│   ├── stores/
│   │   ├── auth.store.ts         # JWT token, user info
│   │   └── ui.store.ts           # Active modals, loading
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── StatusBadge.tsx   # pending/processing/completed/failed
│   │   ├── wallet/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── AssetRow.tsx
│   │   │   └── AssetList.tsx
│   │   ├── transaction/
│   │   │   ├── TransactionItem.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── AsyncStatusPoller.tsx  # reusable polling wrapper
│   │   ├── send/
│   │   │   ├── RecipientInput.tsx
│   │   │   ├── AmountInput.tsx
│   │   │   └── ConfirmSheet.tsx
│   │   ├── swap/
│   │   │   ├── TokenSelector.tsx
│   │   │   ├── SwapArrow.tsx
│   │   │   └── RateDisplay.tsx   # reads from WebSocket prices
│   │   └── qr/
│   │       ├── QRDisplay.tsx
│   │       └── QRScanner.tsx
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── wallet.types.ts
│   │   ├── transaction.types.ts
│   │   ├── swap.types.ts
│   │   ├── fsm.types.ts          # FsmStatus enum + AsyncOperation shape
│   │   └── api.types.ts
│   │
│   ├── utils/
│   │   ├── format.ts             # currency, date, SUI address truncation
│   │   ├── validation.ts         # Zod schemas
│   │   ├── sui.ts                # SUI address helpers, explorer URL builder
│   │   └── constants.ts          # token names, polling interval (2000ms), etc.
│   │
│   ├── config/
│   │   ├── env.ts                # typed expo-constants wrapper
│   │   └── queryClient.ts        # TanStack Query config
│   │
│   └── services/
│       ├── storage.service.ts    # SecureStore get/set/delete wrappers
│       └── websocket.service.ts  # singleton WS connection manager
│
├── assets/
├── app.json
├── tsconfig.json
├── babel.config.js
└── package.json
```

---

## 3. Core Modules & Features

### 3.1 Module: Authentication

**Screens:** `(auth)/login.tsx`, `(auth)/register.tsx`

**Functional Requirements:**

- Register: email + password. Backend auto-generates SUI wallet on account creation.
- Login: returns JWT access token. Store in SecureStore (never AsyncStorage).
- Auth guard in root `_layout.tsx`: no valid token → redirect to `(auth)/login`.
- No KYC screen in v1.

**Real API Calls (`auth.api.ts`):**

```
POST /api/v1/public/auth/register
  Body: { email, password }

POST /api/v1/public/auth/login
  Body: { email, password }
  Returns: { access_token }
```

Both are **public** — no JWT header needed. They live under `/public/` prefix.

**Note on token refresh:** The backend has `JWT_REFRESH_TIME` env var but no `/refresh` route is listed. The Axios interceptor should handle 401 by clearing the token and navigating to login, unless a refresh endpoint is later confirmed.

**Auth Store (`auth.store.ts`):**

```typescript
interface AuthStore {
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void; // clears SecureStore + resets store + navigates to login
}
```

---

### 3.2 Module: Home / Dashboard

**Screen:** `(tabs)/index.tsx`

**Functional Requirements:**

- Show total portfolio value in MYR at the top (balance × live price per token, summed).
- Show per-token asset rows: MYRC, USDT, USDC, BTC, ETH, SUI.
- Live prices stream in from WebSocket `ws://host/ws/prices` — no polling for price.
- Quick action buttons: Send, Receive (show QR), Deposit, Withdraw, Swap.
- Show latest N transactions with "See All" → history tab.
- Pull-to-refresh triggers balance refetch.

**API Calls (`wallet.api.ts`):**

```
GET /api/v1/private/wallet/*
  # Exact sub-routes to confirm against internal/routes/ in backend repo
  # Expected: balances per token, user's SUI wallet address
```

**WebSocket (`usePriceSocket.ts`):**

```
ws://host/ws/prices
  Streams live token prices
  Used to calculate MYR total and swap rate display
```

---

### 3.3 Module: Transfer — Send / Pay

**Screens:** `(tabs)/send.tsx` → `transaction/[id].tsx` (status polling)

**Functional Requirements:**

- Three recipient input methods: username/phone (backend resolves to SUI address inside the transfer), QR scan, or direct SUI address paste.
- Select token + enter amount. Confirmation sheet before submitting.
- `POST /private/transfer/initiate` returns immediately with `{ id, status: "pending" }`.
- Navigate to `transaction/[id].tsx` immediately and begin polling every 2 seconds.
- Stop polling on `completed` or `failed`.
- Show SUI transaction hash + SUI Explorer deep link on completion.

**API Calls (`transfer.api.ts`):**

```
POST /api/v1/private/transfer/initiate
  Body: { recipient, token, amount }
  Returns: { id, status: "pending" }

GET /api/v1/private/transfer/:id
  Returns: { id, status, sui_tx_hash, error_message, ... }
```

---

### 3.4 Module: QR Code

**Functional Requirements:**

- `QRDisplay` — encodes user's SUI wallet address (fetched from wallet API, not generated on frontend).
- `QRScanner` — camera scan → parse payload → pre-fill recipient on send screen.
- QR payload format:
  ```json
  { "address": "0xABC...", "username": "kee_yong", "app": "SwapNGo" }
  ```

---

### 3.5 Module: Token Swap

**Screens:** `(tabs)/swap.tsx` → `transaction/[id].tsx` (status polling)

**Functional Requirements:**

- Select from/to tokens. Display rate from WebSocket price feed (no quote endpoint exists).
- Enter amount. Confirmation modal. Submit.
- `POST /private/swap/initiate` — async. Poll status same as Transfer.
- Swap is processed on SUI via Kafka worker — show polling screen, not a spinner.

**API Calls (`swap.api.ts`):**

```
POST /api/v1/private/swap/initiate
  Body: { from_token, to_token, amount }
  Returns: { id, status: "pending" }

GET /api/v1/private/swap/:id
  Returns: { id, status, sui_tx_hash, ... }
```

> There is **no `/swap/quote` endpoint**. Rate is computed from WebSocket prices.

---

### 3.6 Module: Deposit MYRC (Billplz)

**Screens:** `deposit/index.tsx` → `deposit/status.tsx`

**Functional Requirements:**

- Enter MYR amount → `POST /private/deposit/initiate` → returns `{ id, billplz_payment_url }`.
- Open Billplz URL via `expo-web-browser`. Billplz sends webhook directly to backend — frontend does NOT handle this.
- After browser closes, poll `GET /private/deposit/:id` until `completed` or `failed`.
- On completion: MYRC is minted to user's SUI wallet. Show confirmation.

**API Calls (`deposit.api.ts`):**

```
POST /api/v1/private/deposit/initiate
  Body: { amount_myr }
  Returns: { id, billplz_payment_url, status: "pending" }

GET /api/v1/private/deposit/:id
  Returns: { id, status, myrc_minted, ... }

# Backend-only (never called by frontend):
POST /api/v1/public/deposit/webhook  ← Billplz → backend
```

---

### 3.7 Module: Withdraw

**Screens:** `withdraw/index.tsx` → `withdraw/status.tsx`

**Functional Requirements:**

- Select destination: Bank Account or External SUI Wallet. Enter details and amount.
- `POST /private/withdraw/initiate` — async. Poll same as Transfer.

**API Calls (`withdraw.api.ts`):**

```
POST /api/v1/private/withdraw/initiate
  Body: { destination_type, destination_details, token, amount }
  Returns: { id, status: "pending" }

GET /api/v1/private/withdraw/:id
  Returns: { id, status, sui_tx_hash, ... }
```

---

### 3.8 Module: Transaction History & Detail

**Screens:** `(tabs)/history.tsx`, `transaction/[id].tsx`

**Functional Requirements:**

- Unified history list merging transfers, swaps, deposits, withdrawals — sorted by `created_at`.
- FSM `StatusBadge` on each item: `pending`, `processing`, `completed`, `failed`.
- Tapping a non-terminal item auto-starts polling on the detail screen.
- Detail shows SUI transaction hash with `https://suiexplorer.com/txblock/:hash` link.

**API Calls:**

```
# Each operation type has its own GET routes — confirm exact paths in backend
GET /api/v1/private/transfer/*   (list + detail)
GET /api/v1/private/swap/*       (list + detail)
GET /api/v1/private/deposit/*    (list + detail)
GET /api/v1/private/withdraw/*   (list + detail)

# If no combined history endpoint exists, frontend merges and sorts results.
```

---

### 3.9 Module: Profile & Settings

**Screen:** `(tabs)/profile.tsx`

**Functional Requirements:**

- Display email and SUI wallet address (from wallet API).
- "My QR Code" shortcut → `QRDisplay`.
- Logout: clear SecureStore, reset Zustand, navigate to `(auth)/login`.

---

## 4. Async Operation Pattern (Shared Infrastructure)

All four financial operations (transfer, swap, deposit, withdraw) share this pattern. Build it once in Phase 4.

### 4.1 FSM Types (`src/types/fsm.types.ts`)

```typescript
export type FsmStatus = "pending" | "processing" | "completed" | "failed";

export interface AsyncOperation {
  id: string;
  status: FsmStatus;
  sui_tx_hash?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
```

### 4.2 Reusable Hook Pattern

```typescript
// Pattern used in useTransfer, useSwap, useDeposit, useWithdraw

export function useInitiateTransfer() {
  return useMutation({
    mutationFn: transferApi.initiate,
    onSuccess: (data) => {
      router.push(`/transaction/${data.id}`);
    },
  });
}

export function useTransferStatus(id: string) {
  return useQuery({
    queryKey: transferKeys.status(id),
    queryFn: () => transferApi.getStatus(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const terminal: FsmStatus[] = ["completed", "failed"];
      return terminal.includes(query.state.data?.status) ? false : 2000;
    },
  });
}
```

### 4.3 `AsyncStatusPoller` Component

```typescript
// src/components/transaction/AsyncStatusPoller.tsx
// Wraps the status query and renders appropriate UI:
//   pending/processing → spinner + "Processing on SUI blockchain..."
//   completed → success icon + SUI tx hash + Explorer link
//   failed → error icon + error_message + retry option
// Used by all four status screens
```

---

## 5. API Client Architecture

### 5.1 Axios Client (`src/api/client.ts`)

```typescript
const BASE_URL = env.API_BASE_URL; // e.g. http://localhost:8080

// Request interceptor: attach Authorization: Bearer <token>
// Response interceptor:
//   401 → clear token, navigate to (auth)/login
//   other errors → normalize to AppError { message: string, code?: string }
```

### 5.2 Route Prefix Constants

```typescript
export const PUBLIC = "/api/v1/public"; // register, login, webhook
export const PRIVATE = "/api/v1/private"; // wallet, transfer, swap, deposit, withdraw
```

### 5.3 React Query Config

```typescript
// staleTime: 30_000 (30s) for wallet balances
// retry: 1 for queries, 0 for mutations (never silently retry financial ops)
// refetchInterval: controlled per-hook, not globally
```

---

## 6. Environment Configuration

```env
# .env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080
EXPO_PUBLIC_SUI_EXPLORER_URL=https://suiexplorer.com
EXPO_PUBLIC_ENV=development
```

Typed wrapper at `src/config/env.ts` using `expo-constants`.

---

## 7. Non-Functional Requirements

| Requirement              | Target                                                      |
| ------------------------ | ----------------------------------------------------------- |
| Login response           | < 1s                                                        |
| Wallet balance load      | < 2s                                                        |
| POST /initiate response  | < 3s (just scheduling, not settlement)                      |
| SUI settlement (polling) | 2–10s typical on testnet                                    |
| QR scan recognition      | < 1s                                                        |
| Supported OS             | Android 10+, iOS 14+                                        |
| Offline handling         | Show cached data + banner; disable financial action buttons |
| Security                 | JWT in SecureStore only — never AsyncStorage                |
| WebSocket reconnect      | Exponential backoff, max 30s between retries                |

---

## 8. Development Phases for Claude Code

### Phase 1 — Project Scaffold

- [ ] `npx create-expo-app swap-n-go --template blank-typescript`
- [ ] Install all dependencies from tech stack
- [ ] Create full `app/` directory structure with placeholder files
- [ ] Configure NativeWind + `tsconfig.json` with `@/` → `src/` alias
- [ ] `src/config/env.ts` typed env wrapper

### Phase 2 — Auth & Navigation

- [ ] `(auth)/login.tsx`, `(auth)/register.tsx`
- [ ] `auth.store.ts` (Zustand) + `storage.service.ts` (SecureStore)
- [ ] `src/api/client.ts` — Axios with interceptors
- [ ] `auth.api.ts` → `POST /api/v1/public/auth/*`
- [ ] Root `_layout.tsx` auth guard + tab navigator

### Phase 3 — Wallet & Home

- [ ] `wallet.api.ts` → `GET /api/v1/private/wallet/*`
- [ ] `websocket.service.ts` + `usePriceSocket.ts` → `ws://host/ws/prices`
- [ ] `(tabs)/index.tsx` with `BalanceCard`, `AssetList`, `AssetRow`
- [ ] Pull-to-refresh + skeleton loaders

### Phase 4 — Async Infrastructure (build this before any financial feature)

- [ ] `fsm.types.ts` — `FsmStatus` + `AsyncOperation`
- [ ] `AsyncStatusPoller` component
- [ ] Validate the `useInitiate + useStatus` hook pattern end-to-end with a mock

### Phase 5 — Transfer

- [ ] `transfer.api.ts` → `/api/v1/private/transfer/*`
- [ ] `useTransfer.ts`
- [ ] `(tabs)/send.tsx` + `RecipientInput`, `AmountInput`, `ConfirmSheet`
- [ ] QR scanner + `QRDisplay`
- [ ] `transaction/[id].tsx` status screen

### Phase 6 — Swap

- [ ] `swap.api.ts` → `/api/v1/private/swap/*`
- [ ] `useSwap.ts`
- [ ] `(tabs)/swap.tsx` — `TokenSelector`, `SwapArrow`, `RateDisplay`

### Phase 7 — Deposit & Withdraw

- [ ] `deposit.api.ts` + deposit screens (Billplz via `expo-web-browser`)
- [ ] `withdraw.api.ts` + withdraw screens

### Phase 8 — Transaction History

- [ ] Merge GET routes from all four operation types
- [ ] `(tabs)/history.tsx` with filter tabs
- [ ] `transaction/[id].tsx` auto-poll for non-terminal items

### Phase 9 — Polish & QA

- [ ] Global error boundary + toast system
- [ ] Offline detection + banner
- [ ] `EAS Build` config (`eas.json`) for production

---

## 9. Backend API Contract Reference

> Source: `CLAUDE.md` from backend repo. Sub-routes marked `*` must be confirmed against `internal/routes/` in the backend before implementation.

### Public (no JWT)

| Method | Endpoint                         | Description                                            |
| ------ | -------------------------------- | ------------------------------------------------------ |
| POST   | `/api/v1/public/auth/register`   | Create account — backend auto-generates SUI wallet     |
| POST   | `/api/v1/public/auth/login`      | Returns JWT access token                               |
| POST   | `/api/v1/public/deposit/webhook` | **Billplz → backend only. Frontend never calls this.** |

### Private (JWT required — `Authorization: Bearer <token>`)

| Method | Endpoint                            | Description                                |
| ------ | ----------------------------------- | ------------------------------------------ |
| GET    | `/api/v1/private/wallet/*`          | Balances, SUI wallet address, portfolio    |
| POST   | `/api/v1/private/transfer/initiate` | Start async token transfer                 |
| GET    | `/api/v1/private/transfer/*`        | Transfer status + history                  |
| POST   | `/api/v1/private/swap/initiate`     | Start async token swap (SUI DEX via Kafka) |
| GET    | `/api/v1/private/swap/*`            | Swap status + history                      |
| POST   | `/api/v1/private/deposit/initiate`  | Start MYR deposit — returns Billplz URL    |
| GET    | `/api/v1/private/deposit/*`         | Deposit status + history                   |
| POST   | `/api/v1/private/withdraw/initiate` | Start async withdrawal                     |
| GET    | `/api/v1/private/withdraw/*`        | Withdraw status + history                  |

### WebSocket

| Endpoint              | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `ws://host/ws/prices` | Live token price stream for home dashboard and swap screen |

### What Does NOT Exist in the Backend

| Previously assumed                     | Reality                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `POST /auth/refresh`                   | Not in route list — treat 401 as logout                                           |
| `GET /swap/quote`                      | No quote endpoint — compute from WebSocket prices                                 |
| `POST /notifications/register-device`  | No OneSignal backend integration                                                  |
| `GET /user/resolve` (username→address) | Not listed — recipient resolution likely happens inside `/transfer/initiate` body |

---

## 10. Design Principles for Claude Code

1. **Async-first** — every financial POST returns a pending record. Always navigate to a status screen and poll. Never block on blockchain settlement.
2. **Module boundaries** — `components/swap/` never imports from `components/send/`. Each feature folder is self-contained.
3. **API layer is a facade** — screens and hooks never call Axios directly. All HTTP goes through `src/api/*.api.ts`.
4. **Hooks own logic, screens are thin** — one hook per screen, screens just render.
5. **Types are shared** — all interfaces in `src/types/`. No inline types in components or hooks.
6. **Utils are pure** — `src/utils/` has zero imports from stores, services, or API.
7. **Don't over-abstract** — hooks per operation type (useTransfer, useSwap, etc.) are explicit and readable. Don't merge them into a generic `useAsyncOperation` factory.
8. **Confirm `*` routes before coding** — the backend exposes route groups with wildcards. Look at `internal/routes/` in the backend before implementing any GET history or status endpoint.

---

_This PRD targets Claude Code. Begin with Phase 1 and proceed sequentially. Phase 4 (async infrastructure) is the most critical — validate it end-to-end before building any financial feature._
