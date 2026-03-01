"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Sparkles, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"

export default function StudentLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#F0EBF8] to-[#E8D9FF] flex items-center justify-center relative overflow-hidden">
      
      {/* Animated blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-10 left-10 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none"
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-8 z-20"
      >
        <Link href="/">
          <h1 className="text-3xl font-bold hidden md:block" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <span className="text-violet-500">Mentoreo</span>
          </h1>
        </Link>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-5 py-2.5 rounded-full mb-10 shadow-sm border border-purple-200"
        >
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-purple-700 font-semibold text-sm">Student Platform</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-6xl sm:text-7xl font-bold text-gray-900 mb-4 leading-tight"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          Coming<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-700">
            Soon ✨
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-gray-500 text-lg mb-10 leading-relaxed"
        >
          We're building something great for students.<br />
          Real advice from verified seniors — launching very soon.
        </motion.p>

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-violet-600"
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <Link href="/">
            <Button variant="outline" className="border-2 cursor-pointer border-purple-400 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-transparent rounded-full px-8 py-5 font-semibold transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}