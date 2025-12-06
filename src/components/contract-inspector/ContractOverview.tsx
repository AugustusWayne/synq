import { FileCode, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'

interface ContractOverviewProps {
  address: string
  isVerified: boolean
  bytecodeSize: number
  balance: string
  transactionCount: number
}

export function ContractOverview({
  address,
  isVerified,
  bytecodeSize,
  balance,
  transactionCount
}: ContractOverviewProps) {
  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FileCode size={20} className="text-[#C3FF32]" />
          Contract Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Status</p>
            <div className="flex items-center gap-2">
              {isVerified ? (
                <>
                  <CheckCircle2 size={20} className="text-[#C3FF32]" />
                  <p className="text-lg font-bold text-[#C3FF32]">Verified</p>
                </>
              ) : (
                <>
                  <AlertCircle size={20} className="text-yellow-500" />
                  <p className="text-lg font-bold text-yellow-500">Unverified</p>
                </>
              )}
            </div>
          </div>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Bytecode Size</p>
            <p className="text-2xl font-bold text-white">
              {bytecodeSize.toLocaleString()} <span className="text-gray-500 text-sm">bytes</span>
            </p>
          </div>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Balance</p>
            <p className="text-2xl font-bold text-white">
              {balance} <span className="text-[#C3FF32] text-lg">AVAX</span>
            </p>
          </div>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Interactions</p>
            <p className="text-2xl font-bold text-white">
              {transactionCount}
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-[#050505] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-2">Contract Address</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono text-white flex-1 break-all">{address}</p>
            <a
              href={`https://testnet.snowtrace.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C3FF32] hover:text-[#b0e62e] transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

