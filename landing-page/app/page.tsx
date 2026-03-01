"use client"

import { Card, CardContent } from './components/ui/card';
import Link from 'next/link';
import { Button } from './components/ui/button';
import { GraduationCap, Users, ArrowRight, TrendingUp, Clock, Heart, BadgeCheck, Sparkles, Target } from 'lucide-react';
import { motion } from "motion/react"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function ChoiceLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#FFF5EC] to-[#FFE8D9] flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-10 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
      />

      {/* Logo Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 sm:top-8 sm:left-8 z-20"
      >
        <Link href={"/"}>
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span style={{ fontFamily: 'Fredoka, sans-serif' }} className="text-[#FF7A1F] hidden md:block ">
              Mentoreo
            </span>
          </h1>
        </Link>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 relative z-10 w-full flex flex-col justify-center min-h-screen">
        {/* Main Heading */}
        <div
          className="text-xl text-gray-600 text-center mb-8 font-medium"
        >
          Choose your path
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mentor Card */}
          <motion.div
            {...scaleIn}
            transition={{ delay: 0.3 }}
          >
            <Link href="/mentor">
              <Card className="bg-white rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group h-full overflow-hidden">
                <CardContent className="p-10 text-center relative">
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A1F]/5 to-[#FF7A1F]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-orange-400 to-orange-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow"
                    >
                      <GraduationCap className="h-10 w-10 text-white" />
                    </motion.div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      I'm a Mentor
                    </h3>
                    
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Share your experience and earn ₹3K-15K/month
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-gray-700">
                        <TrendingUp className="h-5 w-5 text-[#FF7A1F] flex-shrink-0" />
                        <span className="text-sm font-medium">Earn ₹100-500/hour</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-5 w-5 text-[#FF7A1F] flex-shrink-0" />
                        <span className="text-sm font-medium">Flexible schedule</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Heart className="h-5 w-5 text-[#FF7A1F] flex-shrink-0" />
                        <span className="text-sm font-medium">Help thousands of students</span>
                      </div>
                    </div>

                    <Button className="bg-gradient-to-r from-[#FF7A1F] to-[#FF5A00] hover:from-[#FF6A0F] hover:to-[#FF4A00] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all w-full">
                      Start Earning
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Student Card */}
          <motion.div
            {...scaleIn}
            transition={{ delay: 0.5 }}
          >
            <Link href="/student">
              <Card className="bg-white rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group h-full overflow-hidden">
                <CardContent className="p-10 text-center relative">
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow"
                    >
                      <Users className="h-10 w-10 text-white" />
                    </motion.div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      I'm a Student
                    </h3>
                    
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Get real advice from verified seniors for ₹9/min
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-gray-700">
                        <BadgeCheck className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium">Verified college students</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium">5-minute quick sessions</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Target className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium">Make smart decisions</span>
                      </div>
                    </div>

                    <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all w-full">
                      Find Mentors
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
