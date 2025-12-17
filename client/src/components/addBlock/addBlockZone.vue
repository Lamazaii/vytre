<template>
  <div class="addBlockZone" :class="{ disabled }" @click="onClick">
    <div class="plusIcon">
      <img src="../../assets/blockImage/plusDisable.png" alt="Add" />
    </div >
    <span class="text">Ajouter une nouvelle étape</span>
  </div>
</template>


<script setup lang="ts">
  import {computed } from 'vue'

  const props = defineProps<{ disabled?: boolean }>()
  const disabled = computed(() => props.disabled ?? false)

  const emit = defineEmits<{
    add: []
  }>()

  function onClick() {
    if (disabled.value) return
    emit('add')
  }

</script>


<style scoped>
.addBlockZone {
  width: 1000px;  
  height: 100px;
  border: 2px dashed #cccccc;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, filter 0.2s ease;
  margin-top: 50px;
  margin-left: 218px;
  margin-right: 250px;
}

.addBlockZone:hover {
  border-color: #DC2626;
  background-color: #FDE2E2; 
}

.addBlockZone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.addBlockZone.disabled .text {
  color: #9e9e9e;
}

.plusIcon img {
  width: 30px;
  height: 30px;
}

.addBlockZone:hover .plusIcon img {
  filter: invert(21%) sepia(90%) saturate(6689%) hue-rotate(354deg) brightness(91%) contrast(124%);
}

.text {
  font-size: 16px;
  color: #666666;
  font-weight: 500;
}

.addBlockZone:hover .text {
  color: #DC2626;
}
</style>