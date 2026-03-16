<template>
  <div class="stepNumber" :class="{ active: props.active }">
    {{ numero }}
  </div>
</template>

<script setup lang="ts">
// Displays the visual block step index and active state.
interface Props {
  numero: number;
  active?: boolean;
}

const props = defineProps<Props>(); 
</script>

<style scoped>
.stepNumber {
  width: 40px;
  height: 40px;
  background-color: #C6C6C6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.stepNumber.active {
  background-color: #DC2626;
}
</style>
