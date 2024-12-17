<template>
  <div class="p-6 max-w-[90rem] mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">
        Shipping Cost Comparison
      </h1>
      <button
        v-if="results && results.length > 0"
        @click="exportToExcel"
        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        <span>Export to Excel</span>
      </button>
    </div>

    <!-- File Upload Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">
          Upload Excel File
        </label>
        
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            @change="handleFileChange"
            accept=".xlsx,.xls"
            class="hidden"
            ref="fileInput"
          />
          <button 
            @click="$refs.fileInput.click()"
            class="inline-flex items-center space-x-2 cursor-pointer"
          >
            <span class="text-gray-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </span>
            <span class="text-sm text-gray-600">
              {{ selectedFile ? selectedFile.name : 'Choose Excel file' }}
            </span>
          </button>
        </div>

        <button
          @click="handleSubmit"
          :disabled="!selectedFile || isLoading"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <template v-if="isLoading">
            <svg 
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </template>
          <template v-else>
            Compare Shipping Costs
          </template>
        </button>
      </div>

      <!-- Processing Indicator -->
      <div v-if="isProcessing" class="mt-4 p-4 bg-blue-50 rounded-lg">
        <div class="flex items-center space-x-3">
          <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-blue-700">
            Processing large dataset. This might take a few moments...
          </span>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div 
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
    >
      <svg 
        class="h-5 w-5 text-red-400 mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path 
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <div>
        <h3 class="text-sm font-medium text-red-800">Error</h3>
        <div class="mt-1 text-sm text-red-700">{{ error }}</div>
      </div>
    </div>

    <!-- Results Section -->
    <template v-if="results && results.length > 0">
      <!-- Summary Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          @click="currentFilter = 'all'"
          class="bg-white rounded-lg shadow p-4 transition-colors relative overflow-hidden"
          :class="[
            'hover:bg-gray-50',
            currentFilter === 'all' ? 'ring-2 ring-gray-400' : ''
          ]"
        >
          <div class="text-sm font-medium text-gray-500">Total Records</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900">{{ results.length }}</div>
          <div v-if="currentFilter === 'all'" class="absolute bottom-0 left-0 w-full h-1 bg-gray-400"></div>
        </button>

        <button
          @click="currentFilter = 'matches'"
          class="bg-green-50 rounded-lg shadow p-4 transition-colors relative overflow-hidden"
          :class="[
            'hover:bg-green-100',
            currentFilter === 'matches' ? 'ring-2 ring-green-400' : ''
          ]"
        >
          <div class="text-sm font-medium text-green-600">Matches</div>
          <div class="mt-1 text-2xl font-semibold text-green-700">{{ getMatchCount }}</div>
          <div v-if="currentFilter === 'matches'" class="absolute bottom-0 left-0 w-full h-1 bg-green-400"></div>
        </button>

        <button
          @click="currentFilter = 'mismatches'"
          class="bg-yellow-50 rounded-lg shadow p-4 transition-colors relative overflow-hidden"
          :class="[
            'hover:bg-yellow-100',
            currentFilter === 'mismatches' ? 'ring-2 ring-yellow-400' : ''
          ]"
        >
          <div class="text-sm font-medium text-yellow-600">Mismatches</div>
          <div class="mt-1 text-2xl font-semibold text-yellow-700">{{ getMismatchCount }}</div>
          <div v-if="currentFilter === 'mismatches'" class="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></div>
        </button>

        <button
          @click="currentFilter = 'notFound'"
          class="bg-red-50 rounded-lg shadow p-4 transition-colors relative overflow-hidden"
          :class="[
            'hover:bg-red-100',
            currentFilter === 'notFound' ? 'ring-2 ring-red-400' : ''
          ]"
        >
          <div class="text-sm font-medium text-red-600">Not Found</div>
          <div class="mt-1 text-2xl font-semibold text-red-700">{{ getNotFoundCount }}</div>
          <div v-if="currentFilter === 'notFound'" class="absolute bottom-0 left-0 w-full h-1 bg-red-400"></div>
        </button>
      </div>

      <!-- Selected Rows Actions -->
      <div 
        v-if="selectedCount > 0" 
        class="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between"
      >
        <div class="flex items-center">
          <span class="text-sm text-gray-700 mr-4">
            {{ selectedCount }} {{ selectedCount === 1 ? 'row' : 'rows' }} selected
          </span>
          <button
            @click="selectedRows.clear(); selectAll = false;"
            class="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            Notīrīt atzīmētos
          </button>
        </div>
        <div class="flex space-x-2">
          <button
            @click="uploadToDatabase"
            :disabled="selectedCount === 0 || isUploading"
            class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <template v-if="isUploading">
              <svg 
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Uploading...</span>
            </template>
            <template v-else>
              <span>Augšupielādēt datubāzē</span>
            </template>
          </button>
        </div>
      </div>

      <!-- Results Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 bg-gray-50 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">
              Shipping Costs Comparison ({{ filteredResults.length }} entries)
              <span class="text-sm font-normal text-gray-500 ml-2">
                {{ currentFilter === 'all' ? 'All records' : `Filtered by ${currentFilter}` }}
              </span>
            </h2>
            <div v-if="currentFilter === 'mismatches'" class="flex items-center space-x-2">
              <button
                @click="sortDirection = sortDirection === 'desc' ? 'asc' : 'desc'"
                class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center space-x-1"
              >
                <span>Sort</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  :class="{ 'transform rotate-180': sortDirection === 'asc' }"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div v-if="currentFilter === 'mismatches'" class="mt-2 text-sm text-gray-600">
              Differences ≤ 0.5: {{ smallDifferencesCount }} (Total: €{{ smallDifferencesTotal }})
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <!-- Checkbox header -->
                <th scope="col" class="px-6 py-3">
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      :checked="selectAll"
                      @change="toggleSelectAll"
                      class="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <button
                      @click="smartSelectAll"
                      class="text-sm text-blue-600 hover:text-blue-800"
                      title="Select all except small differences"
                    >
                      Smart Select
                    </button>
                  </div>
                </th>
                
                <!-- Other headers -->
                <th 
                  v-for="header in tableHeaders" 
                  :key="header.key" 
                  class="sticky top-0 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10"
                >
                  {{ header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr 
                v-for="item in filteredResults" 
                :key="item.trackingNumber"
                class="hover:bg-gray-50"
                :class="{'bg-blue-50': selectedRows.has(item.trackingNumber)}"
              >
                <!-- Checkbox cell -->
                <td class="w-12 px-3 py-4">
                  <input
                    type="checkbox"
                    :checked="selectedRows.has(item.trackingNumber)"
                    @change="toggleRowSelection(item.trackingNumber)"
                    class="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                  />
                </td>

                <!-- Other cells -->
                <template v-if="editingRecord && editingRecord.trackingNumber === item.trackingNumber">
                  <td 
                    v-for="header in tableHeaders" 
                    :key="header.key"
                    class="px-3 py-4 whitespace-nowrap"
                  >
                    <input
                      v-if="header.key !== 'trackingNumber' && header.key !== 'status' && header.key !== 'costDifference'"
                      v-model="editingRecord[header.key]"
                      type="text"
                      class="w-full px-2 py-1 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span v-else>{{ item[header.key] }}</span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="saveEditing"
                      class="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEditing"
                      class="text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </td>
                </template>
                <template v-else>
                  <td 
                    v-for="header in tableHeaders" 
                    :key="header.key"
                    class="px-3 py-4 whitespace-nowrap text-sm"
                    :class="[
                      header.key.includes('Cost') ? getCostClass(item[header.key]) :
                      header.key === 'costDifference' ? getDifferenceClass(item[header.key]) :
                      header.key === 'status' ? getStatusClass(item) :
                      'text-gray-500'
                    ]"
                  >
                    {{ 
                      header.key.includes('Cost') ? formatCost(item[header.key]) :
                      header.key === 'costDifference' ? formatDifference(item[header.key]) :
                      header.key === 'status' ? getStatus(item) :
                      item[header.key] || 'N/A'
                    }}
                  </td>
                  <td v-if="isEditable(item)" class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="startEditing(item)"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { supabaseDb } from '../config/supabase';
import { useToast } from 'vue-toastification';

export default {
  name: 'ShippingCostComparison',

  setup() {
    const toast = useToast();
    return { toast };
  },

  data() {
    return {
      selectedFile: null,
      isLoading: false,
      isProcessing: false,
      error: null,
      results: null,
      selectedRows: new Set(),
      selectAll: false,
      isUploading: false,
      currentFilter: 'all', 
      editingRecord: null,
      sortDirection: 'desc', // Add new sorting direction state
      tableHeaders: [
        { key: 'invoice', label: 'Invoice' },
        { key: 'trackingNumber', label: 'Tracking Number' },
        { key: 'recipient', label: 'Recipient' },
        { key: 'senderContactName', label: 'Sender' },
        { key: 'excelCost', label: 'FedEx Cost' },
        { key: 'databaseCost', label: 'Sent Cost' },
        { key: 'costDifference', label: 'Difference' },
        { key: 'status', label: 'Status' },
        { key: 'recipientCountry', label: 'Country' },
        { key: 'dimensions', label: 'Dimensions' },
        { key: 'excelDimensions', label: 'Excel Dimensions' },
        { key: 'productType', label: 'Product Type' },
        { key: 'productCategory', label: 'Product Category' },
        { key: 'serviceType', label: 'Service Type' },
        { key: 'serviceData', label: 'Service Data' },
        { key: 'deliveryZone', label: 'Delivery Zone' }
      ]
    }
  },

  computed: {
    filteredResults() {
      if (!this.results) return [];
      
      let filtered;
      switch (this.currentFilter) {
        case 'matches':
          filtered = this.results.filter(item => {
            if (item.costDifference === 'OK') return true;
            const difference = parseFloat(item.costDifference);
            return !isNaN(difference) && (difference <= 0 || Math.abs(difference) < 0.01);
          });
          break;
          
        case 'mismatches':
          filtered = this.results.filter(item => {
            if (item.costDifference === 'OK' || item.costDifference === 'N/A') return false;
            const difference = parseFloat(item.costDifference);
            return !isNaN(difference) && difference > 0;
          });
          
          // Sort mismatches by cost difference
          filtered.sort((a, b) => {
            const diffA = parseFloat(a.costDifference) || 0;
            const diffB = parseFloat(b.costDifference) || 0;
            return this.sortDirection === 'desc' ? diffB - diffA : diffA - diffB;
          });
          break;
          
        case 'notFound':
          filtered = this.results.filter(item => 
            item.databaseCost === 'Not found' || 
            item.costDifference === 'N/A'
          );
          break;
          
        default: // 'all'
          filtered = this.results;
      }
      
      return filtered;
    },

    getMatchCount() {
      if (!this.results) return 0;
      return this.results.filter(item => {
        if (item.costDifference === 'OK') return true;
        const difference = parseFloat(item.costDifference);
        return !isNaN(difference) && (difference <= 0 || Math.abs(difference) < 0.01);
      }).length;
    },

    getMismatchCount() {
      if (!this.results) return 0;
      return this.results.filter(item => {
        if (item.costDifference === 'OK' || item.costDifference === 'N/A') return false;
        const difference = parseFloat(item.costDifference);
        return !isNaN(difference) && difference > 0;
      }).length;
    },

    getNotFoundCount() {
      if (!this.results) return 0;
      return this.results.filter(item => 
        item.databaseCost === 'Not found' || 
        item.costDifference === 'N/A'
      ).length;
    },

    smallDifferencesCount() {
      if (!this.results) return 0;
      return this.results.filter(item => {
        const difference = parseFloat(item.costDifference);
        return !isNaN(difference) && difference > 0 && difference <= 0.5;
      }).length;
    },

    smallDifferencesTotal() {
      if (!this.results) return 0;
      return this.results.reduce((total, item) => {
        const difference = parseFloat(item.costDifference);
        if (!isNaN(difference) && difference > 0 && difference <= 0.5) {
          return total + difference;
        }
        return total;
      }, 0).toFixed(2);
    },

    selectedCount() {
      return this.selectedRows.size;
    }
  },

  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file && 
          (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
           file.type === 'application/vnd.ms-excel')) {
        this.selectedFile = file
        this.error = null
      } else {
        this.error = 'Please select a valid Excel file (.xlsx or .xls)'
        this.selectedFile = null
      }
    },

    toggleSelectAll() {
      this.selectAll = !this.selectAll;
      if (this.selectAll) {
        this.selectedRows = new Set(this.filteredResults.map(row => row.trackingNumber));
      } else {
        this.selectedRows.clear();
      }
    },

    smartSelectAll() {
      this.selectAll = true;
      this.selectedRows = new Set(
        this.filteredResults
          .filter(row => Math.abs(row.excelCost - row.databaseCost) >= 0.5) // Only select items with difference >= $0.50
          .map(row => row.trackingNumber)
      );
    },

    toggleRowSelection(trackingNumber) {
      if (this.selectedRows.has(trackingNumber)) {
        this.selectedRows.delete(trackingNumber);
        this.selectAll = false;
      } else {
        this.selectedRows.add(trackingNumber);
        if (this.selectedRows.size === this.filteredResults.length) {
          this.selectAll = true;
        }
      }
    },
    
    async handleSubmit() {
      if (!this.selectedFile) return;

      this.isLoading = true;
      this.isProcessing = true;
      this.error = null;
      this.results = null;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const response = await fetch('http://localhost:8000/api/compare-shipping-costs', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to process file');
        }

        const data = await response.json();
        if (data.status === 'success') {
          this.results = this.processResults(data.comparisons.map(item => ({
            ...item,
            senderContactName: item.senderContactName || 'N/A',
            serviceType: item.serviceType || 'N/A',
            excelDimensions: item.excelDimensions || 'N/A',
            dimensions: item.dimensions || 'N/A',
            recipientCountry: item.recipientCountry || 'N/A',
            productType: item.productType || 'N/A',
            productCategory: item.productCategory || 'N/A',
            recipient: item.recipient || 'N/A',
            serviceData: item.serviceData || 'N/A',
            deliveryZone: item.deliveryZone || 'N/A'
          })));
        } else {
          throw new Error(data.error || 'Failed to process file');
        }
      } catch (err) {
        this.error = err.message;
        console.error('Error:', err);
      } finally {
        this.isLoading = false;
        this.isProcessing = false;
      }
    },

    processResults(data) {
      return data.map(item => {
        const excelCost = parseFloat(item.excelCost);
        const databaseCost = parseFloat(item.databaseCost);
        let costDifference = 'N/A';
        
        if (!isNaN(excelCost) && !isNaN(databaseCost)) {
          const diff = excelCost - databaseCost;
          costDifference = Math.abs(diff) < 0.01 ? 'OK' : diff.toFixed(2);
        }

        return {
          invoice: item.invoice,
          trackingNumber: item.trackingNumber,
          recipient: item.recipient,
          senderContactName: item.senderContactName,
          excelCost: item.excelCost,
          databaseCost: item.databaseCost,
          costDifference,
          status: this.getStatus(item),
          recipientCountry: item.recipientCountry,
          dimensions: item.dimensions,
          excelDimensions: item.excelDimensions,
          productType: item.productType,
          productCategory: item.productCategory,
          serviceType: item.serviceType,
          serviceData: item.serviceData,
          deliveryZone: item.deliveryZone
        };
      });
    },

    formatCost(cost) {
      if (cost === 'Not found' || cost === 'Invalid value') return cost;
      try {
        const numCost = parseFloat(cost);
        if (isNaN(numCost)) return 'Invalid value';
        return `€${numCost.toFixed(2)}`;
      } catch {
        return 'Invalid value';
      }
    },

    getCostClass(cost) {
      if (cost === 'Not found') return 'text-red-500 font-medium';
      if (cost === 'Invalid value') return 'text-orange-500 font-medium';
      return 'text-gray-500';
    },

    formatDifference(difference) {
      if (difference === 'OK') return 'OK';
      if (difference === 'N/A') return 'N/A';
      const value = parseFloat(difference);
      if (isNaN(value)) return 'N/A';
      if (value <= 0 || Math.abs(value) < 0.01) return 'OK';
      return `+€${value.toFixed(2)}`;
    },

    getDifferenceClass(difference) {
      if (difference === 'OK') return 'text-green-500 font-medium';
      if (difference === 'N/A') return 'text-gray-400';
      const value = parseFloat(difference);
      if (isNaN(value)) return 'text-gray-400';
      if (value <= 0 || Math.abs(value) < 0.01) return 'text-green-500 font-medium';
      return 'text-red-500 font-medium';
    },

    getStatus(item) {
      // First check the send status
      if (item.databaseCost === 'Not found') return 'Not in database';
      if (item.excelCost === 'Invalid value') return 'Invalid Excel value';
      if (item.databaseCost === 'Invalid value') return 'Invalid database value';
      
      if (item.costDifference === 'OK') return 'Match';
      
      const difference = parseFloat(item.costDifference);
      if (!isNaN(difference)) {
        if (difference <= 0 || Math.abs(difference) < 0.01) {
          return 'Match';
        }
        return 'Mismatch';
      }
      
      return 'Not Sent';
    },

    getStatusClass(item) {
      const status = this.getStatus(item);
      switch (status) {
        case 'Not in database':
          return 'text-red-500 font-medium';
        case 'Invalid Excel value':
        case 'Invalid database value':
          return 'text-orange-500 font-medium';
        case 'Match':
          return 'text-green-500 font-medium';
        case 'Mismatch':
          return 'text-yellow-500 font-medium';
        case 'Not Sent':
          return 'text-gray-500 font-medium';
        default:
          return 'text-gray-500';
      }
    },

    startEditing(record) {
      this.editingRecord = { ...record };
    },

    cancelEditing() {
      this.editingRecord = null;
    },

    async saveEditing() {
      try {
        // Update local state
        this.results = this.results.map(item => {
          if (item.trackingNumber === this.editingRecord.trackingNumber) {
            return { ...this.editingRecord };
          }
          return item;
        });

        this.toast.success('Record updated successfully');
        this.editingRecord = null;
      } catch (error) {
        console.error('Error saving record:', error);
        this.toast.error('Failed to save record: ' + error.message);
      }
    },

    isEditable(record) {
      return this.getStatus(record) === 'Not in database';
    },

    async uploadToDatabase() {
      if (this.selectedRows.size === 0) {
        this.toast.error('Please select records to upload');
        return;
      }

      try {
        this.isUploading = true;
        const selectedRecords = this.filteredResults.filter(record => 
          this.selectedRows.has(record.trackingNumber)
        );

        const recordsToUpload = selectedRecords.map(record => ({
          tracking_number: record.trackingNumber,
          invoice_number: record.invoice,
          recipient: record.recipient,
          fedex_cost: parseFloat(record.excelCost) || null,
          sent_cost: parseFloat(record.databaseCost) || null,
          cost_difference: record.costDifference === 'OK' ? 0 : 
                          record.costDifference === 'N/A' ? null : 
                          parseFloat(record.costDifference),
          country: record.recipientCountry,
          dimensions: record.dimensions,
          sent_dimensions: record.excelDimensions,
          service_type: record.serviceType,
          sent_service_type: record.serviceData,
          delivery_zone: record.deliveryZone,
          product_type: record.productType,
          product_category: record.productCategory,
          sent_status: 'Not sent'
        }));

        const { error } = await supabaseDb
          .from('invoice_records')
          .upsert(recordsToUpload, {
            onConflict: 'tracking_number',
            ignoreDuplicates: false
          });

        if (error) throw error;

        // Clear selections and show success message
        this.selectedRows.clear();
        this.selectAll = false;
        this.toast.success(`Successfully uploaded ${selectedRecords.length} records to database`);

      } catch (error) {
        console.error('Upload error:', error);
        this.toast.error('Failed to upload records: ' + error.message);
      } finally {
        this.isUploading = false;
      }
    },

    async handleMissingDataUpload() {
      if (!this.missingRecords || this.missingRecords.length === 0) return;

      try {
        this.isUploading = true;

        const recordsToUpload = this.missingRecords.map(record => ({
          tracking_number: record.trackingNumber,
          invoice_number: record.invoice,
          recipient: record.recipient,
          fedex_cost: parseFloat(record.excelCost) || null,
          country: record.country,
          dimensions: record.dimensions,
          service_type: record.serviceType,
          product_type: record.productType,
          product_category: record.productCategory,
          stage: 'Not sent',
          sent_status: 'Not Sent'
        }));

        const { error } = await supabaseDb
          .from('missing_invoice_data')
          .upsert(recordsToUpload, {
            onConflict: 'tracking_number',
            ignoreDuplicates: false
          });

        if (error) throw error;

        this.toast.success(`Successfully uploaded ${recordsToUpload.length} missing records`);
      } catch (error) {
        console.error('Missing data upload error:', error);
        this.toast.error('Failed to upload missing records: ' + error.message);
      } finally {
        this.isUploading = false;
      }
    },

    exportToExcel() {
      if (!this.results?.length) return;

      const exportData = this.results.map(item => ({
        'Invoice': item.invoice || 'N/A',
        'Tracking Number': item.trackingNumber,
        'Recipient': item.recipient,
        'Sender': item.senderContactName,
        'Fedex Cost': this.formatCost(item.excelCost),
        'Sent Cost': this.formatCost(item.databaseCost),
        'Difference': this.formatDifference(item.costDifference),
        'Status': this.getStatus(item),
        'Country': item.recipientCountry,
        'Sent Dimensions': item.excelDimensions,
        'Database Dimensions': item.dimensions,
        'Product Type': item.productType,
        'Product Category': item.productCategory,
        'Service Type': item.serviceType,
        'Sent Service Type': item.serviceData,
        'Delivery Zone': item.deliveryZone
      }));

      // Add small differences summary if in mismatches filter
      if (this.currentFilter === 'mismatches') {
        exportData.push({}); // Empty row for spacing
        exportData.push({
          'Invoice': 'Small Differences Summary (≤ 0.5)',
          'Tracking Number': `Count: ${this.smallDifferencesCount}`,
          'Recipient': `Total: €${this.smallDifferencesTotal}`
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      
      const summaryData = [
        { 'Metric': 'Total Records', 'Value': this.results.length },
        { 'Metric': 'Matches', 'Value': this.getMatchCount },
        { 'Metric': 'Mismatches', 'Value': this.getMismatchCount },
        { 'Metric': 'Not Found', 'Value': this.getNotFoundCount }
      ];

      // Add small differences to summary sheet if in mismatches filter
      if (this.currentFilter === 'mismatches') {
        summaryData.push(
          { 'Metric': 'Differences ≤ 0.5', 'Value': this.smallDifferencesCount },
          { 'Metric': 'Total Amount ≤ 0.5', 'Value': `€${this.smallDifferencesTotal}` }
        );
      }

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Comparison Data');
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      const colWidths = {};
      exportData.forEach(row => {
        Object.keys(row).forEach(key => {
          const value = String(row[key]);
          colWidths[key] = Math.max(colWidths[key] || 0, value.length, key.length);
        });
      });
      worksheet['!cols'] = Object.keys(colWidths).map(key => ({ wch: colWidths[key] + 2 }));

      summarySheet['!cols'] = [
        { wch: 20 },  // Increased width for metric names
        { wch: 15 }   // Increased width for values
      ];

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      XLSX.writeFile(workbook, `shipping-costs-comparison-${timestamp}.xlsx`);
    }
  }
};
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

.min-w-full {
  table-layout: fixed;
}

/* Proper cell sizing */
th, td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Status select dropdown should be above other content */
.status-select {
  z-index: 20;
  position: relative;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Better scrollbar styling */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

/* Ensure proper sticky header */
thead th {
  position: sticky;
  top: 0;
  background-color: rgb(249, 250, 251);
  z-index: 10;
}

/* Proper checkbox alignment */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

/* Add smooth row hover effect */
tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: rgb(249, 250, 251);
}

/* Improve table header sticky positioning */
thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Add transition effects */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Filter button transitions */
.filter-button {
  transition: all 0.2s ease-in-out;
}

.filter-button:hover {
  transform: translateY(-1px);
}

/* Table row selection highlight */
.selected-row {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Status indicator transitions */
.status-indicator {
  transition: color 0.2s ease;
}

.stage-column {
  min-width: 120px;
}

/* If you want to ensure the status select doesn't get too narrow */
.status-select-wrapper {
  min-width: 100px;
}

/* Additional responsive styles */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .stats-card {
    margin-bottom: 1rem;
  }
}

/* Loading indicator pulse effect */
.loading-indicator {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>