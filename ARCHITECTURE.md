# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            Avalanche x402 Commerce Engine                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  FRONTEND LAYER (Next.js 16 + React 19)              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │ │
│  │  │  Checkout  │  │ Protected  │  │ Dashboard  │     │ │
│  │  │   Pages    │  │  Content   │  │   Pages    │     │ │
│  │  └────────────┘  └────────────┘  └────────────┘     │ │
│  │                                                       │ │
│  │  ┌────────────┐  ┌────────────┐                     │ │
│  │  │   Wagmi    │  │  SDK Demo  │                     │ │
│  │  │  Wallet    │  │            │                     │ │
│  │  └────────────┘  └────────────┘                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                            ↕                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  API LAYER (Next.js API Routes)                      │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │ │
│  │  │  Payments  │  │Subscriptions│  │  Access    │     │ │
│  │  │   Verify   │  │  Manager   │  │  Control   │     │ │
│  │  └────────────┘  └────────────┘  └────────────┘     │ │
│  │                                                       │ │
│  │  ┌────────────┐  ┌────────────┐                     │ │
│  │  │   Plans    │  │  Webhooks  │                     │ │
│  │  │   API      │  │            │                     │ │
│  │  └────────────┘  └────────────┘                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                            ↕                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  AI AGENT LAYER (Gemini 2.0 Flash)                   │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │ │
│  │  │  Invoice   │  │  Renewal   │  │ Analytics  │     │ │
│  │  │   Agent    │  │   Agent    │  │   Agent    │     │ │
│  │  └────────────┘  └────────────┘  └────────────┘     │ │
│  └───────────────────────────────────────────────────────┘ │
│                            ↕                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  BLOCKCHAIN LAYER (Avalanche Fuji)                    │ │
│  │  ┌────────────────────────────────────────────┐       │ │
│  │  │  Smart Contract (Payments.sol)             │       │ │
│  │  │  • Pay function                            │       │ │
│  │  │  • PaymentReceived event                   │       │ │
│  │  │  • 0xA97Cb465cf77b1f31a9b554491451cc94871E0A1 │ │
│  │  └────────────────────────────────────────────┘       │ │
│  │                                                       │ │
│  │  Verification via Viem (read-only RPC calls)         │ │
│  └───────────────────────────────────────────────────────┘ │
│                            ↕                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  DATABASE LAYER (Supabase PostgreSQL)                 │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │ │
│  │  │ Merchants  │  │  Payments  │  │   Plans    │     │ │
│  │  └────────────┘  └────────────┘  └────────────┘     │ │
│  │  ┌────────────┐                                      │ │
│  │  │Subscriptions│                                     │ │
│  │  └────────────┘                                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  SDK LAYER (Developer Tools)                          │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │ │
│  │  │   React    │  │    API     │  │ TypeScript │     │ │
│  │  │ Components │  │   Client   │  │   Types    │     │ │
│  │  └────────────┘  └────────────┘  └────────────┘     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **Payment Flow**
```
1. User → Wallet → Smart Contract
   ↓
2. Smart Contract → Emits PaymentReceived Event
   ↓
3. Frontend → Waits for confirmation
   ↓
4. Frontend → POST /api/payments/verify
   ↓
5. Backend → Viem → Read blockchain event
   ↓
6. Backend → Verify event data
   ↓
7. Backend → Save to Supabase
   ↓
8. Backend → Create subscription (if applicable)
   ↓
9. Backend → Trigger webhook
   ↓
10. Response → Frontend → Show success
```

### **Subscription Creation**
```
1. Payment verified
   ↓
2. Check for plan_id
   ↓
3. Calculate period end (now + interval)
   ↓
4. Create subscription record
   ↓
5. Link to merchant & plan
   ↓
6. Status: active
   ↓
7. Return subscription details
```

### **Access Control**
```
1. User visits protected content
   ↓
2. Middleware checks wallet
   ↓
3. POST /api/access/verify
   ↓
4. Query subscriptions table
   ↓
5. Check status = 'active'
   ↓
6. Check current_period_end > now
   ↓
7. Return access: true/false
```

---

## 🗂️ Database Schema

### **merchants**
```sql
id               uuid PRIMARY KEY
wallet           text UNIQUE NOT NULL
api_key          text UNIQUE NOT NULL
webhook_url      text
created_at       timestamp DEFAULT now()
```

### **payments**
```sql
id               uuid PRIMARY KEY
merchant_id      uuid REFERENCES merchants(id)
payer            text NOT NULL
amount           numeric NOT NULL
tx_hash          text UNIQUE NOT NULL
timestamp        bigint NOT NULL
status           text DEFAULT 'pending'
invoice_sent     boolean DEFAULT false
created_at       timestamp DEFAULT now()
```

