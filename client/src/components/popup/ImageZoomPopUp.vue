<template>
  <!-- Image zoom overlay -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="image-wrapper">
          <img 
            :src="imageSrc" 
            :alt="imageAlt" 
            class="modal-image" 
          />
          <button class="close-button" @click="close" aria-label="Fermer">
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
interface Props {
  isOpen: boolean;
  imageSrc: string;
  imageAlt?: string;
}

// Props for modal state and image data
const props = defineProps<Props>();
// Close event emitter
const emit = defineEmits<{ close: [] }>();

const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000; 
  padding: 20px;
}

.image-wrapper {
position: relative;
  width: 60vw; 
  height: 50vh;
  max-width: 1000px;
  max-height: 800px;
  
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain; 
  display: block;
}

.close-button {
  position: absolute;
  top: -50px;
  right: -50px;
  border: none;
  border-radius: 20%; 
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  background-color: #dc2626; 
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.close-button:hover {
  transform: scale(1.1);
  background-color: #dc2626;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>