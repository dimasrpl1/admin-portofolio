import { Project } from '@/types/project'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Tag, Code } from 'lucide-react'

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : 50,
          transition: { type: 'spring', damping: 25, stiffness: 300 }
        }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800"
      >
        {/* Header Image with Gradient Overlay */}
        <div className="relative h-48 sm:h-72 overflow-hidden">
          <motion.img
            src={project.image || '/default.jpg'}
            alt={project.title}
            className="object-cover w-full h-full"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/20" />
          
          {/* Close Button */}
          <motion.button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-gray-800/60 backdrop-blur-md rounded-full text-white hover:bg-gray-700/60 transition-all"
            whileHover={{ rotate: 90, backgroundColor: 'rgba(239, 68, 68, 0.7)' }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
          
          {/* Title on Image */}
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <motion.h2 
              className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {project.title}
            </motion.h2>
            
            {/* Categories */}
            <motion.div 
              className="flex flex-wrap gap-2 mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {project.category.map((cat) => (
                <span key={cat} className="flex items-center gap-1 bg-indigo-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Tag className="w-3 h-3" />
                  {cat}
                </span>
              ))}
            </motion.div>
            
            {/* Date */}
            <motion.div 
              className="flex items-center text-sm text-gray-300"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(project.created_at)}
            </motion.div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              Deskripsi
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {project.longDescription}
            </p>
          </div>
          
          {/* Technologies */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              Teknologi
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
          
          {/* Project Link - Fixed at bottom on mobile */}
          {project.link && (
            <div className="sticky bottom-0 left-0 right-0 mt-6 py-4 bg-gray-900">
              <motion.a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Lihat Proyek</span>
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </motion.a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}