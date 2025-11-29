"use client"

import { CheckoutButton } from "../../../sdk/ui/CheckoutButton"
import { SubscriptionStatus } from "../../../sdk/ui/SubscriptionStatus"
import { useAccount } from "wagmi"

export default function SDKDemoPage() {
  const { address } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SDK Demo
          </h1>
          <p className="text-gray-600 mb-8">
            Testing Avalanche Commerce SDK Components
          </p>

          <div className="space-y-8">
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">CheckoutButton Component</h2>
              <p className="text-gray-600 mb-4">
                Pre-built button that redirects to checkout:
              </p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Default Style:</p>
                  <CheckoutButton amount={0.01} />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">With Custom Label:</p>
                  <CheckoutButton 
                    amount={0.005}
                    label="Subscribe for 0.005 AVAX"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Custom Styling:</p>
                  <CheckoutButton 
                    amount={0.02}
                    label="Premium Plan"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">SubscriptionStatus Component</h2>
              <p className="text-gray-600 mb-4">
                Shows subscription status with automatic loading:
              </p>

              {address ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Your Wallet: {address.slice(0, 10)}...{address.slice(-8)}</p>
                    <SubscriptionStatus wallet={address} />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">With Custom Styling:</p>
                    <SubscriptionStatus 
                      wallet={address}
                      className="p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                      showDetails={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-yellow-800">
                  ⚠️ Connect your wallet to see subscription status
                </div>
              )}
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">SDK Usage Examples</h2>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`// Import SDK components
import { CheckoutButton, SubscriptionStatus } from '../sdk'

// Use in your app
export default function MyPage() {
  return (
    <>
      <CheckoutButton 
        amount={0.01}
        planId="your-plan-id"
        label="Subscribe Now"
      />
      
      <SubscriptionStatus 
        wallet="0x..."
        showDetails={true}
      />
    </>
  )
}`}
                </pre>
              </div>
            </div>

            <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                📦 SDK Features
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>✓ Pre-built React components</li>
                <li>✓ TypeScript type definitions</li>
                <li>✓ Backend API client utilities</li>
                <li>✓ Payment verification</li>
                <li>✓ Subscription management</li>
                <li>✓ Access control checking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

