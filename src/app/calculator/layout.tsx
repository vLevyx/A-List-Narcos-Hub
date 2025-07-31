import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crafting Calculator | A-List Hub',
  description: 'Advanced crafting calculator for Narcos Life - calculate recipes, costs, and optimize your production.',
  keywords: 'crafting calculator, narcos life, recipe calculator, production optimizer',
}

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}