'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, HelpCircle } from 'lucide-react'

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <FileText className="w-6 h-6 text-accent-primary" />
        Frequently Asked Questions
      </h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-white/10 rounded-xl overflow-hidden bg-background-secondary/30"
          >
            {/* FAQ Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200 text-left"
              aria-expanded={expandedFAQ === index}
              aria-controls={`faq-${index}`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-accent-primary flex-shrink-0" />
                <span className="text-lg font-semibold text-white">{faq.question}</span>
              </div>
              
              <motion.div
                animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 ml-4"
              >
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              </motion.div>
            </button>

            {/* FAQ Answer */}
            <AnimatePresence>
              {expandedFAQ === index && (
                <motion.div
                  id={`faq-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-white/10">
                    <div className="pt-4">
                      <p className="text-text-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      {/* Additional Help Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <HelpCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-text-secondary mb-4">
              If you can't find the answer you're looking for, don't hesitate to reach out to our community or support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://discord.gg/9HaxJmPSpH"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-purple text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-200"
              >
                Ask in Discord
              </a>
              <button className="border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}