### **plans**
```sql
id               uuid PRIMARY KEY
merchant_id      uuid REFERENCES merchants(id)
name             text NOT NULL
amount           numeric NOT NULL
interval         text NOT NULL (monthly, yearly, weekly)
created_at       timestamp DEFAULT now()
```

### **subscriptions**
```sql
id                  uuid PRIMARY KEY
merchant_id         uuid REFERENCES merchants(id)
payer_wallet        text NOT NULL
plan_id             uuid REFERENCES plans(id)
status              text DEFAULT 'active'
current_period_end  bigint NOT NULL
created_at          timestamp DEFAULT now()
```

---

## 🔐 Security

### **Authentication**
- Wallet-based (no passwords)
- Signature verification
- API keys for merchants

### **Authorization**
- Subscription-based access
- Expiry checking
- Status validation

### **Smart Contract**
- No admin functions
- Direct peer-to-peer transfers
- Event-based verification

### **Backend**
- Environment variables for secrets
- Service role keys (Supabase)
- Read-only blockchain RPC
- Input validation

---

## 📡 API Architecture

### **RESTful Endpoints**
```
POST /api/payments/verify       # Verify payment
GET  /api/payments/list         # List payments

POST /api/subscriptions/create  # Create subscription
GET  /api/subscriptions/list    # List subscriptions
POST /api/subscriptions/cancel  # Cancel subscription
POST /api/subscriptions/renew   # Renew subscription

POST /api/access/verify         # Check access

POST /api/plans/create          # Create plan
GET  /api/plans/list            # List plans

POST /api/agents/run            # Run AI agent
POST /api/webhooks/receive      # Receive webhook
```

### **Response Format**
```typescript
{
  success: boolean
  data?: any
  error?: string
}
```

---

## 🧠 AI Agent Architecture

### **Gemini Integration**
```typescript
// Wrapper function
geminiGenerate(prompt: string): Promise<string>

// Used by agents
- Invoice Agent → Generate invoice text
- Renewal Agent → Generate renewal notice
- Analytics Agent → Generate business insights
```

### **Agent Execution**
```
1. Trigger via API: POST /api/agents/run
2. Agent queries database
3. Agent processes data
4. Agent calls Gemini with prompt
5. Agent saves/sends results
6. Return status
```

---

## 📦 SDK Architecture

### **Package Structure**
```
sdk/
├── index.ts              # Main exports
├── /client              # API utilities
│   ├── payments.ts      # Payment functions
│   └── subscriptions.ts # Subscription functions
├── /ui                  # React components
│   ├── CheckoutButton.tsx
│   └── SubscriptionStatus.tsx
└── /types               # TypeScript definitions
    └── index.ts
```

### **Component Pattern**
```typescript
// Server-side API call
function getSubscriptionStatus(wallet: string)

// Client-side React component
<SubscriptionStatus wallet={wallet} />
```

---

## 🔧 Tech Stack Details

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 16 | Server + client rendering |
| **UI** | React 19 | Component library |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Wallet** | Wagmi v3 | Wallet connection |
| **Blockchain** | Viem v2 | EVM interactions |
| **Contracts** | Solidity 0.8.20 | Smart contracts |
| **Build** | Foundry | Contract compilation |
| **Database** | Supabase | PostgreSQL + REST API |
| **AI** | Gemini 2.0 Flash | Text generation |
| **Language** | TypeScript 5 | Type safety |

---

## 🚀 Deployment Architecture

### **Frontend**
- Static pages: Pre-rendered
- API routes: Serverless functions
- Deploy: Vercel/Netlify

### **Smart Contracts**
- Network: Avalanche Fuji
- Deploy: Foundry scripts
- Verify: Snowtrace

### **Database**
- Hosted: Supabase Cloud
- Migrations: SQL files
- Backups: Automatic

### **SDK**
- Build: TypeScript compiler
- Publish: npm registry
- Versioning: Semantic versioning

---

## 📊 Performance

### **Frontend**
- Static generation where possible
- Dynamic imports
- Image optimization
- Code splitting

### **API**
- Serverless edge functions
- Caching strategies
- Efficient queries

### **Blockchain**
- Read-only RPC calls
- Event filtering
- Batch requests

### **Database**
- Indexed columns
- Optimized queries
- Connection pooling

---

## 🔮 Future Enhancements

- Multi-chain support
- Layer 2 integration
- Batch payments
- Recurring auto-payments
- Advanced analytics
- Mobile SDK
- WebSocket real-time updates
- GraphQL API

