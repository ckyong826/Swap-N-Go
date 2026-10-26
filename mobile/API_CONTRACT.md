# SwapNGo — Backend API Design Contract

**Frontend base URL**: `http://10.160.44.123:8080`  
**API version prefix**: `/api/v1`  
**Auth scheme**: `Authorization: Bearer <access_token>` on all private routes  
**Content-Type**: `application/json`  
**Error format**: `{ "message": "human readable string" }` — frontend reads `error.response.data.message`

---

## Status Values (FSM)

All async operations use the same 4-state FSM:

```
pending → processing → completed
                    → failed
```

| Value        | Meaning                          |
|--------------|----------------------------------|
| `pending`    | Created, not yet picked up      |
| `processing` | Being executed on-chain          |
| `completed`  | Success                          |
| `failed`     | Terminal failure, check `error_message` |

Frontend polls every **2 seconds** until status is `completed` or `failed`.

---

## 1. Auth — Public Routes (`/api/v1/public`)

### POST `/api/v1/public/auth/register`

Register new user. Backend creates custodial SUI wallet for the user.

**Request**
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response 201**
```json
{
  "message": "Registration successful"
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 409    | Email already registered |
| 422    | Invalid email / password too short |

---

### POST `/api/v1/public/auth/login`

**Request**
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGci..."
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 401    | Wrong email or password |
| 404    | User not found |

> Frontend stores `access_token` in SecureStore and attaches it to every private request.  
> On any **401** from a private route, frontend auto-redirects to login.

---

## 2. Wallet — Private Routes (`/api/v1/private`)

### GET `/api/v1/private/wallet`

Returns user's wallet info and token balances.

**Response 200**
```json
{
  "sui_address": "0xabc123...",
  "email": "user@example.com",
  "balances": [
    {
      "token": "MYRC",
      "amount": 100.00,
      "value_myr": 100.00
    },
    {
      "token": "USDT",
      "amount": 50.00,
      "value_myr": 235.00
    }
  ],
  "total_value_myr": 335.00
}
```

**Notes**
- `token` must be one of: `MYRC | USDT | USDC | BTC | ETH | SUI`
- `value_myr` per balance and `total_value_myr` can be computed server-side OR left as `0` — frontend overrides with live WebSocket prices
- `email` is displayed on Profile screen — **must be returned**; currently hardcoded fallback on frontend

---

### GET `/api/v1/private/wallet/balances`

> **Status: UNUSED by frontend** — defined in `walletApi` but no hook calls it. Backend may skip this endpoint or use it as an alias.

---

## 3. Transfer (Send) — Private Routes

### POST `/api/v1/private/transfer/initiate`

Send tokens to another SUI address.

**Request**
```json
{
  "recipient": "0xdef456...",
  "token": "MYRC",
  "amount": 10.00
}
```

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending"
}
```

Frontend immediately navigates to `/transaction/<id>?type=transfer` and polls status.

**Errors**
| Status | Condition |
|--------|-----------|
| 400    | Invalid recipient address |
| 400    | Insufficient balance |
| 422    | amount <= 0 |

---

### GET `/api/v1/private/transfer/:id`

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending | processing | completed | failed",
  "recipient": "0xdef456...",
  "token": "MYRC",
  "amount": 10.00,
  "sui_tx_hash": "0xabc...",
  "error_message": null,
  "created_at": "2026-05-13T10:00:00Z",
  "updated_at": "2026-05-13T10:00:05Z"
}
```

`sui_tx_hash` present only when `status = completed`.  
`error_message` present only when `status = failed`.

---

### GET `/api/v1/private/transfer`

Returns all transfers for the authenticated user, newest first.

**Response 200** — array of TransferRecord (same shape as above)

---

## 4. Swap — Private Routes

### POST `/api/v1/private/swap/initiate`

**Request**
```json
{
  "from_token": "MYRC",
  "to_token": "USDT",
  "amount": 100.00
}
```

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending"
}
```

Frontend navigates to `/transaction/<id>?type=swap`.

**Errors**
| Status | Condition |
|--------|-----------|
| 400    | from_token == to_token |
| 400    | Insufficient balance |
| 422    | amount <= 0 |

---

### GET `/api/v1/private/swap/:id`

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending | processing | completed | failed",
  "from_token": "MYRC",
  "to_token": "USDT",
  "amount": 100.00,
  "received_amount": 21.05,
  "sui_tx_hash": "0xabc...",
  "error_message": null,
  "created_at": "2026-05-13T10:00:00Z",
  "updated_at": "2026-05-13T10:00:05Z"
}
```

`received_amount` is the actual output amount after swap execution.

---

### GET `/api/v1/private/swap`

Returns all swaps for the authenticated user, newest first.

**Response 200** — array of SwapRecord

---

## 5. Deposit (Fiat On-Ramp) — Private Routes

Flow: user enters MYR amount → backend creates Billplz bill → frontend opens payment URL in browser → after payment, backend webhook mints MYRC on SUI → frontend polls status.

### POST `/api/v1/private/deposit/initiate`

**Request**
```json
{
  "amount_myr": 100.00
}
```

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending",
  "billplz_payment_url": "https://www.billplz.com/bills/abc123"
}
```

Frontend opens `billplz_payment_url` in device browser via `expo-web-browser`, then navigates to `/deposit/status?id=<id>`.

**Errors**
| Status | Condition |
|--------|-----------|
| 400    | amount_myr < 10 (minimum) |
| 502    | Billplz API failure |

---

