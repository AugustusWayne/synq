# Avalanche x402 Commerce Engine

Full-stack payment infrastructure on Avalanche Fuji testnet.

## 🚀 Features

- ✅ Smart contract payments (Solidity + Foundry)
- ✅ Next.js frontend with Wagmi wallet integration
- ✅ Backend payment verification via viem
- ✅ Supabase database for merchant/payment records
- ✅ Webhook system for merchant notifications
- ✅ Real-time event listening

## 📁 Project Structure

```
/contract              # Foundry smart contracts
  /src                 # Solidity contracts
  /script              # Deployment scripts
  /test                # Contract tests
  
/src
  /app
    /api
      /payments/verify # Payment verification endpoint
      /webhooks        # Webhook receiver
    /checkout-demo     # Demo checkout page
  /components          # React components
  /lib
    contract.ts        # Contract ABI & address
    db.ts             # Supabase client
    webhooks.ts       # Webhook triggers
    wagmiClient.ts    # Wallet config
```

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create project at https://app.supabase.com
2. Run migration from `supabase/migrations/001_initial_schema.sql`
3. Get API credentials from Settings → API

### 3. Configure Environment
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 4. Deploy Contract (Optional)
```bash
cd contract
echo "PRIVATE_KEY=your_key" > .env
forge script script/Deploy.s.sol --rpc-url fuji --broadcast --legacy
```

Update contract address in `src/lib/contract.ts`

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000/checkout-demo

## 💳 Payment Flow

1. **User** connects wallet (MetaMask on Fuji)
2. **User** clicks "Pay 0.01 AVAX"
3. **Contract** transfers AVAX to merchant, emits `PaymentReceived` event
4. **Frontend** waits for transaction confirmation
5. **Frontend** calls `/api/payments/verify` with tx hash
6. **Backend** reads event from blockchain via viem
7. **Backend** verifies event matches transaction
8. **Backend** saves payment to Supabase
9. **Backend** triggers webhook to merchant (if configured)
10. **Frontend** shows "Payment Verified" ✓

## 🔌 API Endpoints

### POST `/api/payments/verify`
Verifies blockchain payment and stores record.

**Request:**
```json
{
  "txHash": "0x...",
  "merchant": "0x...",
  "amount": 0.01
}
```

**Response:**
```json
{
  "verified": true,
  "payer": "0x...",
  "merchant": "0x...",
  "amount": "10000000000000000",
  "timestamp": "1234567890",
  "payment_id": "uuid"
}
```

### POST `/api/webhooks/receive`
Test endpoint for receiving merchant webhooks.

## 📊 Database Schema

### `merchants`
- `id` (uuid)
- `wallet` (text)
- `api_key` (text)
- `webhook_url` (text)
- `created_at` (timestamp)

### `payments`
- `id` (uuid)
- `merchant_id` (uuid FK)
- `payer` (text)
- `amount` (numeric)
- `tx_hash` (text)
- `timestamp` (bigint)
- `status` (text)
- `created_at` (timestamp)

## 🧪 Testing

```bash
# Test contracts
cd contract && forge test

# Build frontend
npm run build

# Run dev server
npm run dev
```

## 🌐 Deployed Contract

**Fuji Testnet:**
- Contract: `0xA97Cb465cf77b1f31a9b554491451cc94871E0A1`
- Explorer: https://testnet.snowtrace.io/address/0xA97Cb465cf77b1f31a9b554491451cc94871E0A1

## 🚀 Ready For

- Subscription tracking
- API key gating
- x402 agent integration
- Multi-merchant support
- Invoice generation

## 📝 License

MIT
