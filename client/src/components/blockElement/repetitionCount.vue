<template>
  <div class="repetitionCountWrapper">
    <span class="label">RÉP.</span>
    <div class="repetitionCount">
      <div class="repetitionBox">
        <div class="repetitionInner">
          <input 
            type="number" 
            v-model.number="nombreRepetitions" 
            min="1"
            class="repetitionInput"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const nombreRepetitions = ref(props.modelValue);

watch(nombreRepetitions, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped>
.repetitionCountWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.label {
  font-size: 12px;
  color: #666666;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.repetitionCount {
  display: flex;
  align-items: center;
  justify-content: center;
}

.repetitionBox {
  width: 60px;
  height: 60px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}

.repetitionInner {
  width: 40px;
  height: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}

.repetitionInput {
  width: 100%;
  height: 100%;
  border: none;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #000000;
  outline: none;
  background-color: transparent;
}

.repetitionInput::-webkit-outer-spin-button,
.repetitionInput::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.repetitionInput[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>
