<template>
    <button
      @click="handleClick"
      :disabled="disabled || isLoading"
      class="px-3 py-1 rounded-md text-sm font-medium"
      :class="{
        'bg-gray-300 text-gray-500 cursor-not-allowed': disabled || isLoading,
        'bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200': !disabled && !isLoading
      }"
    >
      <template v-if="isLoading">
        <div class="flex items-center space-x-2">
          <svg 
            class="animate-spin h-4 w-4" 
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
          <span>Sending...</span>
        </div>
      </template>
      <template v-else>
        Send to FedEx
      </template>
    </button>
  </template>
  
  <script>
  export default {
    name: 'FedexActionButton',
    
    props: {
      record: {
        type: Object,
        required: true
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
  
    emits: ['sendToFedex'],
  
    data() {
      return {
        isLoading: false
      }
    },
  
    methods: {
      async handleClick() {
        try {
          this.isLoading = true;
          await this.$emit('sendToFedex', this.record);
        } catch (error) {
          console.error('Error sending to FedEx:', error);
        } finally {
          this.isLoading = false;
        }
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