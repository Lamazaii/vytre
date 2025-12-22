<template>
  <div class="blockRow">
        <div class="stepNumber">
            {{ numero }}
        </div>
        <div class="blockContent">
            <div class="contentWrapper">
              <div class="description">{{ description }}</div>
              <div v-if="images && images.length > 0" class="imagesContainer">
                <img 
                  v-for="(image, index) in images" 
                  :key="index"
                  :src="image.imagePath" 
                  :alt="`Image ${index + 1}`"
                  class="blockImage"
                />
              </div>
            </div>
        </div>
        <div class="repetitionValue">
            {{ modelValue }}
        </div>
  </div>
</template>


<script setup lang="ts">
import type { Image } from '../../types/Image';

interface Props {
  numero: number;
  description: string;
  modelValue: number;
  images?: Image[];
}

const props = defineProps<Props>();

</script>


<style scoped>
  
.blockRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: auto;
  min-height: 60px;
  margin: 5px 0;
}

.stepNumber {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 0, 0, 0.42);
  width: 30px;
  height: 30px;
  color: rgba(0, 0, 0, 0.42);
  font-weight: bold;
  margin-left:14px;
}

.blockContent {
  background-color: #FFFFFF;
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
  max-width: 100%;
}

.imagesContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;;
}

.blockImage {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.repetitionValue {
    margin-right: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
}
</style>