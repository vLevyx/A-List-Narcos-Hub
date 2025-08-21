/** @type {import('tailwindcss').Config} */
module.exports = {
 content: [
   './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
   './src/components/**/*.{js,ts,jsx,tsx,mdx}',
   './src/app/**/*.{js,ts,jsx,tsx,mdx}',
 ],
 safelist: [
   // Force include color classes for dynamic generation
   'bg-amber-500/20',
   'text-amber-300', 
   'border-amber-500/30',
   'bg-emerald-500/20',
   'text-emerald-300',
   'border-emerald-500/30',
   'bg-blue-500/20',
   'text-blue-300',
   'border-blue-500/30',
   'bg-purple-500/20',
   'text-purple-300',
   'border-purple-500/30',
   'bg-red-500/50',
   'text-red-100',
   'border-red-500'
 ],
 theme: {
   extend: {
     colors: {
       'background-primary': '#0f0f0f',
       'background-secondary': '#1a1a1a',
       'accent-primary': '#8b5cf6',
       'accent-secondary': '#a78bfa',
       'accent-light': '#c4b5fd',
       'text-primary': '#ffffff',
       'text-secondary': '#a0a0a0',
       'border-primary': 'rgba(255, 255, 255, 0.1)',
       'purple': {
         400: '#a78bfa',
         500: '#8b5cf6',
         600: '#7c3aed',
         700: '#6d28d9',
       }
     },
     fontFamily: {
       outfit: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
     },
     animation: {
       'fade-in': 'fadeIn 0.5s ease-in-out',
       'slide-up': 'slideUp 0.3s ease-out',
       'pulse-slow': 'pulse 3s ease-in-out infinite',
       'glow': 'glow 2s ease-in-out infinite alternate',
     },
     keyframes: {
       fadeIn: {
         '0%': { opacity: '0' },
         '100%': { opacity: '1' },
       },
       slideUp: {
         '0%': { transform: 'translateY(10px)', opacity: '0' },
         '100%': { transform: 'translateY(0)', opacity: '1' },
       },
       glow: {
         '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
         '100%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)' },
       },
     },
     backgroundImage: {
       'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
       'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2d1b3d 50%, #1a1a1a 100%)',
     },
   },
 },
 plugins: [],
}