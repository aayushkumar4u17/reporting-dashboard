<template>
  <div class="date-picker" ref="datePickerRef">
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
            'today': date.isToday
          }]"
          @click="selectDate(date)"
        >
          {{ date.day }}
        </div>
      </div>
      
      <div class="calendar-footer">
        <button @click="clearDate" class="clear-button">Clear</button>
        <button @click="selectToday" class="today-button">Today</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select Date'
  }
})

const emit = defineEmits(['update:modelValue'])

const datePickerRef = ref(null)
const showCalendar = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const date = new Date(props.modelValue)
  return date.toLocaleDateString('en-GB')
})

const calendarDates = computed(() => {
  const dates = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const today = new Date()
  const selectedDate = props.modelValue ? new Date(props.modelValue) : null
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    dates.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: date.getDate(),
      date: date,
      isCurrentMonth: date.getMonth() === currentMonth.value,
      isSelected: selectedDate && 
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate(),
      isToday: date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    })
  }
  
  return dates
})

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const selectDate = (dateObj) => {
  if (!dateObj.isCurrentMonth) return
  
  const formattedDate = formatDate(dateObj.date)
  emit('update:modelValue', formattedDate)
  showCalendar.value = false
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const clearDate = () => {
  emit('update:modelValue', '')
  showCalendar.value = false
}

const selectToday = () => {
  const today = new Date()
  const formattedDate = formatDate(today)
  emit('update:modelValue', formattedDate)
  showCalendar.value = false
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
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    currentMonth.value = date.getMonth()
    currentYear.value = date.getFullYear()
  }
})
</script>

<style scoped>
.date-picker {
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
  min-width: 120px;
  width: 130px;
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
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-value:empty::before {
  content: attr(data-placeholder);
  color: var(--text-tertiary);
  font-weight: normal;
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
  right: 0;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 2px solid var(--border-medium);
  border-radius: 12px;
  box-shadow: 0 12px 40px var(--shadow-medium), 0 0 0 1px var(--border-light);
  z-index: 99999;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  animation: calendarSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  min-width: 280px;
}

@keyframes calendarSlideIn {
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
  box-shadow: 0 4px 12px var(--accent-light);
}

.nav-button:active {
  transform: translateY(0);
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

.calendar-date:hover {
  background: var(--accent-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-light);
}

.calendar-date.other-month {
  color: var(--text-tertiary);
  cursor: default;
}

.calendar-date.other-month:hover {
  background: transparent;
  transform: none;
  box-shadow: none;
}

.calendar-date.selected {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-inverse);
  font-weight: 600;
  box-shadow: 0 4px 12px var(--accent-light);
}

.calendar-date.selected:hover {
  background: linear-gradient(135deg, var(--accent-secondary), #008A37);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--accent-light);
}

.calendar-date.today {
  background: var(--accent-light);
  color: var(--accent-primary);
  font-weight: 600;
  border: 2px solid var(--border-color);
}

.calendar-date.today:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
}

.calendar-date.selected.today {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-inverse);
  border: 2px solid var(--accent-secondary);
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
  transform: translateY(-1px);
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
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--accent-light);
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-dropdown {
    left: -50%;
    right: -50%;
    min-width: 280px;
  }
  
  .calendar-header {
    padding: 0.75rem;
  }
  
  .nav-button {
    padding: 4px 8px;
    font-size: 12px;
    min-width: 28px;
    height: 28px;
  }
  
  .month-year {
    font-size: 0.85rem;
    min-width: 120px;
  }
  
  .calendar-grid {
    padding: 0.5rem;
  }
  
  .day-header {
    font-size: 0.65rem;
    padding: 6px 2px;
  }
  
  .calendar-date {
    font-size: 0.75rem;
    padding: 6px 2px;
    min-height: 28px;
  }
  
  .calendar-footer {
    padding: 0.5rem 0.75rem;
  }
  
  .clear-button, .today-button {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .date-input {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .calendar-dropdown {
    left: -75%;
    right: -75%;
    min-width: 260px;
  }
  
  .calendar-header {
    padding: 0.5rem;
  }
  
  .nav-button {
    padding: 3px 6px;
    font-size: 11px;
    min-width: 24px;
    height: 24px;
  }
  
  .month-year {
    font-size: 0.8rem;
    min-width: 100px;
  }
  
  .calendar-date {
    font-size: 0.7rem;
    min-height: 24px;
  }
  
  .day-header {
    font-size: 0.6rem;
  }
}
</style>