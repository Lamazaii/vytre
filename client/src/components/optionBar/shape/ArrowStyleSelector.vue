<template>
  <div ref="arrowStyleMenuRef" class="arrow-style-group">
    <button class="arrow-style-button" type="button" title="Style de flèche">
      <span class="arrow-style-label">{{ label }}: {{ selectedLabel }}</span>
    </button>
    <button
      class="arrow-style-caret-button"
      type="button"
      title="Choisir le style de flèche"
      aria-haspopup="menu"
      :aria-expanded="isArrowStyleMenuOpen"
      @click="toggleArrowStyleMenu"
    >
      <span class="arrow-style-caret" aria-hidden="true"></span>
    </button>

    <div v-if="isArrowStyleMenuOpen" class="arrow-style-menu" role="menu" aria-label="Choisir le style de flèche">
      <button
        v-for="option in options"
        :key="option.value"
        class="arrow-style-menu-item"
        type="button"
        role="menuitem"
        @click="selectArrowStyle(option.value)"
      >
        <span class="arrow-style-menu-label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import type { ArrowHeadStyle } from '../../../stores/shapeStore'

interface Props {
  modelValue: ArrowHeadStyle
  label?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [style: ArrowHeadStyle]
}>()

const isArrowStyleMenuOpen = ref(false)
const arrowStyleMenuRef = ref<HTMLElement | null>(null)

const label = computed(() => props.label ?? 'Extrémité')

const options: Array<{ value: ArrowHeadStyle; label: string }> = [
  { value: 'none', label: 'Aucune' },
  { value: 'open', label: 'Tête vide' },
  { value: 'filled', label: 'Tête pleine' },
]

const selectedLabel = computed(() => {
  const option = options.find((item) => item.value === props.modelValue)
  return option?.label ?? 'Tête pleine'
})

function toggleArrowStyleMenu() {
  isArrowStyleMenuOpen.value = !isArrowStyleMenuOpen.value
}

function selectArrowStyle(style: ArrowHeadStyle) {
  emit('update:modelValue', style)
  isArrowStyleMenuOpen.value = false
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node

  if (arrowStyleMenuRef.value && !arrowStyleMenuRef.value.contains(target)) {
    isArrowStyleMenuOpen.value = false
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
.arrow-style-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
}

.arrow-style-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.arrow-style-button:hover {
  background: #f9fafb;
}

.arrow-style-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #1f2937;
  white-space: nowrap;
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
  gap: 6px;
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
</style>
