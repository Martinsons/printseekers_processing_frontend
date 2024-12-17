<template>
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-xl font-bold mb-4">Augšupielādēt Fedex atskaiti</h2>
      
      <!-- File Upload Section -->
      <div class="mb-6">
        <label 
          for="file-upload" 
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Izvēlieties XLSX failu
        </label>
        <div class="flex items-center gap-4">
          <input
            type="file"
            id="file-upload"
            accept=".xlsx"
            @change="handleFileSelect"
            class="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <button
            @click="processFile"
            :disabled="!selectedFile || isProcessing"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg 
                   hover:bg-blue-600 disabled:bg-gray-300 
                   disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!isProcessing">Augšupielādēt</span>
            <span v-else>Apstrādā...</span>
          </button>
        </div>
      </div>
  
      <!-- Processing Status -->
      <div v-if="processingStats.total > 0" class="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold mb-2">Processing Results:</h3>
        <div class="space-y-1">
          <p>Kopā sūtījumi: {{ processingStats.total }}</p>
          <p>Atjaunoti dati: {{ processingStats.updated }}</p>
          <p>Ievietoti dati: {{ processingStats.inserted }}</p>
          <p class="text-red-500" v-if="processingStats.errors > 0">
            Kļūdas: {{ processingStats.errors }}
          </p>
        </div>
      </div>
  
      <!-- Error Display -->
      <div 
        v-if="error" 
        class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
      >
        {{ error }}
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import * as XLSX from 'xlsx'
  import Papa from 'papaparse'
  import { supabaseDb } from '../config/supabase'
  
  export default {
    name: 'FedexDataUpload',
    
    setup() {
      const selectedFile = ref(null)
      const isProcessing = ref(false)
      const error = ref(null)
      const processingStats = ref({
        total: 0,
        updated: 0,
        inserted: 0,
        errors: 0
      })
  
      const handleFileSelect = (event) => {
        selectedFile.value = event.target.files[0]
        error.value = null
        resetStats()
      }
  
      const resetStats = () => {
        processingStats.value = {
          total: 0,
          updated: 0,
          inserted: 0,
          errors: 0
        }
      }
  
      const cleanData = (record) => {
        // Convert empty strings to null for numeric fields
        const numericFields = ['numberOfPackages', 'totalShipmentWeight', 'packageWeight', 
                             'length', 'width', 'height', 'estimatedShippingCosts']
        
        const cleaned = { ...record }
        
        // Remove fields that don't exist in the database schema
        delete cleaned.reference

        // Clean numeric fields
        for (const field of numericFields) {
          if (cleaned[field] === '') {
            cleaned[field] = null
          } else if (cleaned[field]) {
            // Convert to number and handle invalid values
            const num = parseFloat(cleaned[field])
            cleaned[field] = isNaN(num) ? null : num
          }
        }
  
        // Clean boolean fields
        const booleanFields = ['senderResidential', 'recipientResidential', 'ETD']
        for (const field of booleanFields) {
          if (cleaned[field] === '') {
            cleaned[field] = null
          } else if (typeof cleaned[field] === 'string') {
            cleaned[field] = cleaned[field].toLowerCase() === 'y'
          }
        }
  
        return cleaned
      }
  
      const xlsxToCSV = async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          
          reader.onload = async (e) => {
            try {
              const data = new Uint8Array(e.target.result)
              const workbook = XLSX.read(data, { type: 'array' })
              const firstSheetName = workbook.SheetNames[0]
              const worksheet = workbook.Sheets[firstSheetName]
              
              // Convert to CSV
              const csv = XLSX.utils.sheet_to_csv(worksheet)
              
              // Parse CSV to validate structure
              Papa.parse(csv, {
                header: true,
                complete: (results) => {
                  if (results.errors.length > 0) {
                    reject(new Error('Invalid CSV structure'))
                    return
                  }
                  // Clean each record before resolving
                  const cleanedData = results.data.map(cleanData)
                  resolve(cleanedData)
                },
                error: (error) => reject(error)
              })
            } catch (error) {
              reject(error)
            }
          }
          
          reader.onerror = (error) => reject(error)
          reader.readAsArrayBuffer(file)
        })
      }
  
      const processFile = async () => {
        if (!selectedFile.value) return
        
        isProcessing.value = true
        error.value = null
        resetStats()
  
        try {
          // Convert XLSX to CSV data
          const records = await xlsxToCSV(selectedFile.value)
          processingStats.value.total = records.length
  
          // Process records in chunks to avoid overwhelming the database
          const chunkSize = 100
          for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize)
            await processChunk(chunk)
          }
  
        } catch (err) {
          error.value = `Error processing file: ${err.message}`
          processingStats.value.errors += 1
        } finally {
          isProcessing.value = false
        }
      }
  
      const processChunk = async (records) => {
        try {
          // Get existing tracking numbers for this chunk
          const trackingNumbers = records.map(r => r.masterTrackingNumber)
          const { data: existingRecords } = await supabaseDb
            .from('fedex_orderi')
            .select('masterTrackingNumber')
            .in('masterTrackingNumber', trackingNumbers)
  
          const existingTrackingNumbers = new Set(
            existingRecords?.map(r => r.masterTrackingNumber) || []
          )
  
          // Separate records into updates and inserts
          const updates = records.filter(r => 
            existingTrackingNumbers.has(r.masterTrackingNumber)
          )
          const inserts = records.filter(r => 
            !existingTrackingNumbers.has(r.masterTrackingNumber)
          )
  
          // Process updates
          if (updates.length > 0) {
            const { error: updateError } = await supabaseDb
              .from('fedex_orderi')
              .upsert(updates, {
                onConflict: 'masterTrackingNumber'
              })
  
            if (updateError) throw updateError
            processingStats.value.updated += updates.length
          }
  
          // Process inserts
          if (inserts.length > 0) {
            const { error: insertError } = await supabaseDb
              .from('fedex_orderi')
              .insert(inserts)
  
            if (insertError) throw insertError
            processingStats.value.inserted += inserts.length
          }
  
        } catch (err) {
          console.error('Error processing chunk:', err)
          processingStats.value.errors += 1
          
          // More specific error message
          let errorMessage = 'Database error: '
          if (err.code === '22P02') {
            errorMessage += 'Invalid number format in data. Please check numeric fields.'
          } else if (err.code === '23502') {
            errorMessage += 'Required field is missing.'
          } else if (err.code === '23505') {
            errorMessage += 'Duplicate tracking number found.'
          } else {
            errorMessage += err.message || 'Unknown error'
          }
          
          error.value = errorMessage
          throw new Error(errorMessage)
        }
      }
  
      return {
        selectedFile,
        isProcessing,
        error,
        processingStats,
        handleFileSelect,
        processFile
      }
    }
  }
  </script>