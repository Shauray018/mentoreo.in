'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import clsx from 'clsx'
import institutions from '@/data/institutions.json'
import courses from '@/data/courses.json'
import branches from '@/data/branches.json'

// Service role client only used for hashing — safe here since this runs server-side
// Actually we'll hash via a Supabase RPC call from client using anon key (RPC is public)
// Password hashing happens in the insert RPC

// ─── Types ───────────────────────────────────────────────────────────────────
type FormData = {
  name: string
  phone: string
  email: string
  college: string
  course: string
  branch: string
  password: string
  confirmPassword: string
}

type SlideStatus = 'idle' | 'error' | 'loading' | 'success'

type Step = {
  id: keyof FormData
  question: string
  hint: string
  type: string
  placeholder: string
  validate: (v: string, formData?: FormData) => string | null
}

type Institution = {
  aishe_code: string
  name: string
  state: string
  district: string
}

const COLLEGE_OPTIONS = Array.from(
  new Set((institutions as Institution[]).map((i) => i.name.trim()).filter(Boolean))
).sort((a, b) => a.localeCompare(b))
const COURSE_OPTIONS = (courses as string[]).map((c) => c.trim()).filter(Boolean)
const BRANCH_OPTIONS = (branches as string[]).map((b) => b.trim()).filter(Boolean)

