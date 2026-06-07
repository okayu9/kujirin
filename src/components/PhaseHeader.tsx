import type { ReactNode } from 'react'

interface PhaseHeaderProps {
  step: number
  title: string
  description: ReactNode
}

export function PhaseHeader({ step, title, description }: PhaseHeaderProps) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-amber-200">
      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold shadow">
        {step}
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
