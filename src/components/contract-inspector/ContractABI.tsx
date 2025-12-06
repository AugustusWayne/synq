import { FileCode } from 'lucide-react'
import { type Abi } from 'viem'

interface ContractABIProps {
  abi: Abi
}

export function ContractABI({ abi }: ContractABIProps) {
  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FileCode size={20} className="text-[#C3FF32]" />
          Contract ABI
        </h2>
        <div className="bg-[#050505] border border-white/5 rounded-xl p-4 max-h-[400px] overflow-y-auto">
          <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap break-all">
            {JSON.stringify(abi, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

