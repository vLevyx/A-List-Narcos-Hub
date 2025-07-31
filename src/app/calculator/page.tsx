import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crafting Calculator - A-List Hub',
  description: 'Advanced crafting calculator for Narcos Life - Calculate materials, costs, and optimize your crafting strategy.',
  keywords: 'narcos life, crafting calculator, materials, costs, optimization, gaming tools',
  openGraph: {
    title: 'Crafting Calculator - A-List Hub',
    description: 'Advanced crafting calculator for Narcos Life players',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crafting Calculator - A-List Hub',
    description: 'Advanced crafting calculator for Narcos Life players',
  },
}

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}