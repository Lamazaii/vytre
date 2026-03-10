<template>
  <div class="blockRow">
    <div class="blockContainer">
        <div class="stepNumber">
            {{ numero }}
        </div>
        <div class="blockContent">
            <div class="repetitionValue">
                x{{ modelValue }}
            </div>
            <div class="contentWrapper">
              <div class="description" v-html="description"></div>
              <div v-if="textZones && textZones.length > 0" class="textZonesContainer">
                <div v-for="(zone, index) in textZones" :key="index" class="textZone" v-html="zone">
                </div>
              </div>
              <ReaderViewCanvas v-if="hasCanvasObjects" :canvas-data="canvasData" />
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
import { ref, computed } from 'vue';
import type { Image } from '../../types/Image';
import ImageZoom from '../popup/ImageZoomPopUp.vue';
import ReaderViewCanvas from './readerViewCanvas.vue';

interface Props {
  numero: number;
  description: string;
  modelValue: number;
  images?: Image[];
  textZones?: string[];
  canvasData?: string;
}

const props = defineProps<Props>();

const isModalOpen = ref(false);
const selectedImageSrc = ref('');
const selectedImageAlt = ref('');

const hasCanvasObjects = computed(() => {
  if (!props.canvasData) return false
  try {
    const data = JSON.parse(props.canvasData)
    return data.objects && data.objects.length > 0
  } catch {
    return false
  }
})

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
  justify-content: flex-start;
  height: auto;
  min-height: 60px;
  margin: 5px 0px 5px 0px;
}

.blockContainer {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-left: 25px;
  margin-right: 90px;
}

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
}

.blockContent {
  background-color: #FFFFFF;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: auto;
  min-height: 60px;
  width: 700px;
  font-size: 16px;
  position: relative;
  padding: 0px 15px 0px 15px;
}


.contentWrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  padding-right: 60px;
}

.description {
  font-size: 16px;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: left;
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
  text-align: left;
}



.imagesContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

.blockImage {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.repetitionValue {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #DC2626;
    color: #ffffff;
    font-size: 12px;
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 4px;
    min-width: 30px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    z-index: 10;
}
</style>