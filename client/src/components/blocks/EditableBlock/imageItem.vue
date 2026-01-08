<template>
  <div 
    class="imageItem" 
    :class="{ 'selected-image': isSelected }"
    @click.stop="emit('select')"
  >
    <img :src="imagePath" alt="Illustration" class="blockImage" />
    <div class="removeImageIcon" @click.stop="emit('remove')">
      <img :src="trashRed" alt="Supprimer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import trashRed from '../../../assets/blockImage/trashRed.svg'

defineProps<{
  imagePath: string;
  isSelected: boolean;
}>();

const emit = defineEmits(['select', 'remove']);
</script>

<style scoped>
.imageItem {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
}
.blockImage {
  max-width: 150px;
  max-height: 120px;
  object-fit: contain;
}
.removeImageIcon {
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, filter 0.2s ease, background-color 0.16s ease;
  z-index: 2;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.removeImageIcon img {
  width: 16px;
  height: 16px;
}
.imageItem:hover .removeImageIcon {
  opacity: 0.5;
}
.removeImageIcon:hover {
  opacity: 1 !important;
  background: #E0E0E0;
}
.imageItem.selected-image {
  border: 2px solid #DC2626;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.2);
}
</style>