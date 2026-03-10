<template>
  <div ref="strokeWidthMenuRef" class="stroke-width-group">
    <button class="stroke-width-button" type="button" title="Épaisseur du contour">
      <div class="stroke-width-preview" :style="{ height: modelValue + 'px' }"></div>
      <span class="stroke-width-label">{{ modelValue }}px</span>
    </button>
    <button
      class="stroke-width-caret-button"
      type="button"
      title="Choisir l'épaisseur"
      aria-haspopup="menu"
      :aria-expanded="isStrokeWidthMenuOpen"
      @click="toggleStrokeWidthMenu"
    >
      <span class="stroke-width-caret" aria-hidden="true"></span>
    </button>

    <div v-if="isStrokeWidthMenuOpen" class="stroke-width-menu" role="menu" aria-label="Choisir l'épaisseur">
      <button 
        v-for="width in availableStrokeWidths" 
        :key="width"
        class="stroke-width-menu-item" 
        type="button" 
        role="menuitem" 
        @click="selectStrokeWidth(width)"
      >
        <div class="stroke-width-preview" :style="{ height: width + 'px' }"></div>
        <span class="stroke-width-menu-label">{{ width }}px</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: number
  strokeWidthOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  strokeWidthOptions: () => [1, 2, 3, 4, 5]
})

const emit = defineEmits<{
  'update:modelValue': [width: number]
}>()

// Dropdown state and root ref for outside click detection.
const isStrokeWidthMenuOpen = ref(false)
const strokeWidthMenuRef = ref<HTMLElement | null>(null)

// List selectable widths excluding currently active one.
const availableStrokeWidths = computed(() => {
  return props.strokeWidthOptions.filter(w => w !== props.modelValue)
})

// Toggle width menu visibility.
function toggleStrokeWidthMenu() {
  isStrokeWidthMenuOpen.value = !isStrokeWidthMenuOpen.value
}

// Emit selected width and close dropdown.
function selectStrokeWidth(width: number) {
  emit('update:modelValue', width)
  isStrokeWidthMenuOpen.value = false
}

// Close menu when clicking outside the component.
function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  
  if (strokeWidthMenuRef.value && !strokeWidthMenuRef.value.contains(target)) {
    isStrokeWidthMenuOpen.value = false
  }
}

// Register/unregister outside click listener.
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.stroke-width-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
}

.stroke-width-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.stroke-width-button:hover {
  background: #F9FAFB;
}

.stroke-width-caret-button {
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

.stroke-width-caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #4B5563;
}

.stroke-width-menu {
  position: absolute;
  top: 40px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.stroke-width-menu-item {
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

.stroke-width-menu-item:hover {
  background: #F3F4F6;
}

.stroke-width-preview {
  width: 30px;
  background-color: #1F2937;
  border-radius: 2px;
}

.stroke-width-menu-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #1F2937;
}

.stroke-width-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1F2937;
  font-weight: 500;
}
</style>
