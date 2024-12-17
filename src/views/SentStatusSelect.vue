<template>
  <div class="status-select relative inline-block">
    <!-- Status Badge/Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="min-w-[100px] flex items-center justify-between relative z-10"
    >
      <div
        :class="[
          'px-3 py-1 text-sm font-medium rounded-full w-full flex items-center justify-between',
          getStatusClass(modelValue),
          !disabled && 'hover:opacity-90 hover:shadow-sm transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed'
        ]"
      >
        <span class="flex items-center">
          <span 
            class="w-2 h-2 rounded-full mr-2"
            :class="getStatusDotClass(modelValue)"
          ></span>
          {{ modelValue || 'Not sent' }}
        </span>
        <svg 
          v-if="!disabled" 
          class="w-4 h-4 ml-1 transition-transform duration-200"
          :class="{ 'transform rotate-180': isOpen }"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-[9999] mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1 left-0"
        style="transform-origin: top left;"
      >
        <button
          v-for="status in statusOptions"
          :key="status"
          type="button"
          @click="selectStatus(status)"
          class="w-full px-4 py-2 text-sm hover:bg-gray-50 transition-all duration-200 flex items-center"
          :class="[
            modelValue === status ? 'bg-gray-50' : '',
            'group' // Add group class for hover effects
          ]"
        >
          <div 
            class="flex items-center w-full"
            :class="getStatusTextClass(status)"
          >
            <span 
              class="w-2 h-2 rounded-full mr-2 transition-all duration-200"
              :class="[
                getStatusDotClass(status),
                'group-hover:scale-110' // Scale dot on hover
              ]"
            ></span>
            {{ status }}
            <!-- Checkmark for selected status -->
            <svg
              v-if="modelValue === status"
              class="w-4 h-4 ml-auto text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SentStatusSelect',
  
  props: {
    modelValue: {
      type: String,
      required: true,
      validator: (value) => {
        return ['Not sent', 'Sent', 'Finished', 'Resend', ''].includes(value)
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const isOpen = ref(false)
    const statusOptions = ['Not sent', 'Sent', 'Finished', 'Resend']

    const toggleDropdown = () => {
      if (!props.disabled) {
        isOpen.value = !isOpen.value
      }
    }

    const selectStatus = (status) => {
      if (status !== props.modelValue) {
        emit('update:modelValue', status)
      }
      isOpen.value = false
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'Not sent':
          return 'bg-gray-100 text-gray-800 border border-gray-200'
        case 'Sent':
          return 'bg-blue-50 text-blue-800 border border-blue-200'
        case 'Finished':
          return 'bg-green-50 text-green-800 border border-green-200'
        case 'Resend':
          return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
        default:
          return 'bg-gray-100 text-gray-800 border border-gray-200'
      }
    }

    const getStatusDotClass = (status) => {
      switch (status) {
        case 'Not sent':
          return 'bg-gray-400'
        case 'Sent':
          return 'bg-blue-400'
        case 'Finished':
          return 'bg-green-400'
        case 'Resend':
          return 'bg-yellow-400'
        default:
          return 'bg-gray-400'
      }
    }

    const getStatusTextClass = (status) => {
      switch (status) {
        case 'Not sent':
          return 'text-gray-700'
        case 'Sent':
          return 'text-blue-700'
        case 'Finished':
          return 'text-green-700'
        case 'Resend':
          return 'text-yellow-700'
        default:
          return 'text-gray-700'
      }
    }

    // Handle clicking outside
    const handleClickOutside = (event) => {
      const selectElement = event.target.closest('.status-select')
      if (!selectElement && isOpen.value) {
        isOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      isOpen,
      statusOptions,
      toggleDropdown,
      selectStatus,
      getStatusClass,
      getStatusDotClass,
      getStatusTextClass
    }
  }
}
</script>

<style scoped>
.status-select {
  isolation: isolate;
  position: relative;
}

/* Ensure dropdown is always on top */
.status-select:focus-within {
  z-index: 9999;
}

/* Dropdown container */
.status-select > div[role="listbox"] {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  z-index: 9999;
}

/* Add smooth transition for status changes */
button {
  transition: all 0.2s ease-in-out;
}

/* Add subtle hover effect for dropdown items */
.group:hover .w-2 {
  transform: scale(1.2);
}

/* Ensure dropdown is above other elements */
.dropdown-menu {
  position: absolute;
  z-index: 9999;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>