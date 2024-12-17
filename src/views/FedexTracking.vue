<template>
  <div class="p-6 space-y-6">

    <FedexDataUpload />
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Meklēt sūtījumus</h1>
      <button
        @click="downloadExcel"
        :disabled="!hasResults"
        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Lejupielādāt Excel
      </button>
    </div>

    <div class="bg-white rounded-lg shadow mb-6">
          <div class="p-6">
            <details class="group border bg-white-50 rounded-lg">
              <summary class="flex items-center justify-between px-4 py-2 cursor-pointer bg-orange-100 rounded-lg">
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
                  Šeit ir detalizēta instrukcija par sūtījumu meklēšanu un apstrādi.:
                </p>
                <ol class="list-decimal list-inside mt-2 space-y-1 text-gray-700">
                  <li>
                    Ievadi sūtījuma numuru vai numurus vienā no formātiem:
                    <ul class="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      <li>
                        <strong>Viens numurs rindā:</strong> Katrs numurs jāievada atsevišķā rindā.
                      </li>
                      <li>
                        <strong>Vairāki numuri rindā:</strong> Katrs numurs jāievada atsevišķā rindā vai ar komatu atdalītiem.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Nospied pogu "Meklēt".
                  </li>
                  <li>
                    Rezultāti tiks parādīti zemāk.
                  </li>
                  <li>
                    Ja kāds no sūtījumiem netika atrasts, tas tiks atzīmēts ar "Not Found".
                  </li>
                  <li>
                    Lai lejupielādētu rezultātus kā Excel failu, nospied pogu "Lejupielādēt Excel".
                  </li>
                </ol>
                <div class="mt-4 flex justify-center">
                  <img 
                    src="" 
                    alt="Apstrādes piemērs" 
                    class="max-w-full h-auto rounded-lg shadow-md"
                  >
                </div>
                
              </div>
            </details>
          </div>
        </div>

    <!-- Search Section -->
    <div class="bg-white rounded-lg shadow p-6 space-y-4">
      <div class="space-y-2">
        <label for="tracking-numbers" class="block text-sm font-medium text-gray-700">
          Ievadi sūtījuma numuru vai numurus
        </label>
        <textarea
          id="tracking-numbers"
          v-model="trackingNumbers"
          rows="6"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Ievadi Fedex sūtījuma numurus (vienu numuru rindā vai atdalot tos ar komatiem)...
          Piemērs: 123456789012, 987654321098, 123456789012
          Piemērs: 123456789012
                          987654321098
                          123456678999"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          @click="searchOrders"
          :disabled="isLoading || !trackingNumbers"
          class="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg 
            v-if="isLoading"
            class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isLoading ? 'Searching...' : 'Search' }}</span>
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="searchResults.length > 0" class="bg-white rounded-lg shadow">
      <!-- Not Found Message -->
      <div v-if="notFoundCount > 0" class="p-4 bg-red-50 border-b border-red-100">
        <p class="text-red-500 font-semibold">
          {{ notFoundCount }} tracking numbers were not found.
        </p>
      </div>

      <!-- Results Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th 
                v-for="header in tableHeaders" 
                :key="header" 
                class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="result in searchResults" :key="result.trackingNumber">
              <td 
                v-for="field in tableFields" 
                :key="field"
                class="px-4 py-3 whitespace-nowrap text-sm"
                :class="getCellClass(result[field], field)"
              >
                {{ field === 'dimensions' ? formatDimensions(result) : result[field] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { supabaseDb } from '../config/supabase'
import * as XLSX from 'xlsx'
import FedexDataUpload from './FedexDataUpload.vue'


export default {
  name: 'FedexTracking',

  components: {
      FedexDataUpload
    },
  
  setup() {
    const trackingNumbers = ref('')
    const searchResults = ref([])
    const isLoading = ref(false)
    const hasResults = ref(false)

    const tableHeaders = [
      'Tracking Number',
      'Sender',
      'Shipping Cost',
      'Dimensions',
      'Country',
      'Service Type',
      'Product Name',
      'Size'
    ]

    const tableFields = [
      'trackingNumber',
      'senderContactName',
      'estimatedShippingCosts',
      'dimensions',
      'recipientCountry',
      'serviceType',
      'productName',
      'paramSize'
    ]

    const formatDimensions = (result) => {
      if (!result.length || !result.width || !result.height) {
        return 'N/A x N/A x N/A'
      }
      return `${result.length} x ${result.width} x ${result.height}`
    }

    const notFoundCount = computed(() => {
      return searchResults.value.filter(result => result.status === 'not_found').length
    })

    const processTrackingNumbers = (input) => {
      if (!input) return []
      
      return input
        .split(/[\n,]/) // Split by newline or comma
        .map(num => num.trim())
        .filter(num => {
          // Basic validation - you can adjust this based on your tracking number format
          return num.length > 0 && /^[A-Za-z0-9]+$/.test(num)
        })
    }

    const searchOrders = async () => {
      try {
        isLoading.value = true
        const numbers = processTrackingNumbers(trackingNumbers.value)
        
        if (numbers.length === 0) {
          throw new Error('No valid tracking numbers provided')
        }

        if (numbers.length > 100) {
          throw new Error('Maximum 100 tracking numbers allowed per search')
        }

        // Split into chunks if necessary (Supabase has query size limits)
        const chunkSize = 30
        const chunks = []
        for (let i = 0; i < numbers.length; i += chunkSize) {
          chunks.push(numbers.slice(i, i + chunkSize))
        }

        let fedexResults = []
        let printseekersResults = []

        // Process each chunk
        for (const chunk of chunks) {
          const [fedexChunk, printseekersChunk] = await Promise.all([
            supabaseDb
              .from('fedex_orderi')
              .select(`
                masterTrackingNumber,
                senderContactName,
                estimatedShippingCosts,
                length,
                width,
                height,
                recipientCountry,
                serviceType
              `)
              .in('masterTrackingNumber', chunk),
            supabaseDb
              .from('printseekers_orderi')
              .select(`
                TrackingNumber,
                ProductType,
                ParamSize
              `)
              .in('TrackingNumber', chunk)
          ])

          if (fedexChunk.error) throw fedexChunk.error
          if (printseekersChunk.error) throw printseekersChunk.error

          fedexResults = [...fedexResults, ...(fedexChunk.data || [])]
          printseekersResults = [...printseekersResults, ...(printseekersChunk.data || [])]
        }

        // Create Maps for quick lookups
        const fedexDataMap = new Map(
          fedexResults.map(item => [item.masterTrackingNumber, item])
        )
        const printseekersDataMap = new Map(
          printseekersResults.map(item => [item.TrackingNumber, item])
        )

        // Map each tracking number in original order
        searchResults.value = numbers.map(number => {
          const fedexData = fedexDataMap.get(number)
          const printseekersData = printseekersDataMap.get(number)

          if (!fedexData && !printseekersData) {
            // No data found for this number
            return {
              trackingNumber: number,
              senderContactName: 'Not Found',
              estimatedShippingCosts: 'Not Found',
              length: null,
              width: null,
              height: null,
              recipientCountry: 'Not Found',
              serviceType: 'Not Found',
              productName: 'Not Found',
              paramSize: 'Not Found',
              status: 'not_found'
            }
          }

          // Combine data from both sources
          return {
            trackingNumber: number,
            senderContactName: fedexData?.senderContactName || 'Not Found',
            estimatedShippingCosts: fedexData?.estimatedShippingCosts || 'Not Found',
            length: fedexData?.length || null,
            width: fedexData?.width || null,
            height: fedexData?.height || null,
            recipientCountry: fedexData?.recipientCountry || 'Not Found',
            serviceType: fedexData?.serviceType || 'Not Found',
            productName: printseekersData?.ProductType || 'Not Found',
            paramSize: printseekersData?.ParamSize || 'Not Found',
            status: fedexData || printseekersData ? 'found' : 'not_found'
          }
        })

        hasResults.value = searchResults.value.length > 0

      } catch (error) {
        console.error('Error searching orders:', error)
        if (error.code === 'PGRST116') {
          alert('Search query too large. Please reduce the number of tracking numbers.')
        } else if (error.code === 'PGRST104') {
          alert('Invalid tracking number format. Please check your input.')
        } else {
          alert(error.message || 'Error searching orders. Please try again.')
        }
        searchResults.value = []
        hasResults.value = false
      } finally {
        isLoading.value = false
      }
    }

    const getCellClass = (value, field) => {
      const isNotFound = value === 'Not Found' || value === 'N/A x N/A x N/A'
      return {
        'text-gray-700': !isNotFound,
        'text-red-500': isNotFound
      }
    }

    const downloadExcel = () => {
      if (!searchResults.value.length) return

      const worksheet = XLSX.utils.json_to_sheet(
        searchResults.value.map(result => ({
          'Tracking Number': result.trackingNumber,
          'Sender': result.senderContactName,
          'Shipping Cost': result.estimatedShippingCosts,
          'Dimensions': formatDimensions(result),
          'Country': result.recipientCountry,
          'Service Type': result.serviceType,
          'Product Name': result.productType,
          'Size': result.paramSize
        }))
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tracking Data')
      XLSX.writeFile(workbook, 'tracking_data.xlsx')
    }

    return {
      trackingNumbers,
      searchResults,
      isLoading,
      hasResults,
      notFoundCount,
      tableHeaders,
      tableFields,
      searchOrders,
      getCellClass,
      downloadExcel,
      formatDimensions
    }
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>