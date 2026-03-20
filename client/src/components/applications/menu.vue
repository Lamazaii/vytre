<template>
  <div id="app" class="app-menu" :class="{ 'app-menu--reader': viewMode === 'reader' }">
    <TitleBar :isReadOnly="true" :isMenu="true" customTitle="Mes Documents" />
  <div class="menuContainer" :class="{ 'menuContainer--reader': viewMode === 'reader' }">
    <div class="headerContent">

      <div class="modeToggle">
        <button 
          class="toggleButton" 
          :class="{ active: viewMode === 'reader' }"
          @click="viewMode = 'reader'"
        >
          Lecteur
        </button>
        <button 
          class="toggleButton" 
          :class="{ active: viewMode === 'editor' }"
          @click="viewMode = 'editor'"
        >
          Éditeur
        </button>
      </div>
      
      <div class="searchSection">
        <input type="text" v-model="searchQuery" placeholder="Rechercher..." class="searchInput" />
        <button v-if="viewMode === 'editor'" class="newButton" @click="handleNewDocument">+ Nouveau</button>
      </div>
    </div>

    <div class="documentsList">
      <div v-if="store.loadingDocuments" class="loadingMessage">Chargement des documents...</div>
      <div v-else-if="store.documentsError" class="errorMessage">{{ store.documentsError }}</div>
      <div v-else-if="filteredDocuments.length === 0" class="emptyMessage">Aucun document trouvé</div>
      <div 
        v-for="(doc, index) in filteredDocuments" 
        :key="doc.id || index"
        class="documentCardWrapper"
      >
        <div class="documentCard">
          <div class="docIcon">
            <img :src="fileIcon" alt="Document Icon" />
          </div>
          <div class="docInfo">
            <h3>{{ doc.title }}</h3>
            <div class="docMeta">
              <span class="docTime"><img :src="timeImage" alt="Time" class="timeIcon" /> {{ formatDate(doc.updatedAt ?? new Date()) }}</span>
            </div>
          </div>
          <div class="docActions">
            <button class="actionButton read" @click="openDocument(doc)">
              <img :src="readIcon" alt="Read" class="buttonIcon" /> Lire
            </button>
            <button v-if="viewMode === 'editor'" class="actionButton edit" @click="editDocument(doc)">
              <img :src="editIcon" alt="Edit" class="buttonIcon" /> Modifier
            </button>
            <VersionHistoryMenu
              v-if="viewMode === 'editor'"
              :doc="doc"
              :is-open="openVersionMenu === doc.id"
              :loading="loadingVersions === doc.id"
              @toggle="handleVersions(doc)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import fileIcon from '../../assets/menu/file-text.svg'
import { useBlocksStore } from '../../stores/blockStores'
import type { Document } from '../../types/Document'
import timeImage from '../../assets/menu/timer.svg'
import readIcon from '../../assets/optionBarImage/visibility.svg'
import editIcon from '../../assets/menu/edit.svg'
import TitleBar from '../optionBar/shared/titleBar.vue'
import VersionHistoryMenu from './versionHistoryMenu.vue'
import { documentService } from '../../services/documentService'


const emit = defineEmits<{
  selectMode: [mode: 'editor' | 'reader']
}>()

const store = useBlocksStore()
const searchQuery = ref('')
const viewMode = ref<'editor' | 'reader'>('editor')
const openVersionMenu = ref<number | null>(null)
const loadingVersions = ref<number | null>(null)

const filteredDocuments = computed(() => {
  if (!searchQuery.value.trim()) {
    return store.allDocuments
  }
  const query = searchQuery.value.toLowerCase()
  return store.allDocuments.filter(doc => 
    doc.title.toLowerCase().includes(query)
  )
})

function formatDate(dateString: Date): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins}m`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  
  return date.toLocaleDateString('fr-FR')
}

function openDocument(doc: Document) {
  console.log('Ouverture en lecture:', doc)
  store.loadDocument(doc.id!)
  emit('selectMode', 'reader')
}

function editDocument(doc: Document) {
  console.log('Édition du document:', doc)
  store.loadDocument(doc.id!)
  emit('selectMode', 'editor')
}

function handleNewDocument() {
  store.createNewDocument()
  emit('selectMode', 'editor')
}

function handleVersions(doc: Document) {
  if (openVersionMenu.value === doc.id) {
    openVersionMenu.value = null
  } else {
    openVersionMenu.value = doc.id ?? null
    // Charger les versions si elles ne sont pas déjà chargées
    if (!doc.versions || doc.versions.length === 0) {
      loadVersions(doc)
    }
  }
}

async function loadVersions(doc: Document) {
  if (!doc.id) return
  
  try {
    loadingVersions.value = doc.id
    const versions = await documentService.getVersions(doc.id)
    // Mettre à jour les versions du document dans la liste
    const docIndex = store.allDocuments.findIndex(d => d.id === doc.id)
    if (docIndex !== -1) {
      const document = store.allDocuments[docIndex]
      if (document) {
        document.versions = versions
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des versions:', error)
  } finally {
    loadingVersions.value = null
  }
}

onMounted(() => {
  store.loadAllDocuments()
})
</script>

<style scoped>

.app-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.app-menu--reader {
  max-width: 911px;
  margin: 0 auto;
}

.menuContainer {
  width: 100%;
  background-color: #F3F4F6;
  padding: 0;
  min-height: 717px;
  transition: all 0.3s ease;
  overflow: visible;
}

.menuContainer--reader {
  max-width: 911px;
}

.headerContent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding : 15px 80px;
  transition: padding 0.3s ease;
}

.menuContainer--reader .headerContent {
  padding: 15px 40px;
}


.modeToggle {
  display: flex;
  background-color: #f0f0f0;
  border-radius: 6px;
}

.toggleButton {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  background-color: transparent;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.toggleButton:hover {
  color: #333;
}

.toggleButton.active {
  background-color: white;
  color: #DC2626;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  transition: margin 0.3s ease;
  overflow: visible;
}

.menuContainer--reader .documentsList {
  margin: 25px 40px 0 40px;
}

.loadingMessage,
.emptyMessage {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
  width: 100%;
}

.errorMessage {
  padding: 15px 20px;
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 5px;
  width: 100%;
  text-align: center;
  font-size: 14px;
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
  overflow: visible;
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
  align-items: center;
  gap: 10px;
  margin-left: auto;
  margin-right: 20px;
  overflow: visible;
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

.documentCardWrapper {
  width: 100%;
  overflow: visible;
}
</style>
