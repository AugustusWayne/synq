# 💚 synqpay

**Full-stack Web3 payment and subscription platform powered by Avalanche, with AI automation.**

> **synqpay** - Seamless payments, subscriptions, and merchant tools on Avalanche.

[![Avalanche](https://img.shields.io/badge/Avalanche-Fuji-E84142)](https://testnet.snowtrace.io)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-gray)](https://soliditylang.org)

---

## ✨ Features

### **Core Infrastructure**
- ✅ **Smart Contracts** - Solidity payment contracts (Foundry)
- ✅ **Payment Processing** - Wagmi + Viem blockchain integration
- ✅ **Subscription Management** - Recurring billing, auto-renewal
- ✅ **Access Control** - Content gating & verification
- ✅ **Database** - Supabase PostgreSQL
- ✅ **Webhooks** - Real-time merchant notifications

### **AI Automation** 🤖
- ✅ **Invoice Generation** - Gemini 2.0 Flash AI
- ✅ **Renewal Management** - Automated subscription renewals
- ✅ **Analytics Insights** - AI-powered business intelligence

### **Developer SDK** 📦
- ✅ **React Components** - Pre-built checkout & status UI
- ✅ **TypeScript SDK** - Full-featured API client
- ✅ **Type Definitions** - Complete type safety

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- MetaMask wallet
- Avalanche Fuji testnet AVAX ([Get from faucet](https://faucet.avax.network/))

### **1. Install Dependencies**
```bash
npm install
```

### **2. Configure Environment**
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key

Optional variables:
- `GEMINI_API_KEY` - For AI agents (invoice, renewal, analytics)
- `WEBHOOK_SECRET` - For webhook verification
```

### **3. Set up Database**
1. Create Supabase project: https://app.supabase.com
2. Run migrations in SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_subscriptions_schema.sql`
   - `supabase/migrations/003_add_invoice_field.sql`

### **4. Run Development Server**
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
avax-402/
├── contract/              # Smart contracts (Foundry)
│   ├── src/
│   │   └── Payments.sol  # Main payment contract
│   ├── script/           # Deployment scripts
│   └── test/             # Contract tests
│
├── src/
│   ├── agents/           # AI automation layer
│   │   ├── gemini.ts     # Gemini API wrapper
│   │   ├── invoice.ts    # Invoice generation
│   │   ├── renew.ts      # Subscription renewal
│   │   └── analytics.ts  # Business insights
│   │
│   ├── app/
│   │   ├── api/          # Backend API routes
│   │   │   ├── payments/verify/
│   │   │   ├── subscriptions/
│   │   │   ├── access/verify/
│   │   │   ├── agents/run/
│   │   │   └── webhooks/
│   │   │
│   │   ├── checkout-demo/     # Payment demo
│   │   ├── protected/         # Gated content
│   │   ├── dashboard/
│   │   │   ├── subscriptions/ # Subscription manager
│   │   │   └── analytics/     # AI agent dashboard
│   │   └── sdk-demo/          # SDK examples
│   │
│   ├── components/       # React components
│   │   ├── AvaxCheckout.tsx
│   │   └── CheckoutModal.tsx
│   │
│   └── lib/              # Core utilities
│       ├── contract.ts   # Contract ABI & address
│       ├── db.ts         # Supabase client
│       ├── subscriptions.ts
│       └── wagmiClient.ts
│
├── sdk/                  # Developer SDK
│   ├── client/           # API utilities
│   ├── ui/               # React components
│   ├── types/            # TypeScript types
│   └── dist/             # Compiled output
│
└── supabase/
    └── migrations/       # Database schema
```

---

## 💳 Payment Flow

```
1. User connects wallet (MetaMask)
   ↓
2. User clicks "Pay 0.01 AVAX"
   ↓
3. Smart contract transfers AVAX to merchant
   ↓
4. PaymentReceived event emitted on-chain
   ↓
5. Frontend waits for confirmation
   ↓
6. Backend verifies transaction via viem
   ↓
7. Payment saved to Supabase
   ↓
8. Subscription auto-created (if applicable)
   ↓
9. Webhook triggered to merchant
   ↓
10. Access granted ✓
```

---

## 🔌 API Endpoints

### **Payments**
- `POST /api/payments/verify` - Verify blockchain payment

### **Subscriptions**
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/list` - List subscriptions
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/renew` - Renew subscription

### **Access Control**
- `POST /api/access/verify` - Check access to gated content

### **Plans**
- `POST /api/plans/create` - Create subscription plan
- `GET /api/plans/list` - List plans

### **AI Agents**
- `POST /api/agents/run` - Run AI automation agents

### **Webhooks**
- `POST /api/webhooks/receive` - Receive merchant webhooks

---

## 🤖 AI Agents

### **Invoice Agent**
Automatically generates professional invoices for verified payments.

```bash
POST /api/agents/run
{ "agent": "invoice" }
```

### **Renewal Agent**
Manages subscription renewals and sends notices.

```bash
POST /api/agents/run
{ "agent": "renew" }
```

### **Analytics Agent**
Generates AI-powered business insights.

```bash
POST /api/agents/run
{ "agent": "analytics", "merchantId": "uuid" }
```

---

## 📦 Using the SDK

### **Import Components**
```tsx
import { CheckoutButton, SubscriptionStatus } from '../sdk'

export default function MyPage() {
  const { address } = useAccount()
  
  return (
    <>
      <CheckoutButton amount={0.01} planId="uuid" />
      <SubscriptionStatus wallet={address} />
    </>
  )
}
```

### **Use API Client**
```tsx
import { verifyPayment, checkAccess } from '../sdk'

// Verify payment
const result = await verifyPayment(txHash, merchant, 0.01, planId)

// Check access
const { access } = await checkAccess(wallet, merchant)
```

**Full SDK Documentation:** [SDK_USAGE.md](./SDK_USAGE.md)

---

## 🗄️ Database Schema

### **Tables**
- `merchants` - Merchant accounts with API keys
- `payments` - Payment transaction records
- `plans` - Subscription plan definitions
- `subscriptions` - Active/canceled subscriptions

**Schema files:** `supabase/migrations/`

---

## 🌐 Deployed Contract

**Avalanche Fuji Testnet:**
- **Address:** `0xA97Cb465cf77b1f31a9b554491451cc94871E0A1`
- **Explorer:** [View on Snowtrace](https://testnet.snowtrace.io/address/0xA97Cb465cf77b1f31a9b554491451cc94871E0A1)

---

## 🧪 Testing

### **Test Smart Contracts**
```bash
cd contract
forge test
```

### **Build SDK**
```bash
npm run build:sdk
```

### **Build Application**
```bash
npm run build
```

### **Run Demo Pages**
- Checkout: http://localhost:3000/checkout-demo
- Protected Content: http://localhost:3000/protected
- Subscriptions Dashboard: http://localhost:3000/dashboard/subscriptions
- AI Agents Dashboard: http://localhost:3000/dashboard/analytics
- SDK Demo: http://localhost:3000/sdk-demo

---

## 🎯 Use Cases

- **SaaS Subscriptions** - Monthly/yearly billing
- **Content Gating** - Paywalled premium content
- **NFT Memberships** - Token-gated access
- **Pay-per-view** - One-time content purchases
- **Donations** - Crypto payment processing
- **API Access** - API key monetization

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Avalanche (Fuji Testnet) |
| **Smart Contracts** | Solidity 0.8.20 + Foundry |
| **Frontend** | Next.js 16 + React 19 |
| **Wallet** | Wagmi + Viem |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 2.0 Flash |
| **Styling** | Tailwind CSS 4 |
| **Language** | TypeScript 5 |

---

## 📖 Documentation

- [SDK Usage Guide](./SDK_USAGE.md) - Complete SDK documentation
- [Contract README](./contract/README.md) - Smart contract details
- [SDK README](./sdk/README.md) - SDK quick reference

---

## 🚀 Deployment

### **Deploy Contracts**
```bash
cd contract
forge script script/Deploy.s.sol --rpc-url fuji --broadcast
```

### **Deploy Frontend**
```bash
npm run build
# Deploy to Vercel, Netlify, etc.
```

### **Publish SDK**
```bash
cd sdk
npm publish
```

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check documentation: [SDK_USAGE.md](./SDK_USAGE.md)

---

**Built with ❤️ on Avalanche**
