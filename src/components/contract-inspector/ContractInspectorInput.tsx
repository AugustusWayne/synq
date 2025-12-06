import { Search, Loader2, AlertCircle } from 'lucide-react'

interface ContractInspectorInputProps {
  targetContract: string
  setTargetContract: (value: string) => void
  onAnalyze: () => void
  analyzing: boolean
  progress: string
  error: string | null
}

export function ContractInspectorInput({
  targetContract,
  setTargetContract,
  onAnalyze,
  analyzing,
  progress,
  error
}: ContractInspectorInputProps) {
  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 mb-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <label className="block text-sm font-semibold text-gray-400 mb-3">
          Enter Contract Address
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={targetContract}
            onChange={(e) => setTargetContract(e.target.value)}
            placeholder="0x..."
            className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C3FF32]/50 focus:ring-2 focus:ring-[#C3FF32]/20 transition-all font-mono text-sm"
          />
          <button
            onClick={onAnalyze}
            disabled={analyzing || !targetContract}
            className="px-8 py-3 bg-[#C3FF32] text-black rounded-xl font-bold text-sm tracking-tight hover:bg-[#b0e62e] transition-all duration-200 shadow-[0_0_20px_rgba(195,255,50,0.3)] hover:shadow-[0_0_30px_rgba(195,255,50,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search size={18} />
                Inspect
              </>
            )}
          </button>
        </div>
        {progress && (
          <div className="mt-3 flex items-center gap-2 text-[#C3FF32] text-sm">
            <Loader2 size={16} className="animate-spin" />
            {progress}
          </div>
        )}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

