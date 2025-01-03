<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Invoice Search</h1>
    </div>

    <!-- Search Type Radio Buttons -->
    <div class="flex space-x-4">
      <label class="flex items-center space-x-2">
        <input
          type="radio"
          v-model="searchType"
          value="invoice"
          class="text-blue-500 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-700">Search by Invoice Number</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="radio"
          v-model="searchType"
          value="tracking"
          class="text-blue-500 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-700">Search by Tracking Number</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="radio"
          v-model="searchType"
          value="status"
          class="text-blue-500 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-700">Search by Status</span>
      </label>
    </div>

    <!-- Search Input/Select -->
    <div class="flex space-x-4">
      <div class="flex-1">
        <template v-if="searchType !== 'status'">
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keyup.enter="performSearch"
          />
          <!-- Invoice Numbers Display -->
          <div v-if="searchType === 'invoice' && !hasSearched" class="mt-2">
            <div v-if="isLoadingInvoices" class="text-sm text-gray-600">
              Loading invoice numbers...
            </div>
            <div v-else>
              <div class="text-sm text-gray-700">Available Invoice Numbers:</div>
              <div class="flex flex-wrap gap-2 mt-1">
                <div v-for="invoice in availableInvoices" :key="invoice" 
                  class="px-2 py-1 bg-gray-50 rounded text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                  @click="searchQuery = invoice; performSearch()"
                >
                  {{ invoice }}
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <label for="statusFilter" class="block text-sm font-medium text-gray-700">Filter by Status</label>
          <select
            id="statusFilter"
            v-model="selectedStatus"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Statuses</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </template>
      </div>
      <button
        @click="performSearch"
        :disabled="!canSearch"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
      >
        <svg 
          v-if="isLoading"
          class="animate-spin h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span>{{ isLoading ? 'Searching...' : 'Search' }}</span>
      </button>
      <button
        @click="clearSearch"
        class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
      >
        <span>Clear Search</span>
      </button>
    </div>

    <div v-if="showAdditionalFilter" class="space-y-4">
      <div class="flex-1">
        <label for="additionalStatusFilter" class="block text-sm font-medium text-gray-700">Additional Status Filter</label>
        <select
          id="additionalStatusFilter"
          v-model="additionalStatusFilter"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All Statuses</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- No Results Messages -->
      <div v-if="filterNoResults" class="bg-yellow-50 p-4 rounded-lg">
        <p class="text-yellow-700">
          No records found with status "{{ additionalStatusFilter }}". 
          <button 
            @click="additionalStatusFilter = ''; filterResults()"
            class="text-blue-500 hover:text-blue-600 underline ml-2"
          >
            Show all results
          </button>
        </p>
      </div>
      <div v-else-if="hasSearched && !hasResults && !filterNoResults" class="bg-yellow-50 p-4 rounded-lg">
        <p class="text-yellow-700">No records found for your search criteria.</p>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Results Section -->
      <div v-if="hasResults" class="space-y-4">
        <!-- Download Results Button -->
        <div class="flex justify-end">
          <button
            @click="downloadResults"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download Results
          </button>
        </div>

        <!-- Results Table -->
        <div v-for="table in tables" :key="table.tableName" class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Table Header -->
          <div class="p-4 bg-gray-50 border-b border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">
                {{ table.title }} ({{ table.records.length }} records)
              </h2>
              <div class="flex space-x-4">
                <button
                  v-if="selectedRows.size > 0"
                  @click="sendSelectedToFedex"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :disabled="isSending"
                >
                  {{ isSending ? 'Sending...' : `Send ${selectedRows.size} to FedEx` }}
                </button>
                <button
                  @click="table.isMinimized = !table.isMinimized"
                  class="text-gray-500 hover:text-gray-700"
                >
                  {{ table.isMinimized ? 'Show' : 'Hide' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Table Content -->
          <div v-if="!table.isMinimized">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <!-- Select All Checkbox -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th
                      v-for="header in table.headers"
                      :key="header.key"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {{ header.label }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="record in filteredResults" :key="record.id">
                    <!-- Row Checkbox -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        :checked="selectedRows.has(record.id)"
                        @change="toggleRowSelection(record.id)"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td
                      v-for="header in table.headers"
                      :key="header.key"
                      class="px-6 py-4 text-sm text-gray-900"
                      :class="{
                        'text-right': header.type === 'currency',
                        [getCostDifferenceClass(record[header.key])]: header.key === 'cost_difference'
                      }"
                    >
                      <!-- Status Select -->
                      <template v-if="header.type === 'status-select'">
                        <SentStatusSelect
                          v-model="record.stage"
                          :disabled="isSaving"
                          :options="header.options"
                          @update:modelValue="(newStatus) => updateField({
                            recordId: record.id,
                            tableName: table.tableName,
                            fieldName: header.key,
                            newValue: newStatus
                          })"
                        />
                      </template>

                      <!-- Edit Column -->
                      <template v-else-if="header.type === 'edit'">
                        <div class="flex space-x-2">
                          <button
                            v-if="editingRecord && editingRecord.id === record.id"
                            @click="saveEditing"
                            :disabled="isSaving"
                            class="text-sm px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-400"
                          >
                            {{ isSaving ? 'Saving...' : 'Save' }}
                          </button>
                          <button
                            v-if="editingRecord && editingRecord.id === record.id"
                            @click="cancelEditing"
                            :disabled="isSaving"
                            class="text-sm px-2 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            v-else
                            @click="startEditing(record)"
                            class="text-sm px-2 py-1 text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                        </div>
                      </template>

                      <!-- Editable Fields -->
                      <template v-else-if="header.editable">
                        <div v-if="editingRecord && editingRecord.id === record.id">
                          <input
                            v-if="header.type === 'currency'"
                            type="number"
                            step="0.01"
                            v-model="editingRecord[header.key]"
                            class="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            v-else
                            type="text"
                            v-model="editingRecord[header.key]"
                            class="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div v-else>
                          {{ formatFieldValue(record[header.key], header.type) }}
                        </div>
                      </template>

                      <!-- Non-editable Fields -->
                      <template v-else>
                        <div 
                          :class="{
                            'text-right': header.type === 'currency',
                            [getCostDifferenceClass(record[header.key])]: header.key === 'cost_difference'
                          }"
                        >
                          {{ formatFieldValue(record[header.key], header.type) }}
                        </div>
                      </template>
                    </td>

                    <!-- Actions Column -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div class="flex space-x-2">
                        <button
                          @click="sendSingleToFedex(record.id)"
                          :disabled="isSending || record.stage === 'Sent'"
                          class="text-sm px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Send to FedEx
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results Message -->
      <div
        v-else-if="hasSearched"
        class="text-center py-8 text-gray-500"
      >
        No results found
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="isSending && totalToSend > 0" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-96">
      <div class="text-sm font-medium text-gray-700 mb-2">
        Sending to FedEx: {{ sendingProgress }} / {{ totalToSend }}
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          :style="{ width: `${(sendingProgress / totalToSend) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 p-4 rounded-lg">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- Success Message -->
    <div 
      v-if="successMessage"
      class="fixed bottom-4 right-4 bg-green-50 text-green-800 px-4 py-2 rounded-lg shadow-lg border border-green-200"
    >
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import { supabaseDb } from '../config/supabase'
import EditableField from '../components/common/EditableField.vue'
import SentStatusSelect from './SentStatusSelect.vue'
import FedexActionButton from '../components/common/FedexActionButton.vue'

