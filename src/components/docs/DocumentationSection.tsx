'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Users, 
  Shield, 
  Zap 
} from 'lucide-react'

interface DocumentationItem {
  title: string
  content: string
}

interface DocumentationSectionData {
  id: string
  title: string
  description: string
  iconName: string
  color: string
  bgColor: string
  borderColor: string
  items: DocumentationItem[]
}

interface DocumentationSectionProps {
  section: DocumentationSectionData
}

// Icon mapping to avoid passing functions as props
const iconMap = {
  BookOpen,
  Users,
  Shield,
  Zap
}

export function DocumentationSection({ section }: DocumentationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const IconComponent = iconMap[section.iconName as keyof typeof iconMap]

  const toggleSection = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setExpandedItem(null) // Close any open items when collapsing section
    }
  }

  const toggleItem = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  // Format content with proper line breaks and styling
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Handle bold text
      const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      
      return (
        <div
          key={index}
          className="mb-4 last:mb-0"
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      )
    })
  }

  return (
    <div className={`${section.bgColor} ${section.borderColor} border rounded-2xl overflow-hidden hover:bg-opacity-80 transition-all duration-300`}>
      {/* Section Header */}
      <button
        onClick={toggleSection}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
        aria-expanded={isExpanded}
        aria-controls={`section-${section.id}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${section.bgColor} rounded-lg flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${section.color}`} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
            <p className="text-text-secondary text-sm">{section.description}</p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-5 h-5 ${section.color}`} />
        </motion.div>
      </button>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`section-${section.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-lg overflow-hidden bg-black/20"
                  >
                    {/* Item Header */}
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200 text-left"
                      aria-expanded={expandedItem === index}
                      aria-controls={`item-${section.id}-${index}`}
                    >
                      <span className="text-white font-medium">{item.title}</span>
                      <motion.div
                        animate={{ rotate: expandedItem === index ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-text-secondary" />
                      </motion.div>
                    </button>

                    {/* Item Content */}
                    <AnimatePresence>
                      {expandedItem === index && (
                        <motion.div
                          id={`item-${section.id}-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-white/10">
                            <div className="pt-4 text-text-secondary leading-relaxed prose prose-invert max-w-none">
                              {formatContent(item.content)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}