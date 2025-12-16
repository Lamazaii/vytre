<script setup lang="ts">
import TitleBar from './components/titleBar/titleBar.vue';
import OptionBar from './components/optionBar/optionBar.vue';
import Element from './components/blockElement/element.vue';
import AddBlockZone from './components/addBlock/addBlockZone.vue';
</script>

<template>
  <div class="app">
    <TitleBar/>

    <OptionBar />

    <Element/>

    <div class= "addBlock"> 
        <AddBlockZone />
    </div>

  </div>

</template>

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #777777;
}

#app {
  font-family: 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 1468px;
  height: 717px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 50px;
  background-color: #F3F4F6;
  margin: auto;
}

.addBlock {
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
