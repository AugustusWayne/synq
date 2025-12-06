import { Calendar, Activity, TrendingUp, TrendingDown } from 'lucide-react'

interface WalletOverviewProps {
  firstSeenDate: string
  walletAgeDays: number
  totalTransactions: number
  incomingCount: number
  outgoingCount: number
}

export function WalletOverview({
  firstSeenDate,
  walletAgeDays,
  totalTransactions,
  incomingCount,
  outgoingCount
}: WalletOverviewProps) {
  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity size={20} className="text-[#C3FF32]" />
          Wallet Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-400" />
              <p className="text-sm text-gray-400">First Seen</p>
            </div>
            <p className="text-xl font-bold text-white">{firstSeenDate}</p>
            <p className="text-xs text-gray-500 mt-1">{walletAgeDays} days old</p>
          </div>
          
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-gray-400" />
              <p className="text-sm text-gray-400">Total Transactions</p>
            </div>
            <p className="text-xl font-bold text-white">{totalTransactions}</p>
          </div>
          
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-green-400" />
              <p className="text-sm text-gray-400">Incoming</p>
            </div>
            <p className="text-xl font-bold text-green-400">{incomingCount}</p>
          </div>
          
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-red-400" />
              <p className="text-sm text-gray-400">Outgoing</p>
            </div>
            <p className="text-xl font-bold text-red-400">{outgoingCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

