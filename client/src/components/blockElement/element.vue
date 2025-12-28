<template>
  <div class="element-container">
    <div class="element-content">
    
      <StepNumber :numero="numero" :active="props.active"/>
      <Block 
        :titre="titre"
        :description="description"
        :active="props.active"
        :canDelete="canDelete"
        :images="images"
        @modified="(v) => emit('modified', v)"
        @update:description="(v) => emit('update:description', v)"
        @update:images="(v) => emit('update:images', v)"
        @delete="emit('delete')"
      />

      
      <RepetitionCount v-model="nombreRepetitions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import StepNumber from './stepNumber.vue';
import Block from './block.vue';
import RepetitionCount from './repetitionCount.vue';

interface Props {
  numero?: number;
  titre?: string;
  description?: string;
  modelValue?: number;
  active? : boolean;
  canDelete?: boolean;
  images?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  numero: 1,
  titre: 'Titre du Bloc Éditable',
  description: 'Sélectionnez ce bloc pour l\'éditer.',
  modelValue: 1,
  images: () => []
  canDelete: true
});

const emit = defineEmits<{
  'action-clic': [];
  'update:modelValue': [value: number];
  'update:description': [value: string];
  'update:images': [value: string[]];
  'select': [];
  'modified': [value: boolean];
  'delete': [];
}>();

const nombreRepetitions = ref(props.modelValue);
const images = ref(props.images || []);

watch(nombreRepetitions, (v) => emit('update:modelValue', v));
watch(() => props.images, (newVal) => {
  if (newVal) images.value = newVal;
}, { deep: true });
</script>

<style scoped>

.element-container {
  display: flex;
  align-items: center;
  width: auto;
  margin-top: 20px;
  margin-bottom: 20px;
}

.element-content {
  display: flex;
  gap : 50px;
  align-items: center;
  
}
  
</style>