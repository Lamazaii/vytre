<template>
  <div ref="colorRoot" class="color-button-group">
    <button class="color-select-button" type="button" :title="title">
      <img v-if="modelValue === 'transparent'" class="color-icon" :src="noTextureIcon" alt="Sans texture" />
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
import noTextureIcon from '../../../assets/formOptionBar/noTexture.svg'

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

const showColorPicker = ref(false)
const colorRoot = ref<HTMLElement | null>(null)

function toggleColorPicker() {
  showColorPicker.value = !showColorPicker.value
}

function selectColor(color: string) {
  emit('update:modelValue', color)
  showColorPicker.value = false
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  
  if (colorRoot.value && !colorRoot.value.contains(target)) {
    showColorPicker.value = false
  }
}

defineExpose({
  closeColorPicker: () => {
    showColorPicker.value = false
  }
})

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
