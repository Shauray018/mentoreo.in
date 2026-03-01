"use client"

import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Variants } from "framer-motion";
import { 
  IndianRupee, 
  Clock, 
  TrendingUp,
  Users,
  Star,
  CheckCircle2,
  Award,
  MessageSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.15 } },
  viewport: { once: true }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function MentorLanding() {
  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="text-center">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full mb-12 shadow-sm border border-orange-200"
            >
              <TrendingUp className="h-4 w-4 text-[#FF7A1F]" />
              <span className="text-[#B85C1F] font-semibold">Early Mentor Program — Join Now</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl sm:text-6xl  lg:text-7xl mb-8 leading-tight font-bold"
            >
              <span className="text-gray-900">Your College ID is a Debit Card. </span>
              <span className="text-[#FF7A1F]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Swipe it. 💳
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Help confused aspirants make better college decisions through quick chat sessions. Earn{' '}
              <span className="text-[#FF7A1F] font-bold">₹3K–15K/month</span> sharing what you already know.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/onboard">
                <Button className="bg-gradient-to-r cursor-pointer from-[#FF7A1F] to-[#FF5A00] hover:from-[#FF6A0F] hover:to-[#FF4A00] text-white rounded-full px-10 py-7 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Apply as a Mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" className="border-2 cursor-pointer border-[#FF7A1F] text-[#FF7A1F] hover:bg-gradient-to-r hover:from-[#FF7A1F] hover:to-[#FF5A00] hover:text-white hover:border-transparent rounded-full px-10 py-7 text-lg font-semibold transition-all">
                  How It Works
                </Button>
              </a>
            </motion.div>

            {/* Bottom Features */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-8 text-gray-600"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#FF7A1F]" />
                <span className="font-medium">Quick 5-min sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#FF7A1F]" />
                <span className="font-medium">Flexible schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#FF7A1F]" />
                <span className="font-medium">Build your brand</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section - 3 Steps */}
      <section id="how-it-works" className="bg-[#F5F1EB] py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Start earning in less than 24 hours
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                step: '1', 
                title: 'Sign Up & Get Verified', 
                desc: 'Quick form + college ID verification within 24 hours',
                icon: CheckCircle2,
                gradient: 'from-orange-400 to-orange-600'
              },
              { 
                step: '2', 
                title: 'Set Your Availability', 
                desc: 'Choose when you\'re available to chat with students',
                icon: Calendar,
                gradient: 'from-purple-400 to-purple-600'
              },
              { 
                step: '3', 
                title: 'Talk & Earn', 
                desc: 'Help students decide better, get paid weekly to your UPI',
                icon: IndianRupee,
                gradient: 'from-green-400 to-green-600'
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.step}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center cursor-pointer"
                >
                  <Card className="bg-white rounded-3xl border-0 shadow-md hover:shadow-2xl transition-shadow h-full">
                    <CardContent className="p-8">
                      <div className={`bg-gradient-to-br ${item.gradient} text-white w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-lg`} style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        {item.step}
                      </div>
                      <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Icon className="h-8 w-8 text-[#FF7A1F]" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div 
            {...fadeInUp}
            className="text-center mt-12"
          >
            <Link href="/onboard">
              <Button className="bg-gradient-to-r from-[#FF7A1F] to-[#FF5A00] hover:from-[#FF6A0F] hover:to-[#FF4A00] text-white rounded-full px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Get Started Now
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Mentor Section */}
      <section id="why-mentor" className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Become a <span className="text-[#FF7A1F]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Mentor?</span>
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              More than just a side hustle
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: IndianRupee,
                title: 'Flexible Income',
                desc: 'Earn ₹3K-15K/month working just 2-4 hours weekly. Competitive rates based on your college.',
                color: 'bg-orange-100',
                iconColor: 'text-orange-600'
              },
              {
                icon: Clock,
                title: 'Work on Your Time',
                desc: 'No fixed hours. Choose when you want to be available. Perfect for busy students.',
                color: 'bg-blue-100',
                iconColor: 'text-blue-600'
              },
              {
                icon: Award,
                title: 'Build Your Brand',
                desc: 'Get verified badge, build your profile, and establish yourself as an expert.',
                color: 'bg-purple-100',
                iconColor: 'text-purple-600'
              },
              {
                icon: Users,
                title: 'Make Real Impact',
                desc: 'Your advice can save someone from 4 years of regret. Help juniors decide better.',
                color: 'bg-green-100',
                iconColor: 'text-green-600'
              },
              {
                icon: MessageSquare,
                title: 'Quick Sessions',
                desc: 'Most sessions are just 5-15 minutes via chat. Voice calls available on request.',
                color: 'bg-pink-100',
                iconColor: 'text-pink-600'
              },
              {
                icon: Sparkles,
                title: 'Weekly Payouts',
                desc: 'Get paid every week directly to your bank or UPI. Fast and hassle-free.',
                color: 'bg-yellow-100',
                iconColor: 'text-yellow-600'
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-white border-0 shadow-sm hover:shadow-xl transition-all h-full rounded-3xl">
                    <CardContent className="p-8 text-center">
                      <div className={`${benefit.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <Icon className={`h-8 w-8 ${benefit.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <motion.section 
        {...fadeInUp}
        className="bg-[#F5F1EB] py-24"
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What <span className="text-[#FF7A1F]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Mentors</span> Say
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Real students, real earnings
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                name: 'Priya Sharma',
                college: 'IIT Delhi, CS 3rd Year',
                earning: '₹12.5K/month',
                quote: "I spend 3-4 hours weekly helping juniors and earn enough to pay my rent! Plus, it feels amazing to help confused students.",
                avatar: '👩‍💻'
              },
              {
                name: 'Rahul Verma',
                college: 'BITS Pilani, Mech 4th Year',
                earning: '₹8.2K/month',
                quote: "Easiest side hustle ever. I just talk about my college experience during chai breaks. The questions are fun!",
                avatar: '👨‍🎓'
              },
              {
                name: 'Aisha Khan',
                college: 'IIM Bangalore, MBA',
                earning: '₹15.6K/month',
                quote: "Best decision! I help CAT aspirants while building my consulting profile. Total win-win.",
                avatar: '👩‍🏫'
              }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="text-4xl">{testimonial.avatar}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{testimonial.college}</p>
                        <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {testimonial.earning}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#FF7A1F] text-[#FF7A1F]" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Banner with Gradient */}
      <motion.section 
        {...fadeInUp}
        className="py-24 px-6 sm:px-8 lg:px-12"
      >
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#FF7A1F] via-[#FF6A0F] to-[#FF5A00] rounded-[3rem] py-20 px-8 sm:px-12 relative overflow-hidden">
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
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
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
            className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
            >
              Be one of our first<br />
              100 founding mentors.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/90 mb-10 leading-relaxed font-normal max-w-3xl mx-auto"
            >
              Early mentors get priority placement, lower commission rates,<br className="hidden sm:block" />
              and the "Founding Mentor" badge forever. Spots are filling up fast.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <Link href="/onboard">
                <Button className="bg-white text-[#FF7A1F] hover:bg-gray-100 rounded-full px-12 py-7 text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all">
                  Apply Now — It's Free
                </Button>
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-white/80 text-base font-normal"
            >
              Takes less than 2 minutes. No commitment required.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  <span className="text-[#FF7A1F]">Mentoreo</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Clarity for the Price of a Snack. 🤯
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">For Mentors</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/onboard" className="hover:text-white transition-colors">Apply Now</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Earnings</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">For Students</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/browse" className="hover:text-white transition-colors">Find Mentors</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2026 Mentoreo. Made with 🧡 for students, by students.
          </div>
        </div>
      </footer>
    </div>
  );
}