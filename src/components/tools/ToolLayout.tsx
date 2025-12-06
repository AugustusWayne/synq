import { ReactNode } from 'react'
import { Navbar } from '@/components/ui'

interface ToolLayoutProps {
  children: ReactNode
}

export function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
      <Navbar />
      <main className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

