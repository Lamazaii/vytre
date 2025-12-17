<template>
  <div class="stepNumber">
    {{ numero }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  numero: number;
  ative?: boolean;
}

const props = defineProps<Props>();
const active = props.ative ?? false; 
</script>

<style scoped>
.stepNumber {
  width: 40px;
  height: 40px;
  background-color: #DC2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
</style>
