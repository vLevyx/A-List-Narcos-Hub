// src/components/ui/CustomDropdown.tsx
'use client'
import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
}

interface CustomDropdownProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function CustomDropdown({ value, onChange, options, placeholder, className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between text-white bg-transparent 
                   focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 rounded-xl transition-all
                   hover:bg-white/5"
      >
        <span className={selectedOption?.label ? 'text-white' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#2a2a2a] border border-white/20 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors 
                         first:rounded-t-xl last:rounded-b-xl"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}