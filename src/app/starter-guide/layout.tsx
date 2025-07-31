import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Starter Guide - A-List Hub',
  description: 'Complete beginner guide for Narcos Life - Learn the basics, tips, tricks, and strategies to get started.',
  keywords: 'narcos life, starter guide, beginner guide, tips, tricks, tutorial, new player',
  openGraph: {
    title: 'Starter Guide - A-List Hub',
    description: 'Complete beginner guide for Narcos Life players',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starter Guide - A-List Hub',
    description: 'Complete beginner guide for Narcos Life players',
  },
}

export default function StarterGuideLayout({
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