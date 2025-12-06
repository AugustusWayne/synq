import { CheckCircle2, LucideIcon } from 'lucide-react'

interface ToolHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  hasSubscription?: boolean
}

export function ToolHeader({ icon: Icon, title, description, hasSubscription }: ToolHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center">
          <Icon size={24} className="text-[#C3FF32]" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {title}
          </h1>
          <p className="text-gray-400 text-sm">
            {description}
          </p>
        </div>
      </div>
      
      {hasSubscription && (
        <div className="inline-flex items-center gap-2 bg-[#C3FF32]/10 border border-[#C3FF32]/20 px-4 py-2 rounded-lg">
          <CheckCircle2 size={16} className="text-[#C3FF32]" />
          <span className="text-[#C3FF32] font-bold text-sm">Premium Active</span>
        </div>
      )}
    </div>
  )
}

