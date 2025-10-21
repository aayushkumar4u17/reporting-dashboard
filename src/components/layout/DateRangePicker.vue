<template>
  <div class="date-range-picker" ref="datePickerRef">
    <div class="date-input" @click="toggleCalendar">
      <span class="date-value">{{ displayValue || placeholder }}</span>
      <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </div>
    
    <div v-if="showCalendar" class="calendar-dropdown">
      <div class="calendar-header">
        <button @click="previousMonth" class="nav-button">&lt;</button>
        <span class="month-year">{{ monthNames[currentMonth] }} {{ currentYear }}</span>
        <button @click="nextMonth" class="nav-button">&gt;</button>
      </div>
      
      <div class="calendar-grid">
        <div class="day-header" v-for="day in dayNames" :key="day">{{ day }}</div>
        <div 
          v-for="date in calendarDates" 
          :key="date.key"
          :class="['calendar-date', {
            'other-month': !date.isCurrentMonth,
            'selected': date.isSelected,
            'in-range': date.isInRange,
            'range-start': date.isRangeStart,
            'range-end': date.isRangeEnd,
            'today': date.isToday
          }]"
          @click="selectDate(date)"
        >
          {{ date.day }}
        </div>
      </div>
      
      <div class="calendar-footer">
        <button @click="clearDates" class="clear-button">Clear</button>
        <button @click="selectToday" class="today-button">Today</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ from: '', to: '' })
  },
  placeholder: {
    type: String,
    default: 'Select Date Range'
  }
})

const emit = defineEmits(['update:modelValue'])

const datePickerRef = ref(null)
const showCalendar = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectingStart = ref(true)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const displayValue = computed(() => {
  if (!props.modelValue.from && !props.modelValue.to) return ''
  if (props.modelValue.from && !props.modelValue.to) {
    return new Date(props.modelValue.from).toLocaleDateString('en-GB')
  }
  if (props.modelValue.from && props.modelValue.to) {
    const fromDate = new Date(props.modelValue.from).toLocaleDateString('en-GB')
    const toDate = new Date(props.modelValue.to).toLocaleDateString('en-GB')
    return `${fromDate} - ${toDate}`
  }
  return ''
})

const calendarDates = computed(() => {
  const dates = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const today = new Date()
  const fromDate = props.modelValue.from ? new Date(props.modelValue.from) : null
  const toDate = props.modelValue.to ? new Date(props.modelValue.to) : null
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isSelected = (fromDate && isSameDate(date, fromDate)) || (toDate && isSameDate(date, toDate))
    const isInRange = fromDate && toDate && date > fromDate && date < toDate
    const isRangeStart = fromDate && isSameDate(date, fromDate)
    const isRangeEnd = toDate && isSameDate(date, toDate)
    
    dates.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: date.getDate(),
      date: date,
      isCurrentMonth: date.getMonth() === currentMonth.value,
      isSelected,
      isInRange,
      isRangeStart,
      isRangeEnd,
      isToday: isSameDate(date, today)
    })
  }
  
  return dates
})

const isSameDate = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
  if (showCalendar.value) {
    selectingStart.value = true
  }
}

const selectDate = (dateObj) => {
  if (!dateObj.isCurrentMonth) return
  
  const formattedDate = formatDate(dateObj.date)
  
  if (selectingStart.value || !props.modelValue.from) {
    emit('update:modelValue', { from: formattedDate, to: '' })
    selectingStart.value = false
  } else {
    const fromDate = new Date(props.modelValue.from)
    const selectedDate = dateObj.date
    
    if (selectedDate < fromDate) {
      emit('update:modelValue', { from: formattedDate, to: props.modelValue.from })
    } else {
      emit('update:modelValue', { from: props.modelValue.from, to: formattedDate })
    }
    selectingStart.value = true
    showCalendar.value = false
  }
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const clearDates = () => {
  emit('update:modelValue', { from: '', to: '' })
  selectingStart.value = true
  showCalendar.value = false
}

const selectToday = () => {
  const today = new Date()
  const formattedDate = formatDate(today)
  emit('update:modelValue', { from: formattedDate, to: formattedDate })
  showCalendar.value = false
  selectingStart.value = true
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const handleClickOutside = (event) => {
  if (datePickerRef.value && !datePickerRef.value.contains(event.target)) {
    showCalendar.value = false
    selectingStart.value = true
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.date-range-picker {
  position: relative;
  display: inline-block;
  width: 100%;
  z-index: 100;
}

.date-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem;
  border: 2px solid var(--border-medium);
  border-radius: 10px;
  font-size: 0.85rem;
  background: var(--bg-glass);
  backdrop-filter: blur(5px);
  color: var(--text-primary);
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}



.date-input:focus-within {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-light);
  transform: translateY(-2px);
}

.date-value {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  min-width: 0;
}

.calendar-icon {
  color: var(--text-primary);
  margin-left: 8px;
  transition: all 0.3s ease;
}

.calendar-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 12px 40px var(--shadow-medium);
  z-index: 99999;
  overflow: hidden;
  min-width: 280px;
  animation: calendarSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes calendarSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.nav-button {
  background: var(--accent-light);
  border: 1px solid var(--border-light);
  color: var(--accent-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background: var(--bg-hover);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

.month-year {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  text-align: center;
  min-width: 140px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 0.75rem;
  background: var(--bg-primary);
}

.day-header {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 8px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-date {
  text-align: center;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.8rem;
  font-weight: 500;
  position: relative;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}



.calendar-date.other-month {
  color: var(--text-tertiary);
  cursor: default;
}

.calendar-date.other-month:hover {
  background: transparent;
  transform: none;
}

.calendar-date.selected, .calendar-date.range-start, .calendar-date.range-end {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-inverse);
  font-weight: 600;
}

.calendar-date.in-range {
  background: var(--accent-light);
  color: var(--accent-primary);
}

.calendar-date.today {
  border: 2px solid var(--accent-primary);
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  gap: 0.5rem;
}

.clear-button, .today-button {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-primary);
}

.clear-button:hover {
  background: var(--status-error);
  border-color: var(--status-error-text);
  color: var(--status-error-text);
}

.today-button {
  background: var(--accent-light);
  color: var(--accent-primary);
  border-color: var(--border-color);
}

.today-button:hover {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-color: var(--accent-secondary);
}
</style>