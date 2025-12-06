# synqpay SDK

TypeScript/React SDK for integrating Avalanche-based payments and subscriptions into your app.

## Installation

```bash
npm install synq-sdk
```

Or use locally:
```bash
# In your Next.js app
import { CheckoutButton } from '../sdk/ui/CheckoutButton'
```

## Quick Start

### 1. Add Checkout Button

```tsx
import { CheckoutButton } from 'synq-sdk'

export default function Page() {
  return (
    <CheckoutButton 
      amount={0.01}
      planId="your-plan-uuid"
      label="Subscribe Now"
    />
  )
}
```

### 2. Show Subscription Status

```tsx
import { SubscriptionStatus } from 'synq-sdk'

export default function Dashboard({ wallet }: { wallet: string }) {
  return (
    <SubscriptionStatus 
      wallet={wallet}
      showDetails={true}
    />
  )
}
```

### 3. Verify Payments (Backend)

```tsx
import { verifyPayment } from 'synq-sdk'

const result = await verifyPayment(
  txHash,
  merchantAddress,
  0.01,
  planId
)

if (result.verified) {
  console.log('Payment confirmed!')
  if (result.subscription) {
    console.log('Subscription created:', result.subscription.subscription_id)
  }
}
```

### 4. Check Access

```tsx
import { checkAccess } from 'synq-sdk'

const { access } = await checkAccess(
  walletAddress,
  merchantAddress,
  planId
)

if (access) {
  // Grant access to premium content
}
```

### 5. AI Agents Panel (Merchants)

```tsx
import { AIAgentsPanel } from 'synq-sdk'

export default function MerchantPage({ merchantWallet }: { merchantWallet: string }) {
  return (
    <AIAgentsPanel 
      merchantWallet={merchantWallet}
      onAgentComplete={(agent, result) => {
        console.log(`Agent ${agent} completed:`, result)
      }}
    />
  )
}
```

### 6. Merchant Dashboard Widget

```tsx
import { MerchantDashboard } from 'synq-sdk'

export default function Dashboard({ merchantWallet }: { merchantWallet: string }) {
  return (
    <MerchantDashboard 
      merchantWallet={merchantWallet}
      showChart={true}
    />
  )
}
```

## Components

### `CheckoutButton`
Pre-built checkout button for payments and subscriptions.

**Props:**
- `amount?: number` - Payment amount in AVAX (default: 0.01)
- `planId?: string` - Optional subscription plan ID
- `label?: string` - Button text (default: "Subscribe")
- `className?: string` - Custom CSS classes
- `onCheckout?: () => void` - Callback when button clicked

### `SubscriptionStatus`
Display subscription status for a wallet.

**Props:**
- `wallet: string` - Wallet address to check
- `showDetails?: boolean` - Show expiration date (default: true)
- `className?: string` - Custom CSS classes

### `AIAgentsPanel`
Embeddable AI agents panel for merchants.

**Props:**
- `merchantWallet: string` - Merchant wallet address
- `className?: string` - Custom CSS classes
- `onAgentComplete?: (agent: string, result: any) => void` - Callback when agent completes

**Agents:**
- `invoice` - Generates invoices for verified payments
- `renew` - Manages expired subscriptions
- `analytics` - Generates revenue insights

### `MerchantDashboard`
Embeddable dashboard widget showing merchant statistics.

**Props:**
- `merchantWallet: string` - Merchant wallet address
- `className?: string` - Custom CSS classes
- `showChart?: boolean` - Show revenue chart (default: false)

## API Reference

### Client Functions

#### `verifyPayment(txHash, merchant, amount, planId?)`
Verifies a payment transaction on-chain and optionally creates a subscription.

**Returns:** `VerifyResponse`

#### `checkAccess(wallet, merchant, planId?)`
Checks if a wallet has active subscription access.

**Returns:** `AccessResponse`

#### `getSubscriptionStatus(wallet)`
Gets subscription status for a wallet.

**Returns:** `SubscriptionStatusData`

#### `listSubscriptions({ merchant?, customer? })`
Lists subscriptions filtered by merchant or customer.

#### `cancelSubscription(subscriptionId)`
Cancels an active subscription.

#### `createCheckoutUrl({ amount, planId? })`
Generates a checkout URL with parameters.

### UI Components

#### `<CheckoutButton />`
Pre-built button that redirects to checkout.

**Props:**
- `amount?: number` - Payment amount (default: 0.01)
- `planId?: string` - Plan ID for subscription
- `label?: string` - Button text (default: "Subscribe")
- `className?: string` - Custom CSS classes
- `onCheckout?: () => void` - Callback before redirect

#### `<SubscriptionStatus />`
Shows subscription status with automatic loading.

**Props:**
- `wallet: string` - Customer wallet address
- `className?: string` - Custom CSS classes
- `showDetails?: boolean` - Show expiry date (default: true)

## Types

All TypeScript types are exported:

```typescript
import type { 
  CheckoutOptions,
  VerifyResponse,
  SubscriptionStatusData,
  Plan,
  Subscription,
  AccessResponse
} from 'synq-sdk'
```

## Building

```bash
cd sdk
npm run build
```

Outputs to `sdk/dist/` with TypeScript declarations.

## Local Development

In your main app's `package.json`:

```json
{
  "scripts": {
    "build:sdk": "cd sdk && npm run build"
  }
}
```

Then:
```bash
npm run build:sdk
```

## License

MIT

