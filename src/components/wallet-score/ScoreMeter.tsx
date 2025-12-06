import { Shield } from 'lucide-react'
import { TrendingUp } from 'lucide-react'
interface ScoreMeterProps {
  score: number
  breakdown: {
    ageScore: number
    txScore: number
    ratioScore: number
    contractScore: number
    riskScore: number
  }
}

export function ScoreMeter({ score, breakdown }: ScoreMeterProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 75) return { label: 'Low Risk', color: 'text-[#C3FF32]' }
    if (score >= 50) return { label: 'Moderate', color: 'text-yellow-400' }
    return { label: 'High Risk', color: 'text-red-400' }
  }

  const riskLevel = getRiskLevel(score)
  const totalPossible = breakdown.ageScore + breakdown.txScore + breakdown.ratioScore + breakdown.contractScore + Math.abs(breakdown.riskScore)

  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#C3FF32]" />
          Reputation Score
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Score</p>
            <p className="text-4xl font-bold text-white">{score}</p>
            <p className={`text-sm font-semibold mt-2 ${riskLevel.color}`}>{riskLevel.label}</p>
          </div>
          
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Age</p>
            <p className="text-2xl font-bold text-white">{breakdown.ageScore}</p>
            <p className="text-xs text-gray-500 mt-1">/ 30</p>
          </div>
          
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Activity</p>
            <p className="text-2xl font-bold text-white">{breakdown.txScore}</p>
            <p className="text-xs text-gray-500 mt-1">/ 25</p>
          </div>
          
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Contracts</p>
            <p className="text-2xl font-bold text-white">{breakdown.contractScore}</p>
            <p className="text-xs text-gray-500 mt-1">/ 15</p>
          </div>
        </div>
      </div>
    </div>
  )
}
