<template>
    <div class="relative inline-block">
      <!-- Status Button -->
      <button
        @click="toggleDropdown"
        :disabled="disabled"
        :class="[
          'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
          getStatusStyle(modelValue),
          !disabled ? 'hover:shadow-sm' : 'opacity-50 cursor-not-allowed'
        ]"
      >
        <!-- Status Icon -->
        <span class="mr-1.5" v-html="getStatusIcon(modelValue)"></span>
        
        <!-- Status Text -->
        {{ modelValue }}
        
        <!-- Dropdown Arrow -->
        <svg
          v-if="!disabled"
          class="w-4 h-4 ml-1.5 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
  
      <!-- Dropdown Menu -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
          @click.stop
        >
          <button
            v-for="status in statusOptions"
            :key="status.value"
            @click="selectStatus(status.value)"
            class="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-150 flex items-center"
            :class="{ 'font-medium': modelValue === status.value }"
          >
            <!-- Option Icon -->
            <span class="mr-2" v-html="status.icon"></span>
            
            <!-- Option Text -->
            {{ status.value }}
          </button>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StatusSelect',
    
    props: {
      modelValue: {
        type: String,
        required: true
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
  
    emits: ['update:modelValue'],
  
    data() {
      return {
        isOpen: false,
        statusOptions: [
          {
            value: 'Not sent',
            icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
            color: 'bg-gray-100'
          },
          {
            value: 'Sent',
            icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
            color: 'bg-blue-100'
          },
          {
            value: 'Finished',
            icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',
            color: 'bg-green-100'
          },
          {
            value: 'Resend',
            icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>',
            color: 'bg-yellow-100'
          }
        ]
      }
    },
  
    methods: {
      toggleDropdown() {
        if (!this.disabled) {
          this.isOpen = !this.isOpen
        }
      },
  
      selectStatus(status) {
        this.$emit('update:modelValue', status)
        this.isOpen = false
      },
  
      getStatusStyle(status) {
        const option = this.statusOptions.find(opt => opt.value === status)
        return option ? `${option.color} hover:${option.color.replace('100', '200')}` : 'bg-gray-100'
      },
  
      getStatusIcon(status) {
        const option = this.statusOptions.find(opt => opt.value === status)
        return option ? option.icon : this.statusOptions[0].icon
      }
    },
  
    mounted() {
      // Close dropdown when clicking outside
      const handleClickOutside = (event) => {
        if (!this.$el.contains(event.target)) {
          this.isOpen = false
        }
      }
      document.addEventListener('click', handleClickOutside)
      
      // Cleanup
      this.$once('hook:beforeDestroy', () => {
        document.removeEventListener('click', handleClickOutside)
      })
    }
  }
  </script>
  
  <style scoped>
  .rotate-180 {
    transform: rotate(180deg);
  }
  </style>