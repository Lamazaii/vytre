<template>
  <div class="addImageBlock" @click="triggerFileInput">
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none"
      @change="handleImageSelect"
    />
    <div class="addImageLogo">
      <img src="../../assets/blockImage/imageIcon.svg" alt="Add" />
    </div>
    <p class="addImageText">Ajouter une image</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  imageSelected: [imageData: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input?.files
  
  if (!files || files.length === 0) {
    console.warn('Aucun fichier sélectionné')
    return
  }

  const file = files[0]
  
  if (!file) {
    console.error('Erreur lors de la récupération du fichier')
    return
  }

  if (!file.type.startsWith('image/')) {
    console.error('Veuillez sélectionner une image')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const imageData = e.target?.result
    if (!imageData || typeof imageData !== 'string') {
      console.error('Erreur lors de la lecture du fichier')
      return
    }
    emit('imageSelected', imageData)
    input.value = ''
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.addImageBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 2px dashed transparent;
  background-color: transparent;
  padding: 18px;
  margin-left: 50px;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: border-box;
  width: 900px; 
  height: 68px; 
  transition: all 0.3s ease;
}

.addImageText {
  font-size: 16px;
  color: #000000;
  opacity: 0.5;
  margin: 0; 
  margin-top: 4px;
  transition: all 0.3s ease;
}

.addImageLogo img {
  width: 18px;
  height: 18px;
  opacity: 0.5;
  transition: all 0.3s ease;
}


.addImageBlock:hover {
  border-color: #000000; 
  background-color: #fef2f2;
}

.addImageBlock:hover .addImageText {
  color: #dc2626;
  opacity: 1;
}

.addImageBlock:hover .addImageLogo img {
  opacity: 1; 
  filter: invert(21%) sepia(90%) saturate(6689%) hue-rotate(354deg) brightness(91%) contrast(124%);
}
</style>