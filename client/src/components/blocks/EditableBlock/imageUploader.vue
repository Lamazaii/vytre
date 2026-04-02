<template>
  <!-- Image upload area with file picker -->
  <div class="addImage" @click="triggerFileInput">
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none"
      @change="handleImageSelect"
    />
    <div class="addImageLogo">
      <img src="../../../assets/blockImage/imageIcon.svg" alt="Add" />
    </div>
    <p class="addImageText">Ajouter une image</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useErrorPopupStore } from '../../../stores/errorPopupStore'

// Emit data URL when image selected
const emit = defineEmits(['upload']);
// Hidden file input ref
const fileInput = ref<HTMLInputElement | null>(null);
// Error store for size validation messages
const errorPopupStore = useErrorPopupStore();

// Open native file picker
const triggerFileInput = () => fileInput.value?.click();

// Read and validate selected image
const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;

  // Validate file size (max 5MB)
  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    errorPopupStore.show(`L'image est trop volumineuse (${sizeInMB} MB). La taille maximale autorisée est de 5 MB.`);
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const imageData = e.target?.result;
    // Emit base64 data URL
    if (typeof imageData === 'string') {
      emit('upload', imageData);
      input.value = '';
    }
  };
  reader.readAsDataURL(file);
};
// Expose picker trigger for toolbar-driven image insertion.
defineExpose({
  triggerFileInput
})
</script>

<style scoped>
.addImage {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 900px;
  height: 68px;
  z-index: 1;
  flex-direction: column;
  border: 2px dashed transparent;
  background-color: transparent;
  border-radius: 8px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}
.addImageText {
  font-size: 16px;
  color: #000000;
  opacity: 0.5;
  margin: 0; 
  margin-top: 4px;
}
.addImageLogo img {
  width: 18px;
  height: 18px;
  opacity: 0.5;
}
.addImage:hover {
  background-color: #fef2f2;
  border-color: #DC2626;
}
.addImage:hover .addImageText {
  color: #DC2626;
  opacity: 1;
}
.addImage:hover .addImageLogo img {
  opacity: 1;
  filter: invert(21%) sepia(90%) saturate(6689%) hue-rotate(354deg) brightness(91%) contrast(124%);
}
</style>