const processBatch = async (records, batchSize = 10, delayMs = 1000) => {
  const results = []
  totalToSend.value = records.length
  sendingProgress.value = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    for (const data of batch) {
      try {
        await sendToFedexApi(data)
        results.push({ 
          invoice: data.INVOICE_NUMBER, 
          shipping: data.AWB_TRACKING_NUMBER, 
          status: 'success' 
        })
      } catch (err) {
        results.push({ 
          invoice: data.INVOICE_NUMBER, 
          shipping: data.AWB_TRACKING_NUMBER, 
          status: 'error',
          error: err.message 
        })
        console.error(`Error sending to FedEx for invoice ${data.INVOICE_NUMBER}:`, err)
      }
      sendingProgress.value++
    }
    if (i + batchSize < records.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  return results
}

// Reactive state
const searchType = ref('invoice')
const searchQuery = ref('')
const selectedStatus = ref('All Statuses')
const additionalStatusFilter = ref('')
const invoiceResults = ref([])
const error = ref(null)
const successMessage = ref('')
const isSending = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const hasSearched = ref(false)
const selectedRows = ref(new Set())
const editingRecord = ref(null)
const editedValues = ref({
  fedex_cost: null,
  sent_cost: null,
  dimensions: null,
  sent_dimensions: null,
  service_type: null,
  sent_service_type: null
})
const isLoadingInvoices = ref(false)
const availableInvoices = ref([])
const filterNoResults = ref(false)

// Progress tracking
const progress = ref(0)
const totalToSend = ref(0)
const sent = ref(0)

// Computed properties
const hasResults = computed(() => invoiceResults.value.length > 0)

const fetchInvoiceNumbers = async () => {
  try {
    isLoadingInvoices.value = true
    let allInvoiceNumbers = []
    let hasMore = true
    let page = 0
    const pageSize = 1000

    while (hasMore) {
      const { data, error: fetchError, count } = await supabaseDb
        .from('invoice_records')
        .select('invoice_number', { count: 'exact' })
        .order('invoice_number')
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (fetchError) throw fetchError

      if (!data || data.length === 0) {
        hasMore = false
      } else {
        allInvoiceNumbers = [...allInvoiceNumbers, ...data]
        page++
        
        // Check if we've fetched all records
        hasMore = allInvoiceNumbers.length < count
      }
    }

    // Set the available invoices with unique, non-null values
    availableInvoices.value = [...new Set(allInvoiceNumbers.map(r => r.invoice_number).filter(Boolean))]
  } catch (err) {
    console.error('Error fetching invoice numbers:', err)
    error.value = 'Failed to fetch invoice numbers: ' + err.message
  } finally {
    isLoadingInvoices.value = false
  }
}

const refreshInvoiceNumbers = async () => {
  if (searchType.value === 'invoice') {
    await fetchInvoiceNumbers()
  }
}

const filteredResults = computed(() => {
  if (!invoiceResults.value) {
    filterNoResults.value = true
    return []
  }
  
  let results = [...invoiceResults.value]

  // Apply invoice number filter if it exists
  if (searchType.value === 'invoice' && searchQuery.value) {
    results = results.filter(record => 
      record.invoice_number?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Apply tracking number filter if it exists
  if (searchType.value === 'tracking' && searchQuery.value) {
    results = results.filter(record => 
      record.tracking_number?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Apply status filter if selected and not "All Statuses"
  if (selectedStatus.value && selectedStatus.value !== 'All Statuses') {
    results = results.filter(record => 
      record.stage?.toLowerCase() === selectedStatus.value.toLowerCase()
    )
  }

  // Apply additional status filter if selected
  if (additionalStatusFilter.value) {
    results = results.filter(record => 
      record.stage?.toLowerCase() === additionalStatusFilter.value.toLowerCase()
    )
  }

  filterNoResults.value = results.length === 0 && hasSearched.value
  return results
})

onMounted(async () => {
  if (searchType.value === 'invoice') {
    await fetchInvoiceNumbers()
  }
})

// Watch for filter changes
watch([selectedStatus, additionalStatusFilter], (newStatus) => {
  console.log('Status filter changed to:', newStatus)
})

watch(searchType, async (newType) => {
  if (newType === 'invoice') {
    await fetchInvoiceNumbers()
  }
})

// Status options
const statusOptions = [
  { value: 'Not sent', label: 'Not sent' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Finished', label: 'Finished' },
  { value: 'Resend', label: 'Resend' }
]

// Computed properties
const showAdditionalFilter = computed(() => {
  return hasResults.value && searchType.value !== 'status'
})

const canSearch = computed(() => {
  if (isLoading.value) return false
  if (searchType.value === 'status') return true
  return !!searchQuery.value.trim()
})

const searchPlaceholder = computed(() => {
  return searchType.value === 'invoice' 
    ? 'Enter invoice number...'
    : 'Enter tracking number...'
})

// Methods
const performSearch = async () => {
  if (!searchQuery.value && searchType.value !== 'status') {
    error.value = 'Please enter a search term'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    hasSearched.value = true

    let query = supabaseDb.from('invoice_records').select('*')

    if (searchType.value === 'invoice' && searchQuery.value) {
      query = query.ilike('invoice_number', `%${searchQuery.value}%`)
    } else if (searchType.value === 'tracking' && searchQuery.value) {
      query = query.ilike('tracking_number', `%${searchQuery.value}%`)
    } else if (searchType.value === 'status' && selectedStatus.value !== 'All Statuses') {
      query = query.eq('stage', selectedStatus.value)
    }

    const { data, error: searchError } = await query

    if (searchError) throw searchError

    invoiceResults.value = data || []
    
    // Refresh invoice numbers after search
    await refreshInvoiceNumbers()
  } catch (err) {
    console.error('Error performing search:', err)
    error.value = 'Failed to perform search: ' + err.message
  } finally {
    isLoading.value = false
  }
}

const downloadResults = () => {
  if (!invoiceResults.value || invoiceResults.value.length === 0) return

  try {
    // Convert the results to a format suitable for Excel
    const excelData = invoiceResults.value.map(record => ({
      'Invoice Number': record.invoice_number || 'N/A',
      'Tracking Number': record.tracking_number || 'N/A',
      'Recipient': record.recipient || 'N/A',
      'Stage': record.stage || 'N/A',
      'FedEx Cost': formatCurrency(record.fedex_cost),
      'Sent Cost': formatCurrency(record.sent_cost),
      'Cost Difference': formatCurrency(record.cost_difference),
      'CQL Number': record.cql_number || 'N/A',
      'FedEx Return': formatCurrency(record.fedex_return),
      'Country': record.country || 'N/A',
      'Dimensions': record.dimensions || 'N/A',
      'Sent Dimensions': record.sent_dimensions || 'N/A',
      'Service Type': record.service_type || 'N/A',
      'Product Type': record.product_type || 'N/A',
      'Product Category': record.product_category || 'N/A',
      'Sent Service Type': record.sent_service_type || 'N/A',
      'Delivery Zone': record.delivery_zone || 'N/A',
      'Created At': formatDate(record.created_at),
      'Updated At': formatDate(record.updated_at)
    }))

    // Calculate summary for sent items
    const sentItems = invoiceResults.value.filter(record => record.stage === 'Sent')
    const summary = {
      totalRecords: invoiceResults.value.length,
      sentRecords: sentItems.length,
      totalFedExCost: sentItems.reduce((sum, record) => sum + (record.fedex_cost || 0), 0),
      totalSentCost: sentItems.reduce((sum, record) => sum + (record.sent_cost || 0), 0),
      totalDifference: sentItems.reduce((sum, record) => sum + (record.cost_difference || 0), 0)
    }

    // Create main data worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Create summary worksheet
    const summaryData = [
      ['Summary of Sent Items'],
      ['Total Records', summary.totalRecords],
      ['Sent Records', summary.sentRecords],
      ['Total FedEx Cost', formatCurrency(summary.totalFedExCost)],
      ['Total Sent Cost', formatCurrency(summary.totalSentCost)],
      ['Total Difference', formatCurrency(summary.totalDifference)]
    ]
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Create and populate workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Search Results')
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const searchTypeStr = searchType.value === 'invoice' ? 'invoice' : 
                         searchType.value === 'tracking' ? 'tracking' : 'status'
    const searchStr = searchType.value === 'status' ? selectedStatus.value : searchQuery.value
    const filename = `search_results_${searchTypeStr}_${searchStr}_${timestamp}.xlsx`

    // Write file and trigger download
    XLSX.writeFile(workbook, filename)
    showSuccessMessage('Results downloaded successfully')
  } catch (err) {
    console.error('Error downloading results:', err)
    error.value = 'Failed to download results: ' + err.message
  }
}

// Utility Functions
const getCostDifferenceClass = (value) => {
  if (!value || value === 'N/A') return 'text-gray-600'
  const numValue = parseFloat(value)
  if (numValue === 0) return 'text-green-600'
  if (numValue < 0) return 'text-red-600'
  return 'text-yellow-600'
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(value)
}

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFieldValue = (value, type) => {
  if (value === null || value === undefined) return 'N/A'
  
  switch (type) {
    case 'currency':
      return formatCurrency(value)
    case 'date':
      return formatDate(value)
    default:
      return value.toString()
  }
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

// API Functions
const sendToFedexApi = async (data) => {
  const url = 'https://hjtmkx0ha9tg3hb-prdadw.adb.us-ashburn-1.oraclecloudapps.com/ords/SELFSERVICEPRD/Customer_Create_Query/Create_Cust_Query'
  
  const payload = {
    FIRST_NAME: data.NAME,
    LAST_NAME: data.SURNAME,
    EMAIL: data['E-MAIL'],
    INVOICE_NUMBER: data.INVOICE_NUMBER,
    AWB_TRACKING_NUMBER: data.AWB_TRACKING_NUMBER,
    MESSAGE: data.MESSAGE,
    COUNTRY_CODE: data.COUNTRY_CODE,
    CONTACT_REASON_NAME: data.CONTACT_REASON_NAME,
    TOKEN: data.TOKEN
  }

  const headers = {
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://www.fedex.com/lv-lv/customer-support/invoice-payments.html',
    'Content-Type': 'application/json'
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`FedEx API error: ${response.status}`)
  }

  return response
}

const updateField = async (updateData) => {
  try {
    console.log('updateField called with:', updateData)
    
    const updates = {}
    
    // Only update the specific field that changed
    updates[updateData.fieldName] = updateData.value
    
    // If sent_cost is being updated, recalculate cost_difference
    if (updateData.fieldName === 'sent_cost') {
      const record = invoiceResults.value.find(r => r.id === updateData.recordId)
      if (record) {
        const fedexCost = parseFloat(record.fedex_cost) || 0
        const sentCost = parseFloat(updateData.value) || 0
        updates.cost_difference = Math.abs(fedexCost - sentCost).toFixed(2)
      }
    }
    
    // Only update stage if fedex_return is being changed
    if (updateData.fieldName === 'fedex_return') {
      const record = invoiceResults.value.find(r => r.id === updateData.recordId)
      if (record) {
        const fedexCost = parseFloat(record.fedex_cost) || 0
        const sentCost = parseFloat(record.sent_cost) || 0
        const costDifference = Math.abs(fedexCost - sentCost)
        const fedexReturn = Math.abs(parseFloat(updateData.value) || 0)
        
        // Mark as Finished if FedEx returned equal or more than the cost difference
        updates.stage = fedexReturn >= costDifference ? 'Finished' : 'Resend'
      }
    }

    const { data, error: updateError } = await supabaseDb
      .from('invoice_records')
      .update(updates)
      .eq('id', updateData.recordId)
      .select()

    if (updateError) throw updateError

    // Update local state with the returned data
    if (data && data[0]) {
      // Update main results list
      invoiceResults.value = invoiceResults.value.map(record => {
        if (record.id === updateData.recordId) {
          return data[0]
        }
        return record
      })

      // Update editing record if it exists
      if (editingRecord.value && editingRecord.value.id === updateData.recordId) {
        editingRecord.value = { ...editingRecord.value, ...data[0] }
      }

      const message = updates.stage 
        ? `${updateData.fieldName} updated and stage changed to ${updates.stage}`
        : `${updateData.fieldName} updated successfully`
      showSuccessMessage(message)
      
      return data[0]
    }
  } catch (err) {
    console.error('Update error:', err)
    error.value = 'Failed to update: ' + err.message
    throw err
  }
}

const saveEditing = async () => {
  try {
    if (!editingRecord.value) return
    
    isSaving.value = true
    
    // Find the original record
    const originalRecord = invoiceResults.value.find(r => r.id === editingRecord.value.id)
    if (!originalRecord) return
    
    // Get only the changed fields
    const updates = {}
    Object.keys(editingRecord.value).forEach(key => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' &&
          editingRecord.value[key] !== originalRecord[key]) {
        updates[key] = editingRecord.value[key]
      }
    })
    
    // If sent_cost was changed, recalculate cost_difference
    if ('sent_cost' in updates) {
      const fedexCost = parseFloat(originalRecord.fedex_cost) || 0
      const sentCost = parseFloat(updates.sent_cost) || 0
      updates.cost_difference = Math.abs(fedexCost - sentCost).toFixed(2)
    }
    
    // Handle stage updates
    if ('stage' in updates) {
      // If stage is being set to Finished, verify the conditions
      if (updates.stage === 'Finished') {
        const fedexCost = parseFloat(editingRecord.value.fedex_cost) || 0
        const sentCost = parseFloat(editingRecord.value.sent_cost) || 0
        const costDifference = Math.abs(fedexCost - sentCost)
        const fedexReturn = Math.abs(parseFloat(editingRecord.value.fedex_return) || 0)
        
        // Only allow Finished state if fedex_return covers the cost difference
        if (fedexReturn < costDifference) {
          error.value = 'Cannot set to Finished: FedEx return amount must cover the cost difference'
          isSaving.value = false
          return
        }
      }
    } else if ('fedex_return' in updates) {
      // Handle FedEx return updates as before
      const fedexCost = parseFloat(editingRecord.value.fedex_cost) || 0
      const sentCost = parseFloat(editingRecord.value.sent_cost) || 0
      const costDifference = Math.abs(fedexCost - sentCost)
      const fedexReturn = Math.abs(parseFloat(updates.fedex_return) || 0)
      
      updates.stage = fedexReturn >= costDifference ? 'Finished' : 'Resend'
    }

    // If no changes were made, return early
    if (Object.keys(updates).length === 0) {
      showSuccessMessage('No changes to save')
      editingRecord.value = null
      isSaving.value = false
      return
    }

    const { data, error: updateError } = await supabaseDb
      .from('invoice_records')
      .update(updates)
      .eq('id', editingRecord.value.id)
      .select()

    if (updateError) throw updateError

    // Update local state with the returned data
    if (data && data[0]) {
      // Update main results list
      invoiceResults.value = invoiceResults.value.map(record => {
        if (record.id === editingRecord.value.id) {
          return data[0]
        }
        return record
      })

      // Update editing record if it exists
      if (editingRecord.value && editingRecord.value.id === data[0].id) {
        editingRecord.value = { ...editingRecord.value, ...data[0] }
      }

      const message = updates.stage 
        ? `Record updated and stage changed to ${updates.stage}`
        : 'Record updated successfully'
      showSuccessMessage(message)
      
      return data[0]
    }
  } catch (err) {
    console.error('Save error:', err)
    error.value = 'Failed to save: ' + err.message
  } finally {
    isSaving.value = false
  }
}

const startEditing = (record) => {
  // Create a deep copy of the record to edit
  editingRecord.value = JSON.parse(JSON.stringify(record))
}

const cancelEditing = () => {
  editingRecord.value = null
}

// Computed for selection
const isAllSelected = computed(() => {
  if (!hasResults.value || invoiceResults.value.length === 0) return false
  return invoiceResults.value.every(record => selectedRows.value.has(record.id))
})

// Methods for selection
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value.clear()
  } else {
    selectedRows.value = new Set(invoiceResults.value.map(record => record.id))
  }
}

const toggleRowSelection = (recordId) => {
  if (selectedRows.value.has(recordId)) {
    selectedRows.value.delete(recordId)
  } else {
    selectedRows.value.add(recordId)
  }
}

const sendSelectedToFedex = async () => {
  if (selectedRows.value.size === 0) {
    error.value = 'Please select records to send to FedEx'
    return
  }

  try {
    isSending.value = true
    const selectedRecords = invoiceResults.value.filter(record => 
      selectedRows.value.has(record.id)
    )

    // Reset progress tracking
    progress.value = 0
    totalToSend.value = selectedRecords.length
    sent.value = 0

    // Prepare FedEx data for all selected records
    const fedexData = selectedRecords.map(record => {
      const names = record.recipient.split(' ')
      const firstName = names[0] || ''
      const lastName = names.slice(1).join(' ') || firstName

      return {
        record_id: record.id, // Add record_id for tracking
        NAME: firstName,
        SURNAME: lastName,
        'E-MAIL': 'fedex-invoices@printseekers.com',
        INVOICE_NUMBER: record.invoice_number,
        AWB_TRACKING_NUMBER: record.tracking_number,
        MESSAGE: [
          'Price In invoice',
          'Price in system',
          'Actual size',
          'Size in invoice',
          'Credit request:',
          record.fedex_cost || 'N/A',
          record.sent_cost || 'N/A',
          record.dimensions || 'N/A',
          record.sent_dimensions || 'N/A',
          formatCurrency(record.cost_difference) || 'N/A'
        ].join('; '),
        COUNTRY_CODE: 'lv-lv',
        CONTACT_REASON_NAME: 'Invoice Disagreement_TC_Other',
        TOKEN: 'edcA4fh5_rfomUbvrf$Rou36t'
      }
    })

    // Create initial Excel file with submission data
    const today_date = new Date().toISOString().split('T')[0]
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `send/${today_date}.xlsx`
    
    // Initialize results tracking
    let processResults = []
    let updatedRecords = new Set()
    
    // Send each record to FedEx API and track results
    for (const data of fedexData) {
      const currentRecord = selectedRecords.find(r => r.invoice_number === data.INVOICE_NUMBER)
      if (!currentRecord) continue

      try {
        // Update UI to show processing state
        invoiceResults.value = invoiceResults.value.map(record => {
          if (record.id === data.record_id) {
            return { ...record, stage: 'Processing' }
          }
          return record
        })

        await sendToFedexApi(data)
        
        // Update stage to "Sent" after successful send
        const { error: updateError } = await supabaseDb
          .from('invoice_records')
          .update({ stage: 'Sent' })
          .eq('id', data.record_id)

        if (updateError) throw updateError

        updatedRecords.add(data.record_id)
        
        // Update local state
        invoiceResults.value = invoiceResults.value.map(record => {
          if (record.id === data.record_id) {
            return { ...record, stage: 'Sent' }
          }
          return record
        })

        processResults.push({
          INVOICE_NUMBER: data.INVOICE_NUMBER,
          AWB_TRACKING_NUMBER: data.AWB_TRACKING_NUMBER,
          NAME: data.NAME,
          SURNAME: data.SURNAME,
          MESSAGE: data.MESSAGE,
          STATUS: 'Success',
          ERROR_MESSAGE: '',
          TIMESTAMP: new Date().toISOString()
        })

        sent.value++
        progress.value = (sent.value / totalToSend.value) * 100
      } catch (err) {
        // Update stage to "Resend" after failed send
        const { error: updateError } = await supabaseDb
          .from('invoice_records')
          .update({ stage: 'Resend' })
          .eq('id', data.record_id)

        if (!updateError) {
          updatedRecords.add(data.record_id)
          // Update local state
          invoiceResults.value = invoiceResults.value.map(record => {
            if (record.id === data.record_id) {
              return { ...record, stage: 'Resend' }
            }
            return record
          })
        }

        processResults.push({
          INVOICE_NUMBER: data.INVOICE_NUMBER,
          AWB_TRACKING_NUMBER: data.AWB_TRACKING_NUMBER,
          NAME: data.NAME,
          SURNAME: data.SURNAME,
          MESSAGE: data.MESSAGE,
          STATUS: 'Failed',
          ERROR_MESSAGE: err.message,
          TIMESTAMP: new Date().toISOString()
        })
        console.error(`Error sending to FedEx for invoice ${data.INVOICE_NUMBER}:`, err)

        sent.value++
        progress.value = (sent.value / totalToSend.value) * 100
      }
    }

    // Refresh the data after all updates
    if (updatedRecords.size > 0) {
      const { data: refreshedData, error: refreshError } = await supabaseDb
        .from('invoice_records')
        .select('*')
        .in('id', Array.from(updatedRecords))

      if (!refreshError && refreshedData) {
        // Update the UI with fresh data
        invoiceResults.value = invoiceResults.value.map(record => {
          const refreshedRecord = refreshedData.find(r => r.id === record.id)
          return refreshedRecord || record
        })
      }
    }

    // Create detailed log Excel file
    const logWorksheet = XLSX.utils.json_to_sheet(processResults)
    const logWorkbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(logWorkbook, logWorksheet, 'Submission Results')

    // Add summary sheet
    const summary = {
      'Total Submissions': processResults.length,
      'Successful Submissions': processResults.filter(r => r.STATUS === 'Success').length,
      'Failed Submissions': processResults.filter(r => r.STATUS === 'Failed').length,
      'Submission Date': today_date,
      'Completion Time': new Date().toISOString()
    }
    const summaryWorksheet = XLSX.utils.json_to_sheet([summary])
    XLSX.utils.book_append_sheet(logWorkbook, summaryWorksheet, 'Summary')

    // Save the detailed log
    const logFilename = `send/fedex_submission_log_${timestamp}.xlsx`
    XLSX.writeFile(logWorkbook, logFilename)

    const successCount = processResults.filter(r => r.STATUS === 'Success').length
    const failureCount = processResults.filter(r => r.STATUS === 'Failed').length
    
    let message = `Successfully sent ${successCount} records to FedEx`
    if (failureCount > 0) {
      message += `. ${failureCount} records failed and are marked for resend.`
    }
    showSuccessMessage(message)

    // Clear selection after processing
    selectedRows.value.clear()
  } catch (err) {
    console.error('Error in batch processing:', err)
    error.value = 'Error processing batch: ' + err.message
  } finally {
    isSending.value = false
    progress.value = 0
    totalToSend.value = 0
    sent.value = 0
  }
}

const sendSingleToFedex = async (recordId) => {
  let sendStatus = 'Pending';
  let errorMessage = '';
  
  try {
    isSending.value = true;
    error.value = null;

    // Get the single record
    const record = invoiceResults.value.find(r => r.id === recordId);
    if (!record) throw new Error('Record not found');

    // Prepare FedEx data for the single record
    const names = record.recipient.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || firstName;

    const fedexData = [{
      record_id: record.id, // Add record_id for tracking
      NAME: firstName,
      SURNAME: lastName,
      'E-MAIL': 'fedex-invoices@printseekers.com',
      INVOICE_NUMBER: record.invoice_number,
      AWB_TRACKING_NUMBER: record.tracking_number,
      MESSAGE: [
        'Price In invoice',
        'Price in system',
        'Actual size',
        'Size in invoice',
        'Credit request:',
        record.fedex_cost || 'N/A',
        record.sent_cost || 'N/A',
        record.dimensions || 'N/A',
        record.sent_dimensions || 'N/A',
        formatCurrency(record.cost_difference) || 'N/A'
      ].join('; '),
      COUNTRY_CODE: 'lv-lv',
      CONTACT_REASON_NAME: 'Invoice Disagreement_TC_Other',
      TOKEN: 'edcA4fh5_rfomUbvrf$Rou36t'
    }];

    // Send to FedEx API first
    const data = fedexData[0];
    try {
      await sendToFedexApi(data);
      sendStatus = 'Success';
    } catch (err) {
      console.error(`Error sending to FedEx for invoice ${data.INVOICE_NUMBER}:`, err);
      sendStatus = 'Failed';
      errorMessage = err.message;
      throw err;
    }

    // Update record status in database
    const { error: updateError } = await supabaseDb
      .from('invoice_records')
      .update({
        stage: 'Sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', recordId);

    if (updateError) {
      sendStatus = 'Database Error';
      errorMessage = updateError.message;
      throw new Error('Failed to update record status: ' + updateError.message);
    }

    showSuccessMessage(`Successfully sent record ${record.tracking_number} to FedEx`);
  } catch (err) {
    console.error('Error sending to FedEx:', err);
    error.value = 'Failed to send to FedEx: ' + err.message;
  } finally {
    // Create Excel with status information
    const worksheet = XLSX.utils.json_to_sheet([{
      ...fedexData[0],
      SEND_STATUS: sendStatus,
      ERROR_MESSAGE: errorMessage,
      SENT_TIMESTAMP: new Date().toISOString()
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FedEx Data');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `fedex_${record.tracking_number}_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, filename);

    isSending.value = false;
  }
};

// Watch for filter changes
const tables = computed(() => {
  if (!hasResults.value) return []

  return [{
    tableName: 'invoice_records',
    title: 'Invoice Records',
    isMinimized: false,
    headers: [
      { key: 'stage', label: 'Stage', type: 'status-select', editable: true, options: statusOptions },
      { key: 'edit', label: 'Actions', type: 'edit', editable: false },
      { key: 'invoice_number', label: 'Invoice Number', editable: true },
      { key: 'tracking_number', label: 'Tracking Number', editable: true },
      { key: 'recipient', label: 'Recipient', editable: true },
      { key: 'fedex_cost', label: 'FedEx Cost', type: 'currency', editable: true },
      { key: 'sent_cost', label: 'Sent Cost', type: 'currency', editable: true },
      { key: 'cost_difference', label: 'Cost Difference', type: 'currency', editable: false },
      { key: 'cql_number', label: 'CQL Number', editable: true },
      { key: 'fedex_return', label: 'FedEx Return', type: 'currency', editable: true },
      { key: 'country', label: 'Country', editable: true },
      { key: 'dimensions', label: 'Dimensions', editable: true },
      { key: 'sent_dimensions', label: 'Sent Dimensions', editable: true },
      { key: 'service_type', label: 'Service Type', editable: true },
      { key: 'product_type', label: 'Product Type', editable: true },
      { key: 'product_category', label: 'Product Category', editable: true },
      { key: 'sent_service_type', label: 'Sent Service Type', editable: true },
      { key: 'delivery_zone', label: 'Delivery Zone', editable: true },
      { key: 'created_at', label: 'Created At', type: 'date', editable: false },
      { key: 'updated_at', label: 'Updated At', type: 'date', editable: false },
    ],
    records: filteredResults.value
  }]
})
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

/* Ensure table cells can accommodate the larger edit fields */
td {
  vertical-align: top;
  transition: all 0.2s ease;
}

/* Improve table responsiveness */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.download-button {
  transition: all 0.2s ease-in-out;
}

.download-button:hover:not(:disabled) svg {
  transform: translateY(2px);
}
</style>