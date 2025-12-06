import { Code2, ExternalLink } from 'lucide-react'

interface InteractionSummaryProps {
  uniqueContractsCount: number
  topContracts: string[]
}

export function InteractionSummary({ uniqueContractsCount, topContracts }: InteractionSummaryProps) {
  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Code2 size={20} className="text-[#C3FF32]" />
          Contract Interactions
        </h2>
        
        <div className="mb-6">
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Unique Contracts</p>
            <p className="text-3xl font-bold text-white">{uniqueContractsCount}</p>
          </div>
        </div>
        
        {topContracts.length > 0 ? (
          <div>
            <p className="text-sm text-gray-400 mb-3">Top Interactions</p>
            <div className="space-y-2">
              {topContracts.map((contract, idx) => (
                <div
                  key={idx}
                  className="bg-[#050505] border border-white/5 rounded-xl p-4 hover:border-[#C3FF32]/30 transition-all flex items-center justify-between"
                >
                  <span className="text-sm font-mono text-white">
                    {contract.slice(0, 6)}...{contract.slice(-4)}
                  </span>
                  <a
                    href={`https://testnet.snowtrace.io/address/${contract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C3FF32] hover:text-[#b0e62e] transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No contract interactions detected</p>
          </div>
        )}
      </div>
    </div>
  )
}

