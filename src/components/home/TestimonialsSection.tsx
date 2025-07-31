'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "The Crafting Calculator saved me hours — can't play without it.",
    author: "Alexa Knox",
    role: "A-List Vice President",
    rating: 5
  },
  {
    quote: "Few match the knowledge and experience The A-List brings.",
    author: "Hamish Macbeth",
    role: "Community Leader",
    rating: 5
  },
  {
    quote: "Helps with EMS",
    author: "Stagger Lee",
    role: "LakeSide EMS",
    rating: 5
  },
  {
    quote: "Super helpful and easy tools to use, definitely a must-try for everyone!",
    author: "Xena Ramirez",
    role: "New Player",
    rating: 5
  }
]

export function TestimonialsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-300">Player Reviews</span>
        </div>
        
        <h3 className="text-4xl font-bold text-white mb-4">
          What <span className="gradient-text">Players Say</span>
        </h3>
        
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Trusted by thousands of ELAN Life players worldwide
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="text-2xl font-bold text-white">5.0/5</div>
            <div className="text-sm text-white/70">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">99%</div>
            <div className="text-sm text-white/70">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 relative"
          >
            {/* Quote Icon */}
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Quote className="w-4 h-4 text-white" />
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            {/* Quote */}
            <blockquote className="text-white/90 text-lg italic leading-relaxed mb-6">
              "{testimonial.quote}"
            </blockquote>
            
            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-purple-400 font-bold text-lg">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="font-semibold text-purple-300">{testimonial.author}</div>
                <div className="text-sm text-white/60">{testimonial.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center mt-12"
      >
        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 max-w-2xl mx-auto">
          <h4 className="text-2xl font-bold text-white mb-4">
            Join the Community
          </h4>
          <p className="text-white/80 mb-6">
            Experience the tools that thousands of players rely on every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/whitelist"
              className="btn-primary px-6 py-3 rounded-lg font-semibold hover:shadow-purple-500/25"
            >
              Get Started Free
            </a>
            <a
              href="https://discord.gg/9HaxJmPSpH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-6 py-3 rounded-lg font-semibold"
            >
              Join Discord
            </a>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}