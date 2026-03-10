<template>
  <div ref="colorRoot" class="color-button-group">
    <button class="color-select-button" type="button" :title="title">
      <svg v-if="modelValue === 'transparent'" class="color-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666">
        <path d="M792-56 686-162q-32 11-64.5 16.5T554-140q-103 0-174.5-71.5T308-386q0-35 5.5-67.5T330-518L56-792l56-56 736 736-56 56ZM418-468Zm84 228q23 0 44.5-3.5T589-254L450-393q-8 21-11.5 42.5T435-306q0 70 48.5 118T602-140Zm278-92-56-56q8-21 11.5-42.5T839-374q0-70-48.5-118.5T672-541q-23 0-44.5 3.5T584-526l-56-56q32-11 64.5-16.5T660-604q103 0 174.5 71.5T906-358q0 35-5.5 67.5T880-232ZM160-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm-160 0v-80h80v80h-80Zm-160 0v-80h80v80h-80Z"/>
      </svg>
      <svg v-else class="color-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" :fill="modelValue">
        <path :d="iconPath"/>
      </svg>
    </button>
    <button
      class="color-caret-button"
      type="button"
      title="Choisir une couleur"
      aria-haspopup="menu"
      :aria-expanded="showColorPicker"
      @click="toggleColorPicker"
    >
      <span class="color-caret" aria-hidden="true"></span>
    </button>

    <div v-if="showColorPicker" class="colorMenu" role="menu">
      <div class="swatches">
        <button v-if="allowTransparent" class="swatch transparent-swatch" @click="selectColor('transparent')" title="Sans contour" aria-label="Transparent">
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#666">
            <path d="M792-56 56-792l56-56 736 736-56 56Z"/>
          </svg>
        </button>
        <button class="swatch" v-for="c in presetColors" :key="c" :style="{ background: c }" @click="selectColor(c)" :aria-label="c"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: string
  title: string
  iconPath: string
  presetColors?: string[]
  allowTransparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  presetColors: () => ['#000000', '#3b82f6', '#dc2626', '#10b981', '#6b7280', '#f59e0b', '#92400e', '#7c3aed'],
  allowTransparent: false
})

const emit = defineEmits<{
  'update:modelValue': [color: string]
}>()

// Dropdown state and root ref for outside-click detection.
const showColorPicker = ref(false)
const colorRoot = ref<HTMLElement | null>(null)

// Toggle picker visibility.
function toggleColorPicker() {
  showColorPicker.value = !showColorPicker.value
}

// Emit selected color to parent v-model and close picker.
function selectColor(color: string) {
  emit('update:modelValue', color)
  showColorPicker.value = false
}

// Close picker when clicking outside.
function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  
  if (colorRoot.value && !colorRoot.value.contains(target)) {
    showColorPicker.value = false
  }
}

// Expose imperative close helper.
defineExpose({
  closeColorPicker: () => {
    showColorPicker.value = false
  }
})

// Register/unregister outside click listener.
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.color-button-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
}

.color-select-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.color-select-button:hover {
  background: #F9FAFB;
}

.color-caret-button {
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

.color-caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #4B5563;
}

.color-icon {
  width: 20px;
  height: 20px;
  display: block;
}

.colorMenu {
  position: absolute;
  top: 40px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  height: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.swatches {
  display: flex;
  gap: 6px;
  margin-left: 6px;
  margin-right: 6px;
}

.swatch {
  width: 17px;
  height: 17px;
  border-radius: 3px;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 0;
  transition: transform 120ms ease;
}

.swatch:hover {
  transform: scale(1.15);
}

.transparent-swatch {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transparent-swatch svg {
  width: 12px;
  height: 12px;
}
</style>
