<template>
  <div class="iconGroupComponent">
    <!-- Edit/left mode button -->
    <button
      class="iconButton"
      :class="{ active: leftActiveLocal }"
      type="button"
      @click="toggleLeft"
      :aria-pressed="leftActiveLocal"
    >
      <img class="iconButtonIcon" :src="personIcon" alt="Edit" />
    </button>

    <button
      class="iconButton"
      :class="{ active: rightActiveLocal }"
      type="button"
      @click="toggleRight"
      :aria-pressed="rightActiveLocal"
    >
      <img class="iconButtonIcon" :src="visibilityIcon" alt="Preview" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    personIcon: string
    visibilityIcon: string
    leftActive?: boolean
    rightActive?: boolean
  }>(),
  { leftActive: false, rightActive: false }
)

const emit = defineEmits<{
  "update:leftActive": [value: boolean]
  "update:rightActive": [value: boolean]
  "change": [value: { left: boolean; right: boolean }]
}>()

// Internal state mirrored from parent props
const leftActiveLocal = ref(props.leftActive)
const rightActiveLocal = ref(props.rightActive)

// Sync when parent props change
watch(() => props.leftActive, (v) => (leftActiveLocal.value = !!v))
watch(() => props.rightActive, (v) => (rightActiveLocal.value = !!v))

// Update both states and emit
function setStates(left: boolean, right: boolean) {
  leftActiveLocal.value = left
  rightActiveLocal.value = right
  emit("update:leftActive", left)
  emit("update:rightActive", right)
  emit("change", { left, right })
}

// Activate left mode
function toggleLeft() {
  if (!leftActiveLocal.value && !rightActiveLocal.value) {
    setStates(true, false)
  } else if (leftActiveLocal.value && !rightActiveLocal.value) {
    return
  } else if (!leftActiveLocal.value && rightActiveLocal.value) {
    setStates(true, false)
  } else {
    setStates(true, false)
  }
}

// Activate right mode
function toggleRight() {
  if (!leftActiveLocal.value && !rightActiveLocal.value) {
    setStates(false, true)
  } else if (!rightActiveLocal.value && leftActiveLocal.value) {
    setStates(false, true)
  } else if (rightActiveLocal.value && !leftActiveLocal.value) {
    return
  } else {
    setStates(false, true)
  }
}
</script>

<style scoped>
.iconGroupComponent {
  display: flex;
  align-items: center;
  gap: 4px;
}

.iconButton {
  width: 36px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.iconButton .iconButtonIcon {
  width: 18px;
  height: 18px;
  opacity: 0.5;
}

.iconButton.active {
  background: #fff2f2;
  border-color: transparent;
}

.iconButton.active .iconButtonIcon {
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(6329%) hue-rotate(357deg) brightness(92%) contrast(102%);
  opacity: 1;
}
</style>
