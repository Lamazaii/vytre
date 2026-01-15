<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="image-wrapper">
          <img 
            :src="imageSrc" 
            :alt="imageAlt" 
            class="modal-image" 
            :style="imageStyle" 
          />
          <button class="close-button" @click="close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  isOpen: boolean;
  imageSrc: string;
  imageAlt?: string;
  defaultWidth?: number; 
  defaultHeight?: number; 
}

const props = withDefaults(defineProps<Props>(), {
  defaultWidth: 500,
  defaultHeight: 500
});

const emit = defineEmits<{
  close: []
}>();

const close = () => {
  emit('close');
};

const imageStyle = computed(() => {
  return {
    width: `${props.defaultWidth}px`,
    height: `${props.defaultHeight}px`,
    objectFit: 'contain' as const
  };
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  cursor: default;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  width: 500px;
  height: 500px;
}

.modal-image {
  width: 100%;
  height: 100%;
  display: block;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 10px;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  background-color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 10;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
