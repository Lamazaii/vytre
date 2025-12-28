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
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  
  width: auto;
  max-width: 1468px;
}

.titleBarContent {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-height: 45px;
}

.SimpleBar {
  margin: 0;
  padding: 0;
  font-size: 24px;
  font-weight: 900;
  color: #E30613;
  display:block;
}

.documentTitle {
  margin: 0;
  font-weight: 300;
  color: #ffffff;
  font-size: 16px;
}

</style>
