<template>
  <div class="repetitionCountWrapper">
    <span class="label">RÉP.</span>
    <div class="repetitionCount">
      <div class="repetitionBox" :style="{ width: boxWidth + 'px' }">
        <div class="repetitionInner" :style="{ width: innerWidth + 'px' }">
          <input 
            v-model.number="inputValue"
            type="number" 
            min="0.001"
            max="9999"
            step="0.001"
            class="repetitionInput"
            @input="handleInput"
            @blur="handleBlur"
            ref="inputRef"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  
  import { ref, watch, computed } from 'vue';

  interface Props {
    modelValue?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: 1
  });

  const emit = defineEmits<{
    'update:modelValue': [value: number];
  }>();

  const inputValue = ref<number | string>(props.modelValue);
  const inputRef = ref<HTMLInputElement | null>(null);

  const inputWidth = computed(() => {
    const valueStr = String(inputValue.value);
    const length = valueStr.length;
    return Math.max(40, Math.min(length * 12 + 16, 120));
  });

  const innerWidth = computed(() => inputWidth.value + 4);
  const boxWidth = computed(() => innerWidth.value + 20);

  watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal;
  });

  const handleInput = () => {
    const val = Number(inputValue.value);
    if (inputValue.value !== '' && !isNaN(val)) {
      const rounded = Math.round(val * 1000) / 1000;
      emit('update:modelValue', rounded);
    }
  };

  const handleBlur = () => {
    const numericValue = Number(inputValue.value);

    if (inputValue.value === '' || numericValue < 0.001) {
      inputValue.value = 1;
      emit('update:modelValue', 1);
    } else if (numericValue > 9999) {
      inputValue.value = 9999;
      emit('update:modelValue', 9999);
    } else {
      const rounded = Math.round(numericValue * 1000) / 1000;
      if (rounded !== numericValue) {
        inputValue.value = rounded;
        emit('update:modelValue', rounded);
      }
    }
  };

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
  min-width: 60px;
  max-width: 100px;
  height: 60px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  transition: width 0.2s ease;
}

.repetitionInner {
  min-width: 40px;
  max-width: 80px;
  height: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  transition: width 0.2s ease;
}

.repetitionInput {
  width: 100%;
  max-width: 35px;
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
