'use client'

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { AnimatedLogo } from "@/components/logo/LogoAnimation"
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const [userType, setUserType] = useState('craftsman')
  const [projectInterest, setProjectInterest] = useState('')
  const [otherProjectInterest, setOtherProjectInterest] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDocumentFile(file)
      setDocumentName(file.name)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  const handleDrop = (event: React.DragEvent, type: 'profile' | 'document') => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (type === 'profile') {
        if (file.type.startsWith('image/')) {
          setProfileImage(file);
        } else {
          toast.error('Alleen afbeeldingsbestanden zijn toegestaan voor profielfoto');
        }
      } else {
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          setDocumentFile(file);
          setDocumentName(file.name);
        } else {
          toast.error('Alleen PDF en afbeeldingsbestanden zijn toegestaan voor documenten');
        }
      }
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value)
    })
    submitData.append('userType', userType)
    if (userType === 'individual') {
      submitData.append('projectInterest', projectInterest)
      if (projectInterest === 'Others') {
        submitData.append('otherProjectInterest', otherProjectInterest)
      }
    }
    if (profileImage) {
      submitData.append('profilePicture', profileImage)
    }
    if (documentFile) {
      submitData.append('identificationDocument', documentFile)
    }

    try {
      const response = await axios.post('http://localhost:8000/api/users/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log(response);
      toast.success('Registration successful! You can now log in.')
      router.push('/auth/login')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || 'An error occurred during registration.')
      } else {
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundPattern />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#27aae2]/10 rounded-full transform rotate-45"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#27aae2]/5 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10">
        <div>
          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center">
              <AnimatedLogo />
            </div>
          </div>

          <div className="relative p-[2px] rounded-2xl">
            <div className="relative bg-white rounded-2xl">
              <div className="px-6 py-8">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Registreren bij ProConnect
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Vul je gegevens in om een account aan te maken
                  </p>
                </div>
              </div>

              <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl relative z-10">
                <div className="bg-white/90 backdrop-blur-lg py-8 px-4 sm:px-8 shadow-xl sm:rounded-xl sm:px-10 border border-white">
                  <div className="mb-8 text-center">
                    <div className="mb-2 text-sm font-medium text-gray-700">
                      Profielfoto
                    </div>
                    <div className="mb-4 flex justify-center">
                      <div className="relative inline-block">
                        <div
                          className="h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-gray-200 cursor-pointer overflow-hidden hover:opacity-90 transition-opacity border-4 border-[#27aae2]/20"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, "profile")}
                        >
                          {profileImage ? (
                            <img
                              src={URL.createObjectURL(profileImage)}
                              alt="Profielfoto"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 sm:h-20 w-16 sm:w-20"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#27aae2] text-white cursor-pointer hover:bg-[#27aae2]/90 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleProfileImageChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Klik om een profielfoto te uploaden
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 sm:gap-y-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          Voornaam
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Achternaam
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-mailadres
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm"
                        placeholder="naam@voorbeeld.nl"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Wachtwoord
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm pr-10"
                          placeholder="Minimaal 8 karakters"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <IoEyeOffSharp className="h-5 w-5" />
                          ) : (
                            <IoEyeSharp className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Telefoonnummer
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm"
                        placeholder="+31 6 12345678 of +32 4 12345678"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Formaat: +31612345678 (NL) of +32412345678 (BE)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                        Ik ben een
                      </label>
                      <select
                        id="userType"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm"
                      >
                        <option value="craftsman">Vakman</option>
                        <option value="individual">Particulier</option>
                      </select>
                    </div>

                    {/* ID Upload voor beide gebruikerstypen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload je identiteitsbewijs
                      </label>
                      <div
                        className="mt-1 flex justify-center items-center px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#27aae2] transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'document')}
                      >
                        <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-center">
                          <svg
                            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 014.243-4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                          <div className="flex flex-col sm:flex-row text-sm sm:text-base text-gray-600 items-center sm:justify-center">
                            <label
                              htmlFor="document-upload"
                              className="relative cursor-pointer rounded-md font-medium text-[#27aae2] hover:text-[#27aae2]/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#27aae2]"
                            >
                              <span>Upload een bestand</span>
                              <input
                                id="document-upload"
                                name="document-upload"
                                type="file"
                                className="sr-only"
                                ref={documentInputRef}
                                onChange={handleDocumentChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                              />
                            </label>
                            <p className="sm:pl-2 mt-2 sm:mt-0">of sleep het hierheen</p>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            PDF, PNG, JPG tot 10MB
                          </p>
                          {documentName && (
                            <p className="text-sm sm:text-base text-[#27aae2]">{documentName}</p>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm sm:text-base text-gray-500">
                        Upload een geldig identiteitsbewijs voor verificatie. Dit is nodig voor de
                        veiligheid van alle gebruikers.
                      </p>
                    </div>

                    {userType === 'individual' && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="projectInterest" className="block text-sm font-medium text-gray-700">
                            Welk project wilt u posten?
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Selecteer het type project dat u wilt laten uitvoeren
                          </p>
                          <select
                            id="projectInterest"
                            value={projectInterest}
                            onChange={(e) => setProjectInterest(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm"
                          >
                            <option value="">Kies uw type project</option>
                            <option value="Renovatie">Renovatie van woning</option>
                            <option value="Verbouwing">Verbouwing van ruimtes</option>
                            <option value="Onderhoud">Onderhoudswerkzaamheden</option>
                            <option value="Installatie">Installatie werkzaamheden</option>
                            <option value="Schilderwerk">Schilder werkzaamheden</option>
                            <option value="Tuinwerk">Tuin werkzaamheden</option>
                            <option value="Others">Ander type project</option>
                          </select>
                        </div>

                        {projectInterest === 'Others' && (
                          <div>
                            <label htmlFor="otherProjectInterest" className="block text-sm font-medium text-gray-700">
                              Specificeer ander project
                            </label>
                            <input
                              id="otherProjectInterest"
                              type="text"
                              value={otherProjectInterest}
                              onChange={(e) => setOtherProjectInterest(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#27aae2] focus:border-[#27aae2] sm:text-sm"
                              placeholder="Beschrijf uw project"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-[#27aae2] focus:ring-[#27aae2] border-gray-300 rounded"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        Ik ga akkoord met de{' '}
                        <Link href="/terms" className="text-[#27aae2] hover:text-[#27aae2]/90 underline">
                          algemene voorwaarden
                        </Link>
                        {' '}en{' '}
                        <Link href="/privacy" className="text-[#27aae2] hover:text-[#27aae2]/90 underline">
                          privacyverklaring
                        </Link>
                      </label>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#27aae2] hover:bg-[#27aae2]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#27aae2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Bezig met registreren...' : 'Account aanmaken'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Heb je al een account?{' '}
                      <Link href="/auth/login" className="font-medium text-[#27aae2] hover:text-[#27aae2]/90 transition-colors">
                        Log hier in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}