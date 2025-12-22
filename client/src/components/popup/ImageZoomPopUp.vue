<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="close">×</button>
        <img :src="imageSrc" :alt="imageAlt" class="modal-image" />
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
  position: relative;
  cursor: default;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #FF0000;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}
</style>
