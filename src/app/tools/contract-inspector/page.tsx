'use client'

import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { Code2, Lock, Loader2 } from 'lucide-react'
import { isAddress, type Address, type Abi } from 'viem'
import {
  ContractOverview,
  ContractFunctions,
  ContractABI,
  EmptyState
} from '@/components/contract-inspector'
import { ToolHeader, ToolLayout, ToolLoadingState, useToolAccess } from '@/components/tools'
import CheckoutModal from '@/components/checkout/CheckoutModal'

interface ContractFunction {
  name: string
  type: 'function' | 'event' | 'constructor' | 'fallback' | 'receive'
  stateMutability?: string
  inputs: Array<{ name: string; type: string }>
  outputs?: Array<{ name: string; type: string }>
}

interface ContractInsights {
  address: string
  bytecodeSize: number
  isContract: boolean
  balance: string
  transactionCount: number
  abi?: Abi
  functions: ContractFunction[]
  isVerified: boolean
}

export default function ContractInspectorPage() {
  const { isConnected, connectedAddress, hasAccess, loading, subscriptionInfo, checkAccess } = useToolAccess()
  const publicClient = usePublicClient()
  const [showCheckout, setShowCheckout] = useState(false)

  const [targetContract, setTargetContract] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<ContractInsights | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const analyzeContract = async () => {
    // Check subscription first
    if (!hasAccess) {
      setError('Active subscription required')
      setShowCheckout(true)
      return
    }

    if (!targetContract || !isAddress(targetContract)) {
      setError('Please enter a valid contract address')
      return
    }

    if (!publicClient) {
      setError('Network client not available')
      return
    }

    setAnalyzing(true)
    setError(null)
    setInsights(null)
    setProgress('Fetching contract data...')

    try {
      const contractAddress = targetContract as Address

      const [bytecode, balance, txCount] = await Promise.all([
        publicClient.getBytecode({ address: contractAddress }),
        publicClient.getBalance({ address: contractAddress }),
        publicClient.getTransactionCount({ address: contractAddress }),
      ])

      const isContract = bytecode && bytecode !== '0x' && bytecode.length > 2

      if (!isContract) {
        setError('This address does not appear to be a contract')
        return
      }

      setProgress('Analyzing bytecode...')

      const bytecodeSize = bytecode ? (bytecode.length - 2) / 2 : 0

      setProgress('Fetching verification data...')

      let abi: Abi | undefined
      let isVerified = false
      const functions: ContractFunction[] = []

      try {
        const snowtraceResponse = await fetch(
          `https://api-testnet.snowtrace.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=YourApiKeyToken`
        )
        const snowtraceData = await snowtraceResponse.json()
        
        if (snowtraceData.status === '1' && snowtraceData.result) {
          abi = JSON.parse(snowtraceData.result)
          isVerified = true

          if (Array.isArray(abi)) {
            abi.forEach((item: any) => {
              if (item.type === 'function' || item.type === 'event' || item.type === 'constructor') {
                functions.push({
                  name: item.name || item.type,
                  type: item.type,
                  stateMutability: item.stateMutability,
                  inputs: item.inputs || [],
                  outputs: item.outputs || [],
                })
              }
            })
          }
        }
      } catch (apiError) {
        // Verification check failed, continue without ABI
      }

      setInsights({
        address: contractAddress,
        bytecodeSize,
        isContract: true,
        balance: (Number(balance) / 1e18).toFixed(4),
        transactionCount: txCount,
        abi,
        functions,
        isVerified,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to analyze contract')
    } finally {
      setAnalyzing(false)
      setProgress('')
    }
  }

  if (loading) {
    return <ToolLoadingState />
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Code2}
        title="Contract Inspector"
        description="Analyze smart contracts on Avalanche"
        hasSubscription={!!hasAccess}
      />

      {/* Subscription Banner */}
      {!hasAccess && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock size={20} className="text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-500 font-semibold">Subscription Required</p>
              <p className="text-gray-400 text-sm mt-1">
                {!isConnected 
                  ? 'Connect your wallet and subscribe to unlock this tool'
                  : 'Subscribe to unlock smart contract analysis features'}
              </p>
            </div>
            {isConnected && (
              <button
                onClick={() => setShowCheckout(true)}
                className="px-4 py-2 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold text-sm"
              >
                Subscribe
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 mb-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
        <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <label className="block text-sm font-semibold text-gray-400 mb-3">
            Contract Address
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={targetContract}
              onChange={(e) => setTargetContract(e.target.value)}
              disabled={!hasAccess}
              placeholder={hasAccess ? "0x..." : "Subscribe to unlock"}
              className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C3FF32]/50 focus:ring-2 focus:ring-[#C3FF32]/20 transition-all font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={analyzeContract}
              disabled={analyzing || !targetContract || !hasAccess}
              className="px-8 py-3 bg-[#C3FF32] text-black rounded-xl font-bold text-sm tracking-tight hover:bg-[#b0e62e] transition-all duration-200 shadow-[0_0_20px_rgba(195,255,50,0.3)] hover:shadow-[0_0_30px_rgba(195,255,50,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400 disabled:shadow-none flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
          {progress && <div className="mt-3 text-[#C3FF32] text-sm">{progress}</div>}
          {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        </div>
      </div>

      {insights && (
        <div className="space-y-6">
          <ContractOverview
            address={insights.address}
            isVerified={insights.isVerified}
            bytecodeSize={insights.bytecodeSize}
            balance={insights.balance}
            transactionCount={insights.transactionCount}
          />
          
          <ContractFunctions functions={insights.functions} />
          
          {insights.abi && <ContractABI abi={insights.abi} />}
        </div>
      )}

      {!insights && !analyzing && <EmptyState hasAccess={!!hasAccess} />}

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false)
            checkAccess()
          }}
        />
      )}
    </ToolLayout>
  )
}
