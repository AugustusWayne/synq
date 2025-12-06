import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/ui'

export function ToolLoadingState() {
  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 pt-32">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin h-12 w-12 text-[#C3FF32] mx-auto mb-4" />
            <div className="absolute inset-0 bg-[#C3FF32]/20 blur-xl rounded-full"></div>
          </div>
          <p className="text-gray-400 text-lg">Verifying subscription...</p>
        </div>
      </main>
    </div>
  )
}

