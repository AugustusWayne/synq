import { ExternalLink } from 'lucide-react'

interface RiskIndicatorsProps {
  hasRiskyInteractions: boolean
  riskyAddresses: string[]
}

export function RiskIndicators({ hasRiskyInteractions, riskyAddresses }: RiskIndicatorsProps) {
  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6">
          Security Analysis
        </h2>
        
        {hasRiskyInteractions ? (
          <div>
            <div className="bg-[#050505] border border-red-500/20 rounded-xl p-6 mb-4">
              <p className="text-red-400 font-bold mb-2">Risk Detected</p>
              <p className="text-gray-400 text-sm">
                {riskyAddresses.length} flagged interaction{riskyAddresses.length > 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-3">Flagged Addresses</p>
              {riskyAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="bg-[#050505] border border-white/5 rounded-xl p-4 hover:border-red-500/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address {idx + 1}</p>
                    <p className="text-sm font-mono text-white">{addr.slice(0, 10)}...{addr.slice(-8)}</p>
                  </div>
                  <a
                    href={`https://testnet.snowtrace.io/address/${addr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-[#C3FF32] font-bold mb-2">Clean Record</p>
            <p className="text-gray-400 text-sm">
              No interactions found with addresses in our malicious database
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
