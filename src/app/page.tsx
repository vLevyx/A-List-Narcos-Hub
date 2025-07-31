import { HeroSection } from '@/components/home/HeroSection'
import { AboutSection } from '@/components/home/AboutSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import ClientWrapper from '@/components/ClientWrapper'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20" />
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-2xl float" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Radial highlights */}
        <div className="absolute top-0 left-1/2 w-[800px] h-[600px] -translate-x-1/2 bg-gradient-radial from-purple-500/5 via-purple-500/2 to-transparent" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] -translate-x-1/2 bg-gradient-radial from-purple-600/5 via-purple-600/2 to-transparent" />
      </div>

      {/* Content with proper z-index */}
      <div className="relative z-10">
        <HeroSection />
        <AboutSection />
        <TestimonialsSection />
      </div>
      
      {/* Client-side functionality */}
      <ClientWrapper />
    </div>
  )
}