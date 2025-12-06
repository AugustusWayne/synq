'use client'

import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { TrendingUp, Lock, Loader2 } from 'lucide-react'
import { isAddress, type Address } from 'viem'
import {
  WalletScoreInput,
  ScoreMeter,
  WalletOverview,
  InteractionSummary,
  RiskIndicators
} from '@/components/wallet-score'
import { ToolHeader, ToolLayout, ToolLoadingState, useToolAccess } from '@/components/tools'
import CheckoutModal from '@/components/checkout/CheckoutModal'

const KNOWN_SCAM_ADDRESSES = [
  '0x0000000000000000000000000000000000000000',
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
]

interface WalletScore {
  totalScore: number
  breakdown: {
    ageScore: number
    txScore: number
    ratioScore: number
    contractScore: number
    riskScore: number
  }
  metrics: {
    firstSeenDate: string
    walletAgeDays: number
    totalTransactions: number
    incomingCount: number
    outgoingCount: number
    uniqueContracts: number
    topContracts: string[]
    hasRiskyInteractions: boolean
    riskyAddresses: string[]
  }
}

export default function WalletScorePage() {
  const { isConnected, connectedAddress, hasAccess, loading, subscriptionInfo, checkAccess } = useToolAccess()
  const publicClient = usePublicClient()
  const [showCheckout, setShowCheckout] = useState(false)

  const [targetAddress, setTargetAddress] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [score, setScore] = useState<WalletScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const analyzeWallet = async () => {
    // Check subscription first
    if (!hasAccess) {
      setError('Active subscription required')
      setShowCheckout(true)
      return
    }

    if (!targetAddress || !isAddress(targetAddress)) {
      setError('Please enter a valid wallet address')
      return
    }

    if (!publicClient) {
      setError('Network client not available')
      return
    }

    setAnalyzing(true)
    setError(null)
    setScore(null)
    setProgress('Fetching wallet data...')

    try {
      const walletAddress = targetAddress as Address

      const [currentBlock, txCount] = await Promise.all([
        publicClient.getBlockNumber(),
        publicClient.getTransactionCount({ address: walletAddress }),
      ])

      setProgress('Analyzing transaction history...')

      const blocksToScan = 50
      const startBlock = currentBlock - BigInt(blocksToScan)
      const contractInteractions = new Set<string>()
      const riskyAddresses: string[] = []
      let incomingCount = 0
      let outgoingCount = 0
      let oldestBlockNum = Number(currentBlock)

      for (let i = 0; i < blocksToScan; i++) {
        const blockNumber = currentBlock - BigInt(i)
        
        try {
          const block = await publicClient.getBlock({
            blockNumber,
            includeTransactions: true,
          })

          if (block.transactions && Array.isArray(block.transactions)) {
            for (const tx of block.transactions) {
              if (typeof tx === 'object' && tx !== null) {
                const txObj = tx as any
                
                if (txObj.from?.toLowerCase() === walletAddress.toLowerCase()) {
                  outgoingCount++
                  if (txObj.to) {
                    contractInteractions.add(txObj.to)
                    if (KNOWN_SCAM_ADDRESSES.includes(txObj.to.toLowerCase())) {
                      riskyAddresses.push(txObj.to)
                    }
                  }
                  oldestBlockNum = Math.min(oldestBlockNum, Number(blockNumber))
                }
                
                if (txObj.to?.toLowerCase() === walletAddress.toLowerCase()) {
                  incomingCount++
                  oldestBlockNum = Math.min(oldestBlockNum, Number(blockNumber))
                }
              }
            }
          }
        } catch (blockError) {
          // Continue to next block on error
        }

        if (i % 10 === 0) {
          setProgress(`Scanning blocks... ${i}/${blocksToScan}`)
        }

        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setProgress('Calculating reputation score...')

      const blocksSinceFirstSeen = Number(currentBlock) - oldestBlockNum
      const estimatedDaysOld = Math.max(1, Math.floor((blocksSinceFirstSeen * 2) / 86400))
      
      let ageScore = 5
      if (estimatedDaysOld >= 180) ageScore = 30
      else if (estimatedDaysOld >= 30) ageScore = 15

      let txScore = 5
      if (txCount >= 200) txScore = 25
      else if (txCount >= 50) txScore = 15

      const totalTx = incomingCount + outgoingCount || 1
      const incomingRatio = incomingCount / totalTx
      let ratioScore = 10
      if (incomingRatio > 0.7) ratioScore = 5
      else if (incomingRatio >= 0.3 && incomingRatio <= 0.7) ratioScore = 15

      const uniqueContractsCount = contractInteractions.size
      let contractScore = 0
      if (uniqueContractsCount > 5) contractScore = 15
      else if (uniqueContractsCount >= 1) contractScore = 5

      let riskScore = 10
      if (riskyAddresses.length > 0) {
        riskScore = -20
      }

      const totalScore = Math.min(100, Math.max(0, ageScore + txScore + ratioScore + contractScore + riskScore))

      const firstSeenBlock = await publicClient.getBlock({ blockNumber: BigInt(oldestBlockNum) })
      const firstSeenDate = new Date(Number(firstSeenBlock.timestamp) * 1000).toLocaleDateString()

      setScore({
        totalScore,
        breakdown: {
          ageScore,
          txScore,
          ratioScore,
          contractScore,
          riskScore,
        },
        metrics: {
          firstSeenDate,
          walletAgeDays: estimatedDaysOld,
          totalTransactions: txCount,
          incomingCount,
          outgoingCount,
          uniqueContracts: uniqueContractsCount,
          topContracts: Array.from(contractInteractions).slice(0, 5),
          hasRiskyInteractions: riskyAddresses.length > 0,
          riskyAddresses,
        },
      })
    } catch (err: any) {
      setError(err.message || 'Failed to analyze wallet')
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
        icon={TrendingUp}
        title="Wallet Reputation Score"
        description="Behavior-based scoring for EVM wallets using on-chain activity"
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
                  : 'Subscribe to unlock wallet reputation scoring'}
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

      <WalletScoreInput
        targetAddress={targetAddress}
        setTargetAddress={setTargetAddress}
        onAnalyze={analyzeWallet}
        analyzing={analyzing}
        progress={progress}
        error={error}
        disabled={!hasAccess}
      />

      {score && (
        <div className="space-y-6">
          <ScoreMeter score={score.totalScore} breakdown={score.breakdown} />
          
          <WalletOverview
            firstSeenDate={score.metrics.firstSeenDate}
            walletAgeDays={score.metrics.walletAgeDays}
            totalTransactions={score.metrics.totalTransactions}
            incomingCount={score.metrics.incomingCount}
            outgoingCount={score.metrics.outgoingCount}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractionSummary
              uniqueContractsCount={score.metrics.uniqueContracts}
              topContracts={score.metrics.topContracts}
            />
            
            <RiskIndicators
              hasRiskyInteractions={score.metrics.hasRiskyInteractions}
              riskyAddresses={score.metrics.riskyAddresses}
            />
          </div>
        </div>
      )}

      {!score && !analyzing && (
        <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-16 text-center">
          <div className="w-20 h-20 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={40} className="text-[#C3FF32]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {hasAccess ? 'Start Reputation Analysis' : 'Subscribe to Unlock'}
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {hasAccess 
              ? 'Enter any Avalanche wallet address to calculate its reputation score based on on-chain behavior.'
              : 'Get access to wallet reputation scoring tools with a subscription.'}
          </p>
        </div>
      )}

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
