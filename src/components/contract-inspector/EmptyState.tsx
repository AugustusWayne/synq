import { Code2 } from 'lucide-react'

interface EmptyStateProps {
  hasAccess?: boolean
}

export function EmptyState({ hasAccess = false }: EmptyStateProps) {
  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-16 text-center">
      <div className="w-20 h-20 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Code2 size={40} className="text-[#C3FF32]" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">
        {hasAccess ? 'Start Your Inspection' : 'Subscribe to Unlock'}
      </h3>
      <p className="text-gray-400 max-w-md mx-auto">
        {hasAccess 
          ? 'Enter any Avalanche smart contract address to view detailed information, functions, and ABI.'
          : 'Get access to smart contract inspection tools with a subscription.'}
      </p>
    </div>
  )
}

