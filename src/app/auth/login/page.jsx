'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5"
import { AnimatedLogo } from "@/components/logo/LogoAnimation"

const BackgroundPattern = () => (
  <svg className="absolute inset-0 w-full h-full z-0" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#27aae2" opacity="0.3" />
      </pattern>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#27aae2', stopOpacity: 0.1 }} />
        <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const router = useRouter()

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: '', password: '' }

    if (!email) {
      newErrors.email = 'Email is verplicht'
      isValid = false
    } else if (!email.includes('@')) {
      newErrors.email = 'Ongeldig email adres'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Wachtwoord is verplicht'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Wachtwoord moet minimaal 6 karakters bevatten'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Er is iets misgegaan')
      }

      Cookies.set('token', data.token, {
        secure: 'true',
        sameSite: 'None',
      })
      document.dispatchEvent(new Event("authChange"))

      router.push('/')
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
<div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8">
  <BackgroundPattern />

  {/* Decorative shapes */}
  <div className="absolute inset-0 overflow-hidden z-0">
    <div className="absolute -top-1/4 -right-1/4 w-1/3 sm:w-1/2 h-1/3 sm:h-1/2 bg-[#27aae2]/10 rounded-full transform rotate-45"></div>
    <div className="absolute -bottom-1/4 -left-1/4 w-1/3 sm:w-1/2 h-1/3 sm:h-1/2 bg-[#27aae2]/5 rounded-full"></div>
  </div>

  {/* Content */}
  <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <div>
      <div className="flex justify-center">
        <AnimatedLogo />
      </div>
      <div className="text-center mt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welkom terug
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Log in om verder te gaan naar je account
        </p>
      </div>
    </div>
  </div>

  <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <div className="bg-white/90 backdrop-blur-lg py-6 sm:py-8 px-4 sm:px-6 shadow-xl sm:rounded-xl border border-white">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm`}
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700">
            Wachtwoord
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <IoEyeOffSharp className="h-5 w-5 text-gray-400" />
              ) : (
                <IoEyeSharp className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 text-[#27aae2] focus:ring-[#27aae2] border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm sm:text-base text-gray-700">
              Onthoud mij
            </label>
          </div>
          <div className="text-sm sm:text-base">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-[#27aae2] hover:text-[#1f8dbb] transition-colors"
            >
              Wachtwoord vergeten?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 sm:py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-[#27aae2] hover:bg-[#1f8dbb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#27aae2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Inloggen...
              </div>
            ) : (
              'Inloggen'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Nog geen account?</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/auth/register"
            className="w-full flex justify-center py-2 sm:py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#27aae2] transition-colors"
          >
            Registreer nu
          </Link>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}