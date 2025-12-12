<template>
  <button
    @click="exportToCSV"
    :disabled="!hasData"
    :class="[
      'export-btn',
      hasData ? 'enabled' : 'disabled'
    ]"
    :title="hasData ? 'Export orders to CSV' : 'No orders to export'"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Export CSV
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  orders: any[];
  filename?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filename: 'orders'
});

const hasData = computed(() => {
  return props.orders && props.orders.length > 0;
});

const exportToCSV = () => {
  if (!hasData.value) return;
  
  const headers = [
    'App Order No',
    'Sales Order Code', 
    'Order Date',
    'Delivery Date',
    'Delivery Time',
    'Order Quantity',
    'City',
    'POC Name',
    'POC Contact',
    'Status'
  ];
  
  const csvContent = [
    headers.join(','),
    ...props.orders.map((order: any) => {
      return [
        order.aspOrderNo || '-',
        order.salesOrderCode || '-',
        order.orderedDate || '-',
        order.deliveryDate || '-',
        order.deliveryTimeSlot || '-',
        order.orderedQuantity || '-',
        order.deliveryLocation || '-',
        order.pocName || '-',
        order.pocContact || '-',
        order.deliveryStatus || '-'
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    })
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${props.filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.export-btn.enabled {
  background: #10b981;
  color: white;
}

.export-btn.enabled:hover {
  background: #059669;
  transform: translateY(-1px);
}

.export-btn.disabled {
  background: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
}

.export-btn svg {
  flex-shrink: 0;
}
</style>