'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { motion } from 'framer-motion'
import { FiUpload, FiSave, FiX, FiArrowLeft } from 'react-icons/fi'

export default function EditProjectPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    category: '',
    technologies: '',
    description: '',
    longDescription: '',
    link: '',
    image: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      fetchData()
    }

    const fetchData = async () => {
      try {
        console.log('Fetching project with ID:', id)
        
        if (!id) {
          console.error('ID is empty or undefined')
          return
        }

        const { data, error } = await supabase
          .from('projects')
          .select()
          .eq('id', id)
          .limit(1)
          .maybeSingle()

        console.log('✅ Query Result:', data)
        console.log('❌ Query Error:', error)

        if (error) {
          console.error('Database error:', error.message)
          console.error('Error details:', error)
          alert(`Error: ${error.message}`)
          return
        }

        if (!data) {
          console.error('No data found')
          alert('Proyek tidak ditemukan')
          router.push('/admin')
          return
        }

        setForm({
          ...data,
          category: Array.isArray(data.category) ? data.category.join(', ') : '',
          technologies: Array.isArray(data.technologies) ? data.technologies.join(', ') : '',
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Unexpected error:', error)
        alert('Terjadi kesalahan yang tidak diharapkan')
      }
    }

    checkAuth()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let imageUrl = form.image
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, imageFile)

        if (uploadError) {
          console.error('Upload gagal:', uploadError)
          alert('Gagal upload gambar.')
          return
        }

        const { data } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath)
        imageUrl = data.publicUrl
      }

      console.log('Data yang akan diupdate:', {
        ...form,
        image: imageUrl,
        category: form.category.split(',').map((item) => item.trim()),
        technologies: form.technologies.split(',').map((item) => item.trim()),
      })

      const { error } = await supabase
        .from('projects')
        .update({
          title: form.title,
          category: form.category.split(',').map((item) => item.trim()),
          technologies: form.technologies.split(',').map((item) => item.trim()),
          description: form.description,
          longDescription: form.longDescription,
          link: form.link,
          image: imageUrl
        })
        .eq('id', id)

      if (error) {
        console.error('Update gagal:', error)
        alert('Gagal memperbarui proyek.')
        return
      }

      alert('Proyek berhasil diperbarui!')
      router.push('/admin')
      router.refresh()

    } catch (error) {
      console.error('Error updating project:', error)
      alert('Terjadi kesalahan saat memperbarui proyek.')
    }
  }

  if (isLoading) return <p className="text-center mt-10">Loading...</p>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Edit Proyek
          </h1>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700 shadow-xl"
        >
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Gambar Proyek
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="relative group cursor-pointer"
              >
                {form.image ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <motion.img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiUpload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center group-hover:border-purple-500 transition-colors">
                    <div className="text-center">
                      <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">
                        Click atau drop gambar disini
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Judul Proyek
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Kategori
                </label>
                <input
                  name="category"
                  placeholder="Laravel, NextJS, etc"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teknologi
                </label>
                <input
                  name="technologies"
                  placeholder="React, TailwindCSS, etc"
                  value={form.technologies}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Deskripsi Lengkap
              </label>
              <textarea
                name="longDescription"
                value={form.longDescription}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Link Proyek
              </label>
              <input
                name="link"
                value={form.link}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <FiSave className="w-5 h-5" />
              Simpan Perubahan
            </motion.button>
            <motion.button
              type="button"
              onClick={() => router.push('/admin')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <FiX className="w-5 h-5" />
              Batal
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  )
}
