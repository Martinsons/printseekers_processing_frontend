<template>
  <div class="group relative">
    <!-- Editing Mode -->
    <div v-if="isEditing" class="flex items-center space-x-2">
      <div class="relative flex-1">
        <input
          v-model="editValue"
          :type="inputType"
          class="w-full p-2 text-sm border-2 border-blue-300 rounded-md 
                 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                 focus:border-transparent bg-white"
          :class="{
            'min-w-[150px]': ['recipient', 'tracking_number', 'invoice_number'].includes(fieldName),
            'min-w-[120px]': ['fedex_cost', 'sent_cost', 'cost_difference', 'fedex_return'].includes(fieldName),
            'min-w-[100px]': ['country', 'dimensions', 'sent_dimensions'].includes(fieldName),
          }"
          :placeholder="placeholder"
          :step="inputType === 'number' ? '0.01' : undefined"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEdit"
          ref="inputField"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
          {{ suffix }}
        </div>
      </div>
      <!-- Action Buttons -->
      <div class="flex space-x-1">
        <button
          @click="saveChanges"
          class="p-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                 transition-colors duration-200 disabled:bg-gray-300"
          :disabled="isSaving || !isValid"
          title="Save"
        >
          <span v-if="isSaving" class="flex items-center">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </span>
          <span v-else>✓</span>
        </button>
        <button
          @click="cancelEdit"
          class="p-2 text-sm bg-gray-400 text-white rounded-md hover:bg-gray-500 
                 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
                 transition-colors duration-200 disabled:bg-gray-300"
          :disabled="isSaving"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Display Mode -->
    <div 
      v-else 
      @click="canEdit ? startEdit() : null"
      class="group flex items-center space-x-2"
    >
      <span 
        :class="[
          'px-2 py-1 rounded-md transition-colors duration-200',
          canEdit ? 'cursor-pointer hover:bg-gray-100' : '',
          value === 'N/A' ? 'text-red-500 italic' : 'text-gray-900',
          {
            'min-w-[150px] inline-block': ['recipient', 'tracking_number', 'invoice_number'].includes(fieldName),
            'min-w-[120px] inline-block': ['fedex_cost', 'sent_cost', 'cost_difference', 'fedex_return'].includes(fieldName),
            'min-w-[100px] inline-block': ['country', 'dimensions', 'sent_dimensions'].includes(fieldName),
          }
        ]"
      >
        {{ displayValue }}
      </span>
      
      <!-- Edit Indicator -->
      <span 
        v-if="canEdit"
        class="invisible group-hover:visible text-xs text-blue-500 opacity-0 
               group-hover:opacity-100 transition-opacity duration-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    </div>

    <!-- Validation Message -->
    <div v-if="isEditing && validationMessage" 
         class="absolute left-0 top-full mt-1 text-xs text-red-500 bg-white p-1 rounded-md shadow-sm border border-red-200">
      {{ validationMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditableField',
  props: {
    value: {
      type: String,
      required: true
    },
    recordId: {
      type: String,
      required: true
    },
    tableName: {
      type: String,
      required: true
    },
    fieldName: {
      type: String,
      required: true
    },
    trackingNumber: {
      type: String,
      required: true
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Enter value...'
    },
    type: {
      type: String,
      default: 'text',
      validator: (value) => ['text', 'number', 'currency'].includes(value)
    },
    suffix: {
      type: String,
      default: ''
    }
  },

  emits: ['update'],

  data() {
    return {
      isEditing: false,
      editValue: '',
      validationMessage: ''
    }
  },

  computed: {
    canEdit() {
      // Allow editing if value is 'N/A' or the field is meant to be editable
      return this.value === 'N/A' || ['sent_cost'].includes(this.fieldName.toLowerCase())
    },
    displayValue() {
      if (this.type === 'currency' && this.value !== 'N/A') {
        return this.formatCurrency(this.value)
      }
      return this.value
    },
    inputType() {
      return this.type === 'currency' ? 'number' : this.type
    },
    isValid() {
      if (this.type === 'currency' || this.type === 'number') {
        if (typeof this.editValue === 'string' && this.editValue.trim() === '') {
          return false
        }
        const value = parseFloat(this.editValue)
        return !isNaN(value) && value >= 0
      }
      return typeof this.editValue === 'string' && this.editValue.trim().length > 0
    }
  },

  methods: {
    startEdit() {
      if (!this.canEdit) return
      
      this.editValue = this.value === 'N/A' ? '' : this.value
      this.isEditing = true
      this.$nextTick(() => {
        this.$refs.inputField?.focus()
      })
    },

    async saveChanges() {
      if (!this.isValid) {
        this.validationMessage = 'Please enter a valid value'
        return
      }

      this.isSaving = true
      try {
        let valueToSave = this.editValue
        if (this.type === 'currency' || this.type === 'number') {
          if (typeof this.editValue === 'string' && this.editValue.trim() !== '') {
            valueToSave = parseFloat(this.editValue)
          }
        } else {
          valueToSave = this.editValue.toString().trim()
        }

        await this.$emit('update', {
          recordId: this.recordId,
          tableName: this.tableName,
          fieldName: this.fieldName,
          value: valueToSave,
          trackingNumber: this.trackingNumber,
          type: this.type
        })
        
        // Only clear editing state after successful save
        this.isEditing = false
        this.validationMessage = ''
      } catch (error) {
        console.error('Save failed:', error)
        this.validationMessage = 'Failed to save changes'
      } finally {
        this.isSaving = false
      }
    },

    cancelEdit() {
      this.editValue = this.value
      this.isEditing = false
      this.validationMessage = ''
    },

    formatCurrency(value) {
      if (value === 'N/A') return value
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR'
        }).format(parseFloat(value))
      } catch {
        return value
      }
    }
  },

  watch: {
    editValue() {
      this.validationMessage = ''
    }
  }
}
</script>