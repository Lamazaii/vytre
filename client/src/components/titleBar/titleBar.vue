<template>
  <header class="header">
    <div class="headerContent">
      <h1 class="titleBar">|</h1>
      <h1 class="documentTitle">Titre du document</h1>
    </div>
  </header>
</template>

<script setup>
// Pas de logique ici
</script>

<style scoped>
.header {
  background-color: #000000;
  color: rgb(255, 255, 255);
  height: 45px;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1468px;
  max-width: 100%;
  z-index: 1000;

}

.headerContent {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.documentTitle {
  margin: 0;  
  font-weight: 100;
  color: #fff;
  font-size : 20px;
}

.titleBar {
  margin: 0 0 4px;
  font-size: 1.2em;
  font-weight: 900;
  color: #E30613;
}
</style>