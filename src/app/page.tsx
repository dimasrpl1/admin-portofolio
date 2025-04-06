'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase-browser'
import { EyeIcon, EyeOffIcon, LockIcon, RailSymbolIcon } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isMount, setIsMount] = useState(false)
  const router = useRouter()

  const [backgroundElements, setBackgroundElements] = useState(() => 
    [...Array(5)].map(() => ({
      width: Math.random() * 200 + 50,
      height: Math.random() * 200 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xMovement: [
        Math.random() * 50 - 25,
        -(Math.random() * 50 - 25),
        Math.random() * 50 - 25
      ],
      yMovement: [
        Math.random() * 50 - 25,
        -(Math.random() * 50 - 25),
        Math.random() * 50 - 25
      ],
      duration: 15 + Math.random() * 10
    }))
  )

  useEffect(() => {
    setBackgroundElements(elements => 
      elements.map(element => ({
        ...element,
        width: Math.min(element.width, window.innerWidth * 0.4),
        height: Math.min(element.height, window.innerHeight * 0.4),
      }))
    )
  }, [])

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await router.replace('/admin')
        }
        setIsMount(true)
      } catch (error) {
        console.error('Session check error:', error)
        setIsMount(true)
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Input validation
      if (!email.trim() || !password.trim()) {
        setError('Email dan password harus diisi')
        setLoading(false)
        return
      }

      // Check attempt count
      if (attempts >= 5) {
        setError('Terlalu banyak percobaan. Silakan coba lagi nanti.')
        setLoading(false)
        return
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setAttempts(prev => prev + 1)
        
        // More specific error messages
        if (authError.message.includes('Invalid login')) {
          setError('Email atau password salah')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi')
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.session) {
        // Reset attempts on successful login
        setAttempts(0)
        await router.replace('/admin') // Use replace instead of push
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  // Add loading state to prevent flash of content
  if (!isMount) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      {/* Update container untuk background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {backgroundElements.map((element, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: element.width,
              height: element.height,
              left: element.left,
              top: element.top,
            }}
            animate={{
              x: element.xMovement,
              y: element.yMovement,
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white/10 backdrop-blur-lg p-4 sm:p-8 rounded-2xl shadow-2xl border border-white/30 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: loading ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="p-4 rounded-full bg-white/10 border border-white/30">
              <LockIcon className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-2xl font-bold text-center mb-6 text-white">
            Admin Login
          </motion.h1>
          
          {error && (
            <motion.div 
              className="bg-red-400/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-4 py-3 rounded-lg mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
          
          {/* Update input fields untuk mobile */}
          <form onSubmit={handleLogin} className="space-y-4">
            <motion.div variants={itemVariants} className="mb-4 relative">
              <div className="absolute top-0 bottom-0 left-3 flex items-center text-white/50">
                <RailSymbolIcon className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/30 text-white px-10 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-white/50 text-sm sm:text-base"
                required
              />
            </motion.div>
            
            {/* Update password field untuk mobile */}
            <motion.div variants={itemVariants} className="mb-6 relative">
              <div className="absolute top-0 bottom-0 left-3 flex items-center text-white/50">
                <LockIcon className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/30 text-white px-10 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-white/50 text-sm sm:text-base"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-0 bottom-0 flex items-center text-white/70 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOffIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading || attempts >= 5}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Login...</span>
                  </div>
                ) : 'Login'}
              </button>
            </motion.div>
          </form>
          
          {attempts > 0 && (
            <motion.p 
              variants={itemVariants}
              className="text-sm text-white/70 mt-4 text-center"
            >
              Sisa percobaan: {5 - attempts}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </main>
  )
}