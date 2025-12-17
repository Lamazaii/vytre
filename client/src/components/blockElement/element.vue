<template>
  <div class="element-container">
    <StepNumber :numero="numero" :active="props.active"/>
    
    <div class="element-content">
      <Block 
        :titre="titre"
        :description="description"
        :active="props.active"
        @modified="(v) => emit('modified', v)"
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
}

const props = withDefaults(defineProps<Props>(), {
  numero: 1,
  titre: 'Titre du Bloc Éditable',
  description: 'Sélectionnez ce bloc pour l\'éditer.',
  modelValue: 1
});

const emit = defineEmits<{
  'action-clic': [];
  'update:modelValue': [value: number];
  'select': [];
  'modified': [value: boolean];
}>();

const nombreRepetitions = ref(props.modelValue);
watch(nombreRepetitions, (v) => emit('update:modelValue', v))
</script>

<style scoped>
.element-container {
  display: flex;
  gap: 50px;
  align-items: center;
  width: 100%;
  padding-top: 189px;
  padding-left: 128px;
  padding-right: 140px;
}

.element-content {
  display: flex;
  gap: 50px;
  align-items: center;
  flex: 1;
}
</style>
