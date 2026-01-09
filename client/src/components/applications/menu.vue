<template>
  <div class="menuContainer">
    <div class="headerContent">
      <div class="titleSection">
        <h2>Mes Documents</h2>
      </div>
      
      <div class="searchSection">
        <input type="text" placeholder="Rechercher..." class="searchInput" />
        <button class="newButton" @click="$emit('selectMode', 'editor')">+ Nouveau</button>
      </div>
    </div>

    <div class="documentsList">
      <div 
        v-for="(doc, index) in documents" 
        :key="index"
        class="documentCard"
      >
        <div class="docIcon">
          <img :src="fileIcon" alt="Document Icon" />
        </div>
        <div class="docInfo">
          <h3>{{ doc.title }}</h3>
          <div class="docMeta">
            <span class="docTime"><img :src="timeImage" alt="Time" class="timeIcon" /> {{ doc.time }}</span>
          </div>
        </div>
        <div class="docActions">
          <button class="actionButton read" @click="openDocument(doc)">
            <img :src="readIcon" alt="Read" class="buttonIcon" /> Lire
          </button>
          <button class="actionButton edit" @click="editDocument(doc)">
            <img :src="editIcon" alt="Edit" class="buttonIcon" /> Modifier
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import fileIcon from '../../assets/menu/file-text.svg'
import timeImage from '../../assets/menu/timer.svg'
import readIcon from '../../assets/optionBarImage/visibility.svg'
import editIcon from '../../assets/menu/edit.svg'

const emit = defineEmits<{
  (e: 'selectMode', mode: 'editor' | 'reader'): void
}>()

const documents = ref([
  { title: 'Nouveau Document', time: 'À l\'instant', type: 'TECHNIQUE' },
  { title: 'Nouveau Document', time: 'À l\'instant', type: 'TECHNIQUE' },
  { title: 'Rapport de Projet Annuel', time: 'Il y a 2h', type: 'TECHNIQUE' },
  { title: 'Notes Réunion Technique', time: 'Hier', type: 'TECHNIQUE' },
  { title: 'Spécifications Design', time: 'Il y a 3 jours', type: 'TECHNIQUE' },
])

function openDocument(doc: any) {
  console.log('Ouverture en lecture:', doc)
}

function editDocument(doc: any) {
  emit('selectMode', 'editor')
}
</script>

<style scoped>
.menuContainer {
  width: 100%;
  background-color: #f8f8f8;
  padding: 0;
  min-height: 717px;
}

.headerContent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  border-bottom: 1px solid #e0e0e0;
  margin : 0 80px;
}

.titleSection {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.searchSection {
  display: flex;
  gap: 10px;
  align-items: center;
}

.searchInput {
  padding: 9px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 250px;
  font-size: 14px;
  color: #999;
}

.searchInput::placeholder {
  color: #ccc;
}

.newButton {
  padding: 10px 20px;
  width : 110px;
  font-size: 14px;
  font-weight: 600;
  background-color: #DC2626;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
}

.newButton:hover {
  background-color: #b91c1c;
}


.documentsList {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 0 80px;
  margin-top: 25px;
  gap : 15px;
}


.logo {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.documentCard {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 70px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.3s ease;
}

.documentCard:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.docIcon {
  margin-left : 20px;
  background-color: #f0f0f0;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.docInfo h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.docMeta {
  display: flex;
  font-size: 12px;
  color: #999;
}

.docTime {
  display: flex;
  align-items: center;
}

.timeIcon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  opacity: 0.6;
}

.docActions {
  display: flex;
  gap: 10px;
  margin-left: auto;
  margin-right: 20px;
}

.actionButton {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.buttonIcon {
  width: 16px;
  height: 16px;
}

.actionButton.read {
  background-color: transparent;
  font-weight: 700;
}

.actionButton.read:hover {
  background-color: #f5f5f5;
}

.actionButton.edit {
  color: #DC2626;
  font-weight: 700;
  background-color: transparent;
  border: 1px solid transparent;
}

.actionButton.edit:hover {
  background-color: #fff5f5;
}
</style>
