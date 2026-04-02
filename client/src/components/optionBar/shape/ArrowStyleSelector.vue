<template>
  <div class="arrow-style-containers">
    <!-- Start arrow head style -->
    <div ref="arrowStyleMenuRefStart" class="arrow-style-group start-group">
      <button class="arrow-style-button" type="button" title="Style de début de flèche">
        <div class="arrow-head-preview start" :class="`head-preview-${modelValue}`"></div>
      </button>
      <button
        class="arrow-style-caret-button"
        type="button"
        title="Choisir le style de début"
        aria-haspopup="menu"
        :aria-expanded="isArrowStyleMenuOpenStart"
        @click="toggleArrowStyleMenuStart"
      >
        <span class="arrow-style-caret" aria-hidden="true"></span>
      </button>

      <!-- Start style menu dropdown -->
      <div v-if="isArrowStyleMenuOpenStart" class="arrow-style-menu" role="menu" aria-label="Choisir le style de début">
        <button
          v-for="option in options"
          :key="option.value"
          class="arrow-style-menu-item"
          type="button"
          role="menuitem"
          @click="selectArrowStyle(option.value, 'start')"
        >
          <div class="arrow-preview start-preview" :class="`preview-${option.value}`"></div>
          <span class="arrow-style-menu-label">{{ option.label }}</span>
        </button>
      </div>
    </div>

    <!-- End arrow head style -->
    <div ref="arrowStyleMenuRefEnd" class="arrow-style-group end-group">
      <button class="arrow-style-button" type="button" title="Style de fin de flèche">
        <div class="arrow-head-preview end" :class="`head-preview-${endValue}`"></div>
      </button>
      <button
        class="arrow-style-caret-button"
        type="button"
        title="Choisir le style de fin"
        aria-haspopup="menu"
        :aria-expanded="isArrowStyleMenuOpenEnd"
        @click="toggleArrowStyleMenuEnd"
      >
        <span class="arrow-style-caret" aria-hidden="true"></span>
      </button>

      <!-- End style menu dropdown -->
      <div v-if="isArrowStyleMenuOpenEnd" class="arrow-style-menu" role="menu" aria-label="Choisir le style de fin">
        <button
          v-for="option in options"
          :key="option.value"
          class="arrow-style-menu-item"
          type="button"
          role="menuitem"
          @click="selectArrowStyle(option.value, 'end')"
        >
          <div class="arrow-preview" :class="`preview-${option.value}`"></div>
          <span class="arrow-style-menu-label">{{ option.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useShapeStore } from '../../../stores/shapeStore'

// Arrow style store
const shapeStore = useShapeStore()

// Dropdown states for start and end arrows
const isArrowStyleMenuOpenStart = ref(false)
const isArrowStyleMenuOpenEnd = ref(false)
const arrowStyleMenuRefStart = ref<HTMLElement | null>(null)
const arrowStyleMenuRefEnd = ref<HTMLElement | null>(null)

// Available arrow head options
const options: Array<{ value: string; label: string }> = [
  { value: 'none', label: 'Aucune' },
  { value: 'stroke', label: 'Trait' },
  { value: 'open', label: 'Vide' },
  { value: 'filled', label: 'Pleine' },
]

const modelValue = computed(() => shapeStore.arrowStartStyle)
const endValue = computed(() => shapeStore.arrowEndStyle)

// Toggle start arrow style menu
function toggleArrowStyleMenuStart() {
  isArrowStyleMenuOpenStart.value = !isArrowStyleMenuOpenStart.value
  isArrowStyleMenuOpenEnd.value = false
}

// Toggle end arrow style menu
function toggleArrowStyleMenuEnd() {
  isArrowStyleMenuOpenEnd.value = !isArrowStyleMenuOpenEnd.value
  isArrowStyleMenuOpenStart.value = false
}

// Update arrow head style in store
function selectArrowStyle(style: string, end: 'start' | 'end') {
  if (end === 'start') {
    shapeStore.arrowStartStyle = style as any
    isArrowStyleMenuOpenStart.value = false
  } else {
    shapeStore.arrowEndStyle = style as any
    isArrowStyleMenuOpenEnd.value = false
  }
}

// Close menus when clicking outside
function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node

  if (arrowStyleMenuRefStart.value && !arrowStyleMenuRefStart.value.contains(target)) {
    isArrowStyleMenuOpenStart.value = false
  }
  if (arrowStyleMenuRefEnd.value && !arrowStyleMenuRefEnd.value.contains(target)) {
    isArrowStyleMenuOpenEnd.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.arrow-style-containers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.arrow-style-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
}

.arrow-style-button {
  height: 30px;
  width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.arrow-style-button:hover {
  background: #f9fafb;
}

.arrow-head-preview {
  width: 32px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.head-preview-none {
  width: 20px;
  height: 2px;
  background: #1f2937;
  border-radius: 1px;
}

.head-preview-stroke {
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 30 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='1' y1='10' x2='18' y2='10' stroke='%231f2937' stroke-width='1.5'/%3E%3Cline x1='22' y1='10' x2='18' y2='6' stroke='%231f2937' stroke-width='1.5'/%3E%3Cline x1='22' y1='10' x2='18' y2='14' stroke='%231f2937' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat center;
}

.head-preview-open {
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 30 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='1' y1='10' x2='16' y2='10' stroke='%231f2937' stroke-width='1.5'/%3E%3Cpolygon points='22,10 16,6 16,14' fill='none' stroke='%231f2937' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat center;
}

.head-preview-filled {
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 30 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='1' y1='10' x2='16' y2='10' stroke='%231f2937' stroke-width='1.5'/%3E%3Cpolygon points='22,10 16,6 16,14' fill='%231f2937'/%3E%3C/svg%3E") no-repeat center;
}

/* Start arrows point left (flipped) */
.arrow-head-preview.start {
  transform: scaleX(-1);
}

.arrow-preview.start-preview {
  transform: scaleX(-1);
}

.arrow-style-caret-button {
  width: 22px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.arrow-style-caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #4b5563;
}

.arrow-style-menu {
  position: absolute;
  top: 40px;
  min-width: 215px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.arrow-style-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.arrow-style-menu-item:hover {
  background: #f3f4f6;
}

.arrow-style-menu-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #1f2937;
}

.arrow-preview {
  width: 50px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.preview-none {
  width: 32px;
  height: 2px;
  background: #1f2937;
  border-radius: 1px;
}

.preview-stroke {
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 50 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='10' x2='32' y2='10' stroke='%231f2937' stroke-width='1'/%3E%3Cline x1='40' y1='10' x2='30' y2='4' stroke='%231f2937' stroke-width='1'/%3E%3Cline x1='40' y1='10' x2='30' y2='16' stroke='%231f2937' stroke-width='1'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

.preview-open {
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 50 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='10' x2='28' y2='10' stroke='%231f2937' stroke-width='1'/%3E%3Cpolygon points='40,10 30,4 30,16' fill='none' stroke='%231f2937' stroke-width='1'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

.preview-filled {
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 50 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='10' x2='30' y2='10' stroke='%231f2937' stroke-width='1'/%3E%3Cpolygon points='40,10 30,4 30,16' fill='%231f2937'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}
</style>
