'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import clsx from 'clsx'

// ─── Types ───────────────────────────────────────────────────────────────────
type FormData = {
  name: string
  phone: string
  email: string
  college: string
  branch: string
}

type SlideStatus = 'idle' | 'error' | 'loading' | 'success'

type Step = {
  id: keyof FormData
  question: string
  hint: string
  type: string
  placeholder: string
  validate: (v: string) => string | null
}

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
    hint: 'Must be your official college email. We verify it\'s academic.',
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
    id: 'branch',
    question: "What's your branch or major?",
    hint: 'e.g. Computer Science, Mechanical Engineering, ECE…',
    type: 'text',
    placeholder: 'Computer Science & Engineering',
    validate: (v) => v.trim().length < 2 ? 'Please enter your branch.' : null,
  },
]

const APY_TOKEN = process.env.NEXT_PUBLIC_APY_TOKEN! || "APY0bKwMKdBM2AXQkwovut6CAQnxqiYp7vmgsnyaxlO3nkibuRx7J9NdJW6UJCU47041U"

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [animKey, setAnimKey] = useState(0)
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', email: '', college: '', branch: '' })
  const [status, setStatus] = useState<SlideStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const step = STEPS[currentStep]
  const progress = (currentStep / STEPS.length) * 100
  const isLastStep = currentStep === STEPS.length - 1

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

  // ── Validate academic email via APY Hub ──
  async function validateAcademicEmail(email: string): Promise<boolean> {
    const res = await fetch('https://api.apyhub.com/validate/email/academic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apy-token': APY_TOKEN,
      },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()
    return json.data === true
  }

  // ── Handle advancing to next step ──
  async function handleNext() {
    const value = formData[step.id]
    const validationError = step.validate(value)
    if (validationError) {
      setStatus('error')
      setErrorMsg(validationError)
      return
    }

    // Extra: validate academic email on step 2 (index 2)
    // if (step.id === 'email') {
    //   setStatus('loading')
    //   setErrorMsg('Verifying your student email…')
    //   try {
    //     const isAcademic = await validateAcademicEmail(value)
    //     if (!isAcademic) {
    //       setStatus('error')
    //       setErrorMsg("This doesn't look like a valid student email. Please use your official college email.")
    //       return
    //     }
    //     setStatus('success')
    //     setErrorMsg('✓ Valid academic email!')
    //     await new Promise(r => setTimeout(r, 600))
    //   } catch {
    //     setStatus('error')
    //     setErrorMsg('Could not verify email right now. Please try again.')
    //     return
    //   }
    // }

    if (isLastStep) {
      await handleSubmit()
    } else {
      goToStep(currentStep + 1, 'up')
    }
  }

  // ── Submit to Supabase ──
  async function handleSubmit() {
    setStatus('loading')
    setErrorMsg('Saving your details…')

    const { error } = await supabase.from('signups').insert([{
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      college: formData.college,
      branch: formData.branch,
    }])

    if (error) {
      // Handle duplicate email gracefully
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

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-6">
        <div className="animate-pop text-5xl mb-6 w-20 h-20 rounded-full bg-orange-100
                        flex items-center justify-center">
          🎉
        </div>
        <h1 className=" text-4xl md:text-5xl text-stone-900 tracking-tight mb-3">
          You're on the list!
        </h1>
        <p className="text-stone-400 mb-2">
          We'll reach out to{' '}
          <strong className="text-stone-700 font-semibold">{formData.email}</strong> soon.
        </p>
        <p className="text-stone-400 text-sm mb-10">Welcome to Mentoreo, {formData.name.split(' ')[0]}.</p>
        <Link
          href="/mentor"
          className="bg-orange-500 hover:bg-orange-700 text-white font-semibold
                     px-7 py-3 rounded-full transition-all duration-200 hover:scale-105"
        >
          ← Back to Home
        </Link>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex flex-1 flex-col  w-full overflow-hidden">

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-orange-100 z-50">
        <div
          className="h-full bg-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Nav */}
      <nav className="fixed top-[3px] left-0 right-0 z-40 flex items-center justify-between px-8 py-4">
        <Link href="/mentor" className="font-bold text-orange-500 text-3xl ">
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
            <span className="w-6 h-6 bg-orange-500 text-white text-xs font-bold
                             rounded-md flex items-center justify-center">
              {currentStep + 1}
            </span>
            <span className="text-orange-500 text-sm font-medium">→</span>
          </div>

          {/* Question */}
          <h2 className=" text-4xl md:text-5xl text-stone-900 tracking-tight
                         leading-[1.1] mb-2 max-w-lg">
            {step.question}
          </h2>
          <p className="text-stone-400 text-sm mb-8">{step.hint}</p>

          {/* Input */}
          <div className="relative max-w-lg mb-4 group">
            <input
              ref={inputRef}
              type={step.type}
              value={formData[step.id]}
              placeholder={step.placeholder}
              autoComplete="off"
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, [step.id]: e.target.value }))
                if (status === 'error') { setStatus('idle'); setErrorMsg('') }
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

          {/* OK button */}
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
                <span className="w-4 h-4 border-2 border-white/40 border-t-white
                                  rounded-full animate-spin-slow inline-block" />
                <span>Working…</span>
              </>
            ) : isLastStep ? (
              <>Submit <span className="opacity-70">✓</span></>
            ) : (
              <>OK <span className="opacity-70">✓</span></>
            )}
          </button>

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