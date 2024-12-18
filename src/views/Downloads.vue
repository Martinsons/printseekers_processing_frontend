<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-medium text-gray-900">Apstrādātie faili</h2>
          
          <div class="bg-white rounded-lg shadow mb-6">
            <div class="p-6">
              <details class="group border bg-white-50 rounded-lg">
                <summary class="flex items-center justify-between px-4 py-2 cursor-pointer bg-blue-200 rounded-lg">
                  <h3 class="text-lg font-medium text-gray-900">Instrukcija</h3>
                  <svg 
                    class="w-6 h-6 text-gray-500 transition group-open:rotate-180"
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </summary>
                <div class="p-4">
                  <p class="text-gray-700">
                    Šeit ir detalizēta instrukcija par failu lejupielādes procesu:
                  </p>
                  <ol class="list-decimal list-inside mt-2 space-y-1 text-gray-700">
                    <li>Spiediet uz "Lejupielādēt visus" pogas, lai lejupielādētu visus failus vienā reizē.</li>
                    <li>Spiediet uz "Lejupielādēt" pogas, lai lejupielādētu failu individuāli.</li>
                  </ol>
                  
                  
                </div>
              </details>
            </div>
          </div>    

          <!-- Download All Button -->
          <button 
            v-if="files.length > 0"
            @click="downloadAllFiles" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            :disabled="isDownloading"
          >
            <span v-if="!isDownloading">Lejupielādēt visus</span>
            <span v-else>Notiek lejupielāde...</span>
            <svg 
              v-if="!isDownloading"
              class="ml-2 -mr-1 h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <svg 
              v-else
              class="animate-spin ml-2 -mr-1 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                class="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                stroke-width="4"
              />
              <path 
                class="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </button>
        </div>

        <!-- Status Message -->
        <div 
          v-if="error" 
          class="mb-4 p-4 rounded-lg bg-red-50 text-red-800"
        >
          {{ error }}
        </div>

        <!-- Files List -->
        <div v-if="files.length > 0">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Faila nosaukums</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tips</th>
                  <th class="relative py-3.5 pl-3 pr-4">
                    <span class="sr-only">Darbības</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="file in files" :key="file.path">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                    {{ file.name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ file.type }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button
                      @click="downloadFile(file)"
                      class="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                      :disabled="isDownloading"
                    >
                      <span class="mr-1">Lejupielādēt</span>
                      <svg 
                        class="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Files Message -->
        <div 
          v-else 
          class="text-center py-12 bg-gray-50 rounded-lg"
        >
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No files available</h3>
          <p class="mt-1 text-sm text-gray-500">
            Process some files to see them here
          </p>
          <div class="mt-6">
            <router-link
              to="/"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Process Files
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiRequest, API_ENDPOINTS } from '../config/api'

export default {
  data() {
    return {
      files: [],
      isDownloading: false,
      error: null,
      cleanupInterval: null
    }
  },

  created() {
    // Start periodic cleanup check
    this.cleanupInterval = setInterval(this.cleanupFiles, 300000) // 5 minutes
    this.cleanupFiles() // Initial cleanup

    const storedFiles = localStorage.getItem('processedFiles')
    
    if (storedFiles) {
      this.files = this.formatFiles(JSON.parse(storedFiles))
      localStorage.removeItem('processedFiles')
    }
  },

  unmounted() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval)
  },

  methods: {
    formatFiles(filesData) {
      
      const formattedFiles = []

      Object.entries(filesData).forEach(([type, paths]) => {
        if (type === 'invoices' && Array.isArray(paths)) {
          // Handle multiple invoice files
          paths.forEach(path => {
            formattedFiles.push({
              name: this.getFileName(path),
              path: path,
              type: 'Invoice'
            })
          })
        } else {
          // Handle single file
          formattedFiles.push({
            name: this.getFileName(paths),
            path: paths,
            type: this.getFileType(type)
          })
        }
      })

      
      return formattedFiles
    },

    getFileName(path) {
      return path.split('/').pop()
    },

    getFileType(type) {
      const types = {
        main_file: 'Main Batch File',
        dpd_file: 'DPD Orders',
        dhl_file: 'DHL Orders',
        invoices: 'Invoice'
      }
      return types[type] || type
    },

    async downloadAllFiles() {
      if (this.isDownloading) return
      this.isDownloading = true
      this.error = null

      try {
        for (const file of this.files) {
          await this.downloadFile(file)
        }
      } catch (error) {
        console.error('Error downloading files:', error)
        this.error = error.message
      } finally {
        this.isDownloading = false
      }
    },

    async downloadFile(file) {
      try {
        const response = await fetch(file.download_url)
        if (!response.ok) throw new Error(`Download failed: ${response.status}`)

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.getFileName(file.path)
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error downloading file:', error)
        throw new Error(`Failed to download ${this.getFileName(file.path)}`)
      }
    },

    async cleanupFiles() {
      try {
        const result = await apiRequest(API_ENDPOINTS.CLEANUP_FILES, {
          method: 'POST'
        })
        console.log('Cleanup result:', result)
      } catch (error) {
        console.error('Error cleaning up files:', error)
      }
    },
  }
}
</script>