### GET `/api/v1/private/deposit/:id`

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending | processing | completed | failed",
  "amount_myr": 100.00,
  "myrc_minted": 100.00,
  "billplz_payment_url": "https://www.billplz.com/bills/abc123",
  "error_message": null,
  "created_at": "2026-05-13T10:00:00Z",
  "updated_at": "2026-05-13T10:00:05Z"
}
```

`myrc_minted` shown on status screen when `status = completed`.

---

### GET `/api/v1/private/deposit`

Returns all deposits for the authenticated user, newest first.

**Response 200** — array of DepositRecord

---

## 6. Withdraw (Fiat Off-Ramp / On-Chain Send) — Private Routes

Supports two destination types: bank account (MYR payout) or external SUI wallet.

### POST `/api/v1/private/withdraw/initiate`

**Request — bank withdrawal**
```json
{
  "destination_type": "bank",
  "destination_details": {
    "bank_account": "1234567890",
    "bank_name": "Maybank"
  },
  "token": "MYRC",
  "amount": 50.00
}
```

**Request — SUI wallet withdrawal**
```json
{
  "destination_type": "sui_wallet",
  "destination_details": {
    "sui_address": "0xdef456..."
  },
  "token": "USDT",
  "amount": 10.00
}
```

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending"
}
```

Frontend navigates to `/withdraw/status?id=<id>`.

**Errors**
| Status | Condition |
|--------|-----------|
| 400    | Insufficient balance |
| 400    | Invalid SUI address (sui_wallet type) |
| 400    | Missing bank_account or bank_name (bank type) |
| 422    | amount <= 0 |

---

### GET `/api/v1/private/withdraw/:id`

**Response 200**
```json
{
  "id": "uuid-string",
  "status": "pending | processing | completed | failed",
  "token": "MYRC",
  "amount": 50.00,
  "sui_tx_hash": "0xabc...",
  "error_message": null,
  "created_at": "2026-05-13T10:00:00Z",
  "updated_at": "2026-05-13T10:00:05Z"
}
```

---

### GET `/api/v1/private/withdraw`

Returns all withdrawals for the authenticated user, newest first.

**Response 200** — array of WithdrawRecord

---

## 7. WebSocket — Live Price Feed

**URL**: `ws://10.160.44.123:8080/ws/prices?token=<access_token>`

Frontend connects on login and reconnects with exponential backoff (1s → 30s max) on disconnect.

**Message format** — server pushes JSON periodically:
```json
{
  "MYRC": 1.00,
  "USDT": 4.71,
  "USDC": 4.71,
  "BTC": 290000.00,
  "ETH": 18000.00,
  "SUI": 12.50
}
```

- Keys are token symbols
- Values are price **in MYR**
- Push interval: recommend 3–5 seconds
- Frontend uses these prices to compute `value_myr` per token and swap rate estimates

**Auth**: token passed as query param. Server must validate it. Close connection on invalid token.

---

## Summary Table

| # | Method | Endpoint | Auth | Action |
|---|--------|----------|------|--------|
| 1 | POST | `/api/v1/public/auth/register` | None | Must build |
| 2 | POST | `/api/v1/public/auth/login` | None | Must build |
| 3 | GET | `/api/v1/private/wallet` | Bearer | Must build — include `email` field |
| 4 | POST | `/api/v1/private/transfer/initiate` | Bearer | Must build |
| 5 | GET | `/api/v1/private/transfer/:id` | Bearer | Must build |
| 6 | GET | `/api/v1/private/transfer` | Bearer | Must build |
| 7 | POST | `/api/v1/private/swap/initiate` | Bearer | Must build |
| 8 | GET | `/api/v1/private/swap/:id` | Bearer | Must build |
| 9 | GET | `/api/v1/private/swap` | Bearer | Must build |
| 10 | POST | `/api/v1/private/deposit/initiate` | Bearer | Must build — Billplz integration |
| 11 | GET | `/api/v1/private/deposit/:id` | Bearer | Must build |
| 12 | GET | `/api/v1/private/deposit` | Bearer | Must build |
| 13 | POST | `/api/v1/private/withdraw/initiate` | Bearer | Must build |
| 14 | GET | `/api/v1/private/withdraw/:id` | Bearer | Must build |
| 15 | GET | `/api/v1/private/withdraw` | Bearer | Must build |
| 16 | WS | `/ws/prices?token=` | Query param token | Must build — price broadcast |
| — | GET | `/api/v1/private/wallet/balances` | Bearer | NOT USED by frontend — skip |

---

## Critical Notes for Backend

1. **All datetime fields** must be ISO 8601 UTC strings: `"2026-05-13T10:00:00Z"`

2. **UUIDs** for `id` fields — frontend truncates to first 12 chars for display

3. **History endpoints** (`GET /transfer`, `/swap`, `/deposit`, `/withdraw`) are called simultaneously on the History screen via `Promise.allSettled` — individual failure is tolerated, just return empty array or 200 with `[]`

4. **Billplz webhook** — backend must expose a Billplz callback URL to receive payment confirmation and trigger MYRC minting + status update to `processing` → `completed`

5. **SUI tx hash** — frontend links it to SUI explorer at `https://suiexplorer.com` — format must be valid SUI tx digest string

6. **Token symbol enum**: `MYRC | USDT | USDC | BTC | ETH | SUI` — frontend validates these values on swap screen

7. **Profile email** — `GET /api/v1/private/wallet` must return `email` field. Profile screen currently hardcodes `'user@swapngo.com'` as fallback because this field may be missing from current backend response.

8. **MYRC peg** — 1 MYRC = 1 MYR. WebSocket should broadcast `"MYRC": 1.00` always.
