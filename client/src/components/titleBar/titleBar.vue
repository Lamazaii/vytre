<template>
  <header class="header">
    <div class="titleBarContent">
      <h1 class="SimpleBar">|</h1>
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
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1468px;
  max-width: 100%;
  z-index: 1000;
}

.titleBarContent {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.SimpleBar {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  color: #E30613;
  line-height: 1;
}

.documentTitle {
  margin: 0;
  font-weight: 300;
  color: #ffffff;
  font-size: 16px;
  line-height: 1;
}

</style>
