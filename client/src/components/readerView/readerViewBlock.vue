<template>
  <div class="blockRow">
        <div class="stepNumber">
            {{ numero }}
        </div>
        <div class="blockContent">
            {{ description }}
        </div>
        <div class="repetitionValue">
            {{ modelValue }}
        </div>
  </div>
</template>


<script setup lang="ts">

interface Props {
  numero: number;
  description: string;
  modelValue: number;
}

const props = defineProps<Props>();

</script>


<style scoped>
  
.blockRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
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
  display : flex;
  align-items: center;
  justify-content: center;
  height: auto;
  min-height: 60px;
  width: 700px;
  font-size: 16px;;
}

.repetitionValue {
    margin-right: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
}
</style>