import {
  getCoreRowModel,
  useVueTable,
  createColumnHelper,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/vue-table'
import { computed, ref, h } from 'vue'

export const useInvoiceTable = (invoiceResults, selectedRows, editingRecord) => {
  const columnHelper = createColumnHelper()
  const sorting = ref([])

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => 
        h('input', {
          type: 'checkbox',
          checked: table.getIsAllRowsSelected(),
          onChange: (e) => table.toggleAllRowsSelected(),
          class: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
        }),
      cell: ({ row }) => 
        h('input', {
          type: 'checkbox',
          checked: row.getIsSelected(),
          onChange: (e) => row.toggleSelected(),
          class: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
        }),
      enableSorting: false,
    }),
    columnHelper.accessor('stage', {
      header: 'Stage',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('invoice_number', {
      header: 'Invoice Number',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('tracking_number', {
      header: 'Tracking Number',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('recipient', {
      header: 'Recipient',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('fedex_cost', {
      header: 'Fedex Cost',
      cell: (info) => info.getValue(),
      meta: { align: 'right' }
    }),
    columnHelper.accessor('sent_cost', {
      header: 'Sent Cost',
      cell: (info) => info.getValue(),
      meta: { align: 'right' }
    }),
    columnHelper.accessor('cost_difference', {
      header: 'Cost Difference',
      cell: (info) => info.getValue(),
      meta: { align: 'right' }
    }),
    columnHelper.accessor('cql_number', {
      header: 'CQL Number',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('fedex_return', {
      header: 'Fedex Return',
      cell: (info) => info.getValue(),
      meta: { align: 'right' }
    }),
    columnHelper.accessor('country', {
      header: 'Country',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('dimensions', {
      header: 'Dimensions',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('sent_dimensions', {
      header: 'Sent Dimensions',
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: () => null,
    }),
  ]

  const table = useVueTable({
    get data() {
      return invoiceResults.value || []
    },
    columns,
    state: {
      get sorting() {
        return sorting.value
      },
    },
    onSortingChange: (updater) => {
      sorting.value = updater(sorting.value)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection = updater(
        new Set(
          table.value
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)
        )
      )
      selectedRows.value = Array.from(newSelection)
    },
  })

  const isEditing = computed(() => {
    return (rowId) => editingRecord.value?.id === rowId
  })

  return {
    table,
    isEditing,
    sorting,
  }
}
