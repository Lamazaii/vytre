<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="image-wrapper">
          <img :src="imageSrc" :alt="imageAlt" class="modal-image" />
          <button class="close-button" @click="close">×</button>
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

const props = defineProps<Props>();
const emit = defineEmits<{
  close: []
}>();

const close = () => {
  emit('close');
};
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
}

.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  display: block;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 26px;
  font-weight: 300;
  line-height: 36px;
  font-family: Arial, sans-serif;
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
