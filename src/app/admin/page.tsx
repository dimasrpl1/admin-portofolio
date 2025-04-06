/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/types/project'
import { supabase } from '@/lib/supabase-browser'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlus, HiSearch, HiLogout, HiPencil, HiTrash } from 'react-icons/hi'
import { FiActivity, FiGrid, FiList, FiFilter } from 'react-icons/fi'
import ProjectModal from '@/components/ProjectModal'

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Available categories
  const categories = ['Laravel', 'NextJs', 'UI/UX']

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          await router.replace('/')
          return
        }
        setIsLoading(false)
        fetchProjects()
      } catch (error) {
        console.error('Auth error:', error)
        await router.replace('/')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Set initial value
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      await router.replace('/')
    } catch (error) {
      console.error('Logout error:', error)
      showNotification('Error during logout', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    router.push('/admin/new')
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this project?')
    if (!confirm) return

    try {
      // Delete image from storage if exists
      const project = projects.find(p => p.id === id)
      if (project?.image) {
        // Extract filename correctly from Supabase URL
        const imageUrl = new URL(project.image)
        const pathSegments = imageUrl.pathname.split('/')
        const fileName = pathSegments[pathSegments.length - 1]

        const { error: storageError } = await supabase.storage
          .from('project-images')
          .remove([fileName])

        if (storageError) {
          console.error('Error deleting image:', storageError)
        }
      }

      // Delete data from database
      const { error: dbError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (dbError) {
        console.error('Error deleting project:', dbError)
        showNotification('Failed to delete project: ' + dbError.message, 'error')
        return
      }

      // Update local state after successful deletion
      setProjects(projects.filter(p => p.id !== id))
      
      // Show success notification
      showNotification('Project successfully deleted', 'success')
    } catch (error) {
      console.error('Error:', error)
      showNotification('An error occurred while deleting the project', 'error')
    }
  }

  const [notification, setNotification] = useState({ message: '', type: '', show: false })

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, show: true })
    setTimeout(() => {
      setNotification({ message: '', type: '', show: false })
    }, 3000)
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || 
      (Array.isArray(project.category) && project.category.includes(selectedCategory))
    return matchesSearch && matchesCategory
  })

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }
  
  const filterVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.3 }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header Bar */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FiActivity className="h-8 w-8 text-purple-500" />
              </motion.div>
              <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Project Dashboard</h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-all duration-300"
            >
              <HiLogout className="mr-2 -ml-1 h-5 w-5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 shadow-xl rounded-xl mb-8 border border-gray-700"
        >
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search and Create Project Section */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search bar */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search projects by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg leading-5 bg-gray-700 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
                  />
                </div>

                {/* Create Project Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-all duration-300 shadow-lg shadow-purple-600/30"
                >
                  <HiPlus className="mr-2 -ml-1 h-5 w-5" /> Create New Project
                </motion.button>
              </div>

              {/* View Mode and Filter Controls */}
              <div className="flex flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2">
                  {/* View Mode Buttons */}
                  <div className="flex items-center bg-gray-700 rounded-lg p-1">
                    <motion.button
                      onClick={() => setViewMode('grid')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-md ${
                        viewMode === 'grid' 
                          ? 'bg-gray-600 shadow-inner text-purple-400' 
                          : 'hover:bg-gray-600 text-gray-300'
                      } transition-all duration-300`}
                      aria-label="Grid view"
                    >
                      <FiGrid className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setViewMode('list')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-md ${
                        viewMode === 'list' 
                          ? 'bg-gray-600 shadow-inner text-purple-400' 
                          : 'hover:bg-gray-600 text-gray-300'
                      } transition-all duration-300`}
                      aria-label="List view"
                    >
                      <FiList className="h-5 w-5" />
                    </motion.button>
                  </div>
                  
                  {/* Filter Button (Mobile) */}
                  <motion.button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="md:hidden inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-all duration-300"
                  >
                    <FiFilter className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Filter options */}
            <AnimatePresence>
              {(showMobileFilters || !isMobile) && (
                <motion.div 
                  variants={filterVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mt-4"
                >
                  <div className="flex flex-wrap gap-2 justify-start">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                        selectedCategory === '' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                      }`}
                    >
                      All
                    </motion.button>
                    {categories.map(category => (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                          selectedCategory === category 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                        }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Projects Display */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div 
              animate={{ 
                rotate: 360,
                borderRadius: ["50% 50% 50% 50%", "40% 60% 60% 40%", "50% 50% 50% 50%"]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="h-16 w-16 border-t-4 border-b-4 border-purple-500"
            />
          </div>
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 shadow-lg rounded-xl p-8 text-center border border-gray-700"
              >
                <p className="text-gray-400">No projects found.</p>
              </motion.div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        variants={itemVariants}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 border border-gray-700 group"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={project.image || '/default.jpg'}
                            alt={project.title}
                            className="h-48 w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300">
                            <div className="absolute bottom-4 right-4 flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(project.id);
                                }}
                                className="p-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg shadow-lg transition-all duration-300"
                                aria-label="Edit project"
                              >
                                <HiPencil className="h-5 w-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(project.id);
                                }}
                                className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-lg transition-all duration-300"
                                aria-label="Delete project"
                              >
                                <HiTrash className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        <motion.div 
                          className="p-5 cursor-pointer"
                          onClick={() => setSelectedProject(project)}
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                          <h2 className="font-bold text-lg text-white mb-2">{project.title}</h2>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {Array.isArray(project.category) && project.category.map((cat, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 text-purple-300 border border-purple-700"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <motion.div 
                    className="bg-gray-800 shadow-lg overflow-hidden rounded-xl border border-gray-700"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <ul className="divide-y divide-gray-700">
                      {filteredProjects.map((project) => (
                        <motion.li 
                          key={project.id}
                          variants={itemVariants}
                          className="group hover:bg-gray-700/50 transition-colors duration-300"
                        >
                          <div className="px-4 py-4 sm:px-6 flex items-center">
                            <div 
                              className="flex items-center flex-1 min-w-0 cursor-pointer" 
                              onClick={() => setSelectedProject(project)}
                            >
                              <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden">
                                <img 
                                  src={project.image || '/default.jpg'}
                                  alt={project.title}
                                  className="h-16 w-16 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <h2 className="text-lg font-medium text-white truncate">{project.title}</h2>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Array.isArray(project.category) && project.category.map((cat, index) => (
                                    <span 
                                      key={index} 
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 text-purple-300 border border-purple-700"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEdit(project.id)}
                                className="inline-flex items-center px-3 py-1 border border-amber-600 text-sm leading-5 font-medium rounded-lg text-amber-500 hover:bg-amber-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ease-in-out duration-300"
                              >
                                <HiPencil className="mr-1 h-4 w-4" /> Edit
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(project.id)}
                                className="inline-flex items-center px-3 py-1 border border-rose-600 text-sm leading-5 font-medium rounded-lg text-rose-500 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition ease-in-out duration-300"
                              >
                                <HiTrash className="mr-1 h-4 w-4" /> Delete
                              </motion.button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`px-5 py-4 rounded-xl shadow-2xl backdrop-blur-lg ${
                notification.type === 'success' 
                  ? 'bg-gradient-to-r from-green-600/90 to-emerald-600/90 border border-green-500/50' 
                  : 'bg-gradient-to-r from-rose-600/90 to-red-600/90 border border-rose-500/50'
              } text-white flex items-center`}
            >
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}