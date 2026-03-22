import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useDocumentStore = defineStore('documents', () => {
  const documents = ref([])
  const currentDocument = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchDocuments(workspaceId = null, page = 0, size = 20) {
    loading.value = true
    try {
      const params = { page, size }
      if (workspaceId) params.workspaceId = workspaceId
      const { data } = await api.get('/documents', { params })
      documents.value = data.content || data
    } catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function fetchDocument(id) {
    loading.value = true
    try {
      const { data } = await api.get(`/documents/${id}`)
      currentDocument.value = data
      return data
    } catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function createDocument(payload) {
    const { data } = await api.post('/documents', payload)
    documents.value.unshift(data)
    return data
  }

  async function updateDocument(id, payload) {
    const { data } = await api.put(`/documents/${id}`, payload)
    const idx = documents.value.findIndex(d => d.id === id)
    if (idx > -1) documents.value[idx] = data
    currentDocument.value = data
    return data
  }

  async function deleteDocument(id) {
    await api.delete(`/documents/${id}`)
    documents.value = documents.value.filter(d => d.id !== id)
  }

  return {
    documents, currentDocument, loading, error,
    fetchDocuments, fetchDocument, createDocument, updateDocument, deleteDocument
  }
})
