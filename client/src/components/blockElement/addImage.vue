<template>
  <div class="addImageBlock">
    <div class="addImageLogo">
      <img src="../../assets/blockImage/imageIcon.svg" alt="Add" />
    </div>
    <p class="addImageText">Ajouter une image</p>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.addImageBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 2px dashed transparent;
  background-color: transparent;
  padding: 18px;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: border-box;
  width: 900px; 
  height: 68px; 
  transition: all 0.3s ease;
}

.addImageText {
  font-size: 16px;
  color: #000000;
  opacity: 0.5;
  margin: 0; 
  margin-top: 4px;
  transition: all 0.3s ease;
}

.addImageLogo img {
  width: 18px;
  height: 18px;
  opacity: 0.5;
  transition: all 0.3s ease;
}


.addImageBlock:hover {
  border-color: #000000; 
  background-color: #fef2f2;
}

.addImageBlock:hover .addImageText {
  color: #dc2626;
  opacity: 1;
}

.addImageBlock:hover .addImageLogo img {
  opacity: 1; 
  filter: invert(21%) sepia(90%) saturate(6689%) hue-rotate(354deg) brightness(91%) contrast(124%);
}
</style>