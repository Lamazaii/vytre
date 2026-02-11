<template>
  <div class="blockRow">
        <div class="stepNumber">
            {{ numero }}
        </div>
        <div class="blockContent">
            <div class="contentWrapper">
              <div class="description" v-html="description"></div>
              <div v-if="textZones && textZones.length > 0" class="textZonesContainer">
                <div v-for="(zone, index) in textZones" :key="index" class="textZone" v-html="zone">
                </div>
              </div>
              <div v-if="images && images.length > 0" class="imagesContainer">
                <img 
                  v-for="(image, index) in images" 
                  :key="index"
                  :src="image.imagePath" 
                  :alt="`Image ${index + 1}`"
                  class="blockImage"
                  @click="openImageZoom(image.imagePath, `Image ${index + 1}`)"
                />
              </div>
            </div>
        </div>
        <div class="repetitionValue">
            {{ modelValue }}
        </div>
  </div>
  
  <ImageZoom 
    :isOpen="isModalOpen" 
    :imageSrc="selectedImageSrc" 
    :imageAlt="selectedImageAlt"
    :defaultHeight="500"
    :defaultWidth="500"
    @close="closeImageModal" 
  />
</template>


<script setup lang="ts">
import { ref } from 'vue';
import type { Image } from '../../types/Image';
import ImageZoom from '../popup/ImageZoomPopUp.vue';

interface Props {
  numero: number;
  description: string;
  modelValue: number;
  images?: Image[];
  textZones?: string[];
}

const props = defineProps<Props>();

const isModalOpen = ref(false);
const selectedImageSrc = ref('');
const selectedImageAlt = ref('');

const openImageZoom = (src: string, alt: string) => {
  selectedImageSrc.value = src;
  selectedImageAlt.value = alt;
  isModalOpen.value = true;
};

const closeImageModal = () => {
  isModalOpen.value = false;
};

</script>


<style scoped>
  
.blockRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  width:auto;
  max-width: 911px;
  height: auto;
  min-height: 60px;
  margin: 5px 0px;
  padding: 0px 25px;
}

.stepNumber {
  border-radius: 20px;
  padding-bottom: 1px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 0, 0, 0.42);
  width: 30px;
  height: 30px;
  color: rgba(0, 0, 0, 0.42);
  font-size: 22px;
}

.blockContent {
  background-color: #FFFFFF;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
  min-height: 60px;
  width: 700px;
  font-size: 16px;
}


.contentWrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.description {
  font-size: 16px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.textZonesContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.textZone {
  font-size: 16px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}



.imagesContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;;
}

.blockImage {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.repetitionValue {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    font-size: 24px;
}
</style>