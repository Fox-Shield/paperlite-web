import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useTemplateStore = defineStore('templates', () => {
  const templates = ref([])
  const galleryTemplates = ref([])
  const currentTemplate = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchMyTemplates(page = 0, size = 20) {
    loading.value = true
    try {
      const { data } = await api.get('/templates', { params: { page, size } })
      templates.value = data.content || data
    } catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function fetchGallery(category = '', page = 0, size = 20) {
    loading.value = true
    try {
      const params = { page, size }
      if (category) params.category = category
      const { data } = await api.get('/templates/gallery', { params })
      galleryTemplates.value = data.content || data
    } catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function fetchTemplate(id) {
    loading.value = true
    try {
      const { data } = await api.get(`/templates/${id}`)
      currentTemplate.value = data
      return data
    } catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function createTemplate(payload) {
    const { data } = await api.post('/templates', payload)
    templates.value.unshift(data)
    return data
  }

  async function updateTemplate(id, payload) {
    const { data } = await api.put(`/templates/${id}`, payload)
    const idx = templates.value.findIndex(t => t.id === id)
    if (idx > -1) templates.value[idx] = data
    currentTemplate.value = data
    return data
  }

  async function deleteTemplate(id) {
    await api.delete(`/templates/${id}`)
    templates.value = templates.value.filter(t => t.id !== id)
  }

  return {
    templates, galleryTemplates, currentTemplate, loading, error,
    fetchMyTemplates, fetchGallery, fetchTemplate, createTemplate, updateTemplate, deleteTemplate
  }
})