// ─── Steps config ────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: 'name',
    question: 'What is your full name?',
    hint: "We'll use this on your profile.",
    type: 'text',
    placeholder: 'Type your answer here...',
    validate: (v) => v.trim().length < 2 ? 'Please enter your full name.' : null,
  },
  {
    id: 'phone',
    question: 'Your phone number?',
    hint: 'Include country code — e.g. +91 9876543210',
    type: 'tel',
    placeholder: '+91 9876543210',
    validate: (v) => {
      const digits = v.replace(/\D/g, '')
      return digits.length < 10 ? 'Please enter a valid phone number.' : null
    },
  },
  {
    id: 'email',
    question: 'Your student email?',
    hint: 'Use your official college email — or click "Use Google" to fill it instantly.',
    type: 'email',
    placeholder: 'you@college.edu.in',
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Please enter a valid email address.',
  },
  {
    id: 'college',
    question: 'Which college do you attend?',
    hint: 'Full name of your institution.',
    type: 'text',
    placeholder: 'Punjab Engineering College, Chandigarh',
    validate: (v) => v.trim().length < 3 ? 'Please enter your college name.' : null,
  },
  {
    id: 'course',
    question: "What's your course?",
    hint: 'Btech, MBBS, Barch...',
    type: 'text',
    placeholder: 'Bachelors in Technology',
    validate: (v) => v.trim().length < 2 ? 'Please enter your course.' : null,
  },
  {
    id: 'branch',
    question: "What's your branch or major?",
    hint: 'Optional — e.g. Computer Science, Mechanical Engineering, ECE…',
    type: 'text',
    placeholder: 'Computer Science & Engineering',
    validate: (v) => {
      const t = v.trim()
      return t.length === 0 ? null : (t.length < 2 ? 'Please enter your branch.' : null)
    },
  },
  {
    id: 'password',
    question: 'Create a password',
    hint: 'At least 8 characters.',
    type: 'password',
    placeholder: '••••••••',
    validate: (v) => v.length < 8 ? 'Password must be at least 8 characters.' : null,
  },
  {
    id: 'confirmPassword',
    question: 'Confirm your password',
    hint: 'Type it once more to make sure.',
    type: 'password',
    placeholder: '••••••••',
    validate: (v, formData) => {
      if (!v) return 'Please confirm your password.'
      if (formData && v !== formData.password) return 'Passwords do not match.'
      return null
    },
  },
]

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SignupPage() {
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [animKey, setAnimKey] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    college: '',
    course: '',
    branch: '',
    password: '',
    confirmPassword: '',
  })
  const [status, setStatus] = useState<SlideStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showSuggestionsFor, setShowSuggestionsFor] = useState<keyof FormData | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Pre-fill email from Google OAuth redirect, start from step 0 ──
  useEffect(() => {
    const prefillEmail = searchParams.get('email')
    if (prefillEmail) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(prefillEmail) }))
      setCurrentStep(0)
      setAnimKey(k => k + 1)
    }
  }, [searchParams])

  const step = STEPS[currentStep]
  const progress = (currentStep / STEPS.length) * 100
  const isLastStep = currentStep === STEPS.length - 1

  // Password steps should always show as password input type
  const inputType = (step.id === 'password' || step.id === 'confirmPassword') ? 'password' : step.type

  const suggestionState = useMemo(() => {
    if (currentStep >= STEPS.length) return { id: null, list: [] as string[] }
    const id = STEPS[currentStep].id
    const value = formData[id].trim()
    if (value.length < 1) return { id, list: [] as string[] }
    const q = value.toLowerCase()
    let source: string[] = []
    if (id === 'college') source = COLLEGE_OPTIONS
    if (id === 'course') source = COURSE_OPTIONS
    if (id === 'branch') source = BRANCH_OPTIONS
    return { id, list: source.filter((name) => name.toLowerCase().includes(q)).slice(0, 4) }
  }, [currentStep, formData])

  // Auto-focus input on step change
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [currentStep, animKey])

  const goToStep = useCallback((next: number, dir: 'up' | 'down') => {
    setDirection(dir)
    setAnimKey(k => k + 1)
    setCurrentStep(next)
    setStatus('idle')
    setErrorMsg('')
  }, [])

  // ── Handle advancing to next step ──
  async function handleNext() {
    const value = formData[step.id]
    const validationError = step.validate(value, formData)
    if (validationError) {
      setStatus('error')
      setErrorMsg(validationError)
      return
    }

    if (isLastStep) {
      await handleSubmit()
    } else {
      goToStep(currentStep + 1, 'up')
    }
  }

  // ── Submit to Supabase — hash password via RPC ──
  async function handleSubmit() {
    setStatus('loading')
    setErrorMsg('Saving your details…')

    // Hash the password using pgcrypto via RPC
    const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', {
      password: formData.password,
    })

    if (hashError || !hashedPassword) {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
      console.error(hashError)
      return
    }

    const { error } = await supabase.from('signups').insert([{
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      college: formData.college,
      course: formData.course,
      branch: formData.branch,
      password: hashedPassword,
    }])

    if (error) {
      if (error.code === '23505') {
        setStatus('error')
        setErrorMsg('This email is already registered. Try signing in instead.')
      } else {
        setStatus('error')
        setErrorMsg('Something went wrong. Please try again.')
        console.error(error)
      }
      return
    }

    setSubmitted(true)
  }

  // ── Keyboard: Enter to advance ──
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNext()
    }
  }

  // ── Google prefill ──
  function handleGooglePrefill() {
    signIn('google', { callbackUrl: '/onboard' })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex flex-col items-center justify-center text-center px-6">
        <div className="text-5xl mb-6 w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          🎉
        </div>
        <h1 className="text-4xl md:text-5xl text-stone-900 tracking-tight mb-3">
          You're on the list!
        </h1>
        <p className="text-stone-400 mb-2">
          We'll reach out to{' '}
          <strong className="text-stone-700 font-semibold">{formData.email}</strong> soon.
        </p>
        <p className="text-stone-400 text-sm mb-10">
          Welcome to Mentoreo, {formData.name.split(' ')[0]}.
        </p>
        <Link
          href="/mentor/login"
          className="bg-orange-500 hover:bg-orange-700 text-white font-semibold
                     px-7 py-3 rounded-full transition-all duration-200 hover:scale-105"
        >
          Sign in →
        </Link>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex flex-1 flex-col w-full overflow-hidden">

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-orange-100 z-50">
        <div
          className="h-full bg-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Nav */}
      <nav className="fixed top-[3px] left-0 right-0 z-40 flex items-center justify-between px-8 py-4">
        <Link href="/mentor" className="font-bold text-orange-500 text-3xl">
          <span style={{ fontFamily: 'Fredoka, sans-serif' }} className="text-[#FF7A1F]">
            Mentoreo
          </span>
        </Link>
        <span className="text-sm text-stone-400 font-medium">
          {currentStep + 1} / {STEPS.length}
        </span>
      </nav>

      {/* Slide */}
      <div className="flex-1 flex flex-col w-full items-center justify-center px-6 md:px-[12vw] pt-24 pb-24">
        <div
          key={animKey}
          className={clsx(
            direction === 'up' ? 'animate-slide-up' : 'animate-slide-down'
          )}
        >
          {/* Question number */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-md flex items-center justify-center">
              {currentStep + 1}
            </span>
            <span className="text-orange-500 text-sm font-medium">→</span>
          </div>

          {/* Question */}
          <h2 className="text-4xl md:text-5xl text-stone-900 tracking-tight leading-[1.1] mb-2 max-w-lg">
            {step.question}
          </h2>
          <p className="text-stone-400 text-sm mb-8">{step.hint}</p>

          {/* Input */}
          <div className="relative max-w-lg mb-4 group">
            <input
              ref={inputRef}
              type={inputType}
              value={formData[step.id]}
              placeholder={step.placeholder}
              autoComplete="off"
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, [step.id]: e.target.value }))
                if (status === 'error') { setStatus('idle'); setErrorMsg('') }
              }}
              onFocus={() => {
                if (step.id === 'college' || step.id === 'course' || step.id === 'branch') {
                  setShowSuggestionsFor(step.id)
                }
              }}
              onBlur={() => {
                if (step.id === 'college' || step.id === 'course' || step.id === 'branch') {
                  setTimeout(() => setShowSuggestionsFor(null), 120)
                }
              }}
              className={clsx(
                'w-full bg-transparent border-b-2 text-2xl font-light text-stone-900',
                'py-3 outline-none transition-colors duration-200 placeholder:text-orange-300',
                'autofill:bg-transparent',
                status === 'error' ? 'border-red-400' :
                status === 'success' ? 'border-green-500' :
                'border-stone-200 focus:border-orange-500'
              )}
            />

            {/* Suggestions dropdown */}
            {(step.id === 'college' || step.id === 'course' || step.id === 'branch') &&
              showSuggestionsFor === step.id &&
              suggestionState.id === step.id &&
              suggestionState.list.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-stone-200
                              bg-white shadow-lg shadow-orange-100/60 overflow-hidden z-20">
                {suggestionState.list.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, [step.id]: name }))
                      setShowSuggestionsFor(null)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-stone-700
                               hover:bg-orange-50 hover:text-stone-900 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status message */}
          <p className={clsx(
            'text-sm h-5 mb-6 transition-colors',
            status === 'error' ? 'text-red-500' :
            status === 'success' ? 'text-green-600' :
            status === 'loading' ? 'text-stone-400' :
            'text-transparent'
          )}>
            {errorMsg || 'placeholder'}
          </p>

          {/* Buttons row */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleNext}
              disabled={status === 'loading'}
              className={clsx(
                'inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-700',
                'text-white font-semibold text-sm px-6 py-2.5 rounded-lg',
                'transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-orange-200',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
              )}
            >
              {status === 'loading' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  <span>Working…</span>
                </>
              ) : isLastStep ? (
                <span>Submit <span className="opacity-70">✓</span></span>
              ) : (
                <span>OK <span className="opacity-70">✓</span></span>
              )}
            </button>

            {/* Google prefill — only on email step */}
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleGooglePrefill}
                className="inline-flex items-center gap-2 border border-stone-200 bg-white
                           text-stone-600 text-sm px-4 py-2.5 rounded-lg
                           hover:border-orange-400 hover:text-orange-500 transition-all duration-150"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Use Google
              </button>
            )}
          </div>

          {/* Enter hint */}
          <p className="text-stone-300 text-xs mt-4">
            Press <kbd className="border border-stone-200 bg-white rounded px-1.5 py-0.5 text-stone-400">Enter ↵</kbd> to continue
          </p>
        </div>
      </div>

      {/* Arrow nav */}
      <div className="fixed bottom-6 right-6 flex gap-2">
        <button
          onClick={() => currentStep > 0 && goToStep(currentStep - 1, 'down')}
          disabled={currentStep === 0}
          className="w-10 h-10 rounded-xl border border-stone-200 bg-white text-stone-600
                     flex items-center justify-center hover:border-orange-400 hover:text-orange-500
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
          aria-label="Previous"
        >
          ↑
        </button>
        <button
          onClick={handleNext}
          disabled={status === 'loading'}
          className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-700 text-white
                     flex items-center justify-center disabled:opacity-50
                     disabled:cursor-not-allowed transition-all duration-150"
          aria-label="Next"
        >
          ↓
        </button>
      </div>
    </div>
  )
}