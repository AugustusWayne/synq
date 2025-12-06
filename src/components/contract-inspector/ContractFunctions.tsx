import { Zap } from 'lucide-react'

interface ContractFunction {
  name: string
  type: 'function' | 'event' | 'constructor' | 'fallback' | 'receive'
  stateMutability?: string
  inputs: Array<{ name: string; type: string }>
  outputs?: Array<{ name: string; type: string }>
}

interface ContractFunctionsProps {
  functions: ContractFunction[]
}

export function ContractFunctions({ functions }: ContractFunctionsProps) {
  if (functions.length === 0) return null

  return (
    <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
      <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap size={20} className="text-[#C3FF32]" />
          Functions & Events ({functions.length})
        </h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {functions.map((func, index) => (
            <div
              key={index}
              className="bg-[#050505] border border-white/5 rounded-xl p-4 hover:border-[#C3FF32]/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#C3FF32] font-mono text-sm font-bold">
                    {func.name}
                  </span>
                  {func.stateMutability && (
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
                      {func.stateMutability}
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                  {func.type}
                </span>
              </div>
              
              {func.inputs.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Inputs:</p>
                  <div className="space-y-1">
                    {func.inputs.map((input, idx) => (
                      <div key={idx} className="text-xs font-mono text-gray-400 pl-4">
                        <span className="text-gray-500">{input.type}</span>{' '}
                        {input.name && <span className="text-white">{input.name}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {func.outputs && func.outputs.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Outputs:</p>
                  <div className="space-y-1">
                    {func.outputs.map((output, idx) => (
                      <div key={idx} className="text-xs font-mono text-gray-400 pl-4">
                        <span className="text-gray-500">{output.type}</span>{' '}
                        {output.name && <span className="text-white">{output.name}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

