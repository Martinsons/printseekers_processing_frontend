<template>
  <div class="p-6 space-y-6">
    <!-- File Upload Section remains the same -->
    <div class="bg-white rounded-lg shadow p-6 space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Augšupielādēt FedEx PDF rēķinu
        </label>
        <div 
          class="border-2 border-dashed rounded-lg p-6 text-center"
          :class="{ 'border-red-300 bg-red-50': error, 'border-gray-300': !error }"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept=".pdf"
            class="hidden"
          >
          <button 
            @click="$refs.fileInput.click()"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Izvēlēties PDF failu
          </button>
          <p class="mt-2 text-sm" :class="error ? 'text-red-600' : 'text-gray-600'">
            {{ error || (selectedFile ? selectedFile.name : 'Nav izvēlēts fails') }}
          </p>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <button 
          @click="processFile(selectedFile)"
          :disabled="!canSubmit || loading"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span 
            v-if="loading" 
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
          <span>{{ loading ? 'Notiek apstrāde...' : 'Apstrādāt failu' }}</span>
        </button>

        <button 
          v-if="downloadFile"
          @click="downloadExcel"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Lejupielādēt Excel failu
        </button>
      </div>
    </div>

    <!-- Updated Results Section with Invoice Number -->
    <div v-if="processedData" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Datu attēlošana</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <!-- Added Invoice column first -->
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rēķina Nr.</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Number</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Zone</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in processedData" :key="index">
              <!-- Added Invoice cell -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.invoice }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.trackingNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.recipientData }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.serviceData }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.country }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.dimensions }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.deliveryZone }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadFedExBill, apiRequest } from '../config/api'

export default {
  name: 'FedexBillProcessing',
  
  data() {
    return {
      selectedFile: null,
      loading: false,
      error: null,
      processedData: null,
      downloadFile: null
    }
  },

  computed: {
    canSubmit() {
      return this.selectedFile && !this.loading
    }
  },

  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0]
      
      if (file && !file.name.toLowerCase().endsWith('.pdf')) {
        this.error = 'Please select a PDF file'
        this.selectedFile = null
        return
      }
      
      this.selectedFile = file
      this.error = null
    },

    async processFile(file) {
      if (!file) return;
      
      try {
        this.loading = true;
        this.error = null;
        this.processedData = null;
        
        const result = await uploadFedExBill(file);
        
        // Handle the case where result is undefined (network error)
        if (!result) {
          this.error = 'Network error: Unable to connect to the server';
          this.$toast.error(this.error);
          return;
        }

        if (result.success) {
          this.$toast.success(result.message || 'File processed successfully');
          
          if (result.data) {
            this.processedData = result.data;
          } else {
            this.processedData = {
              message: result.message || 'File processed successfully'
            };
          }
        } else {
          this.error = result.message || 'Failed to process file';
          this.$toast.error(this.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        this.error = error?.message || 'An unexpected error occurred';
        this.$toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async downloadExcel() {
      if (!this.downloadFile) return

      try {
        const result = await apiRequest(this.downloadFile, {
          method: 'GET',
          responseType: 'blob'
        });

        if (!result) {
          throw new Error('Failed to download file');
        }

        const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.downloadFile.split('/').pop();
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.$toast?.success('File downloaded successfully');
      } catch (error) {
        console.error('Error downloading file:', error);
        const errorMessage = error.message || 'Failed to download file';
        this.error = errorMessage;
        this.$toast?.error(errorMessage);
      }
    }
  }
}
</script>
