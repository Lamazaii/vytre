<template>
  <div class="versionButtonWrapper">
    <!-- Version history button -->
    <button
      class="actionButton versions"
      :class="{ 'is-open': isOpen }"
      @click="emit('toggle')"
      title="Historique des versions"
    >
      <img :src="versionIcon" alt="Versions" class="buttonIcon" />
    </button>

    <!-- Version history menu dropdown -->
    <div v-if="isOpen" class="versionMenu">
      <div class="versionMenuTitle">HISTORIQUE DES VERSIONS</div>
      
      <!-- Versions list -->
      <div class="versionList" :class="{ 'is-scrollable': isHistoryExpanded }">
        <div v-if="loading" class="loadingVersions">Chargement...</div>
        <div v-else-if="!doc.versions?.length" class="emptyVersions">Aucune version</div>

        <!-- Version item with state selector -->
        <div
          v-for="(version, index) in visibleVersions"
          :key="version.id"
          class="versionItem"
          :class="{ 'is-selected': version.version === effectiveSelectedVersion }"
          @click="emit('selectVersion', version.version)"
        >
          <div class="versionHeader">
            <span class="versionLabel">
              {{ getDayLabel(version.createdAt!) }}
              <span v-if="index === 0" class="versionCurrent"> (Actuelle)</span>
            </span>
            <span v-if="version.version === effectiveSelectedVersion" class="versionCheck">✓</span>
          </div>

          <div class="versionMeta">
            <span>{{ formatHour(version.createdAt!) }}</span>
            <span class="versionDot">•</span>
            
            <div class="versionStateWrapper" :class="{ versionSourceMuted: index !== 0 }">
              <button 
                class="versionStateButton"
                :class="{ 'is-open': openStateMenuFor === version.id }"
                @click.stop="e => toggleStateMenu(e, version.id!)"
              >
                {{ getVersionState(version) }}
                <span class="stateArrow">▼</span>
              </button>

              <Teleport to="body">
                <div 
                  v-if="openStateMenuFor === version.id"
                  class="stateDropdown"
                  :style="dropdownStyle"
                >
                  <button 
                    v-for="state in availableStates"
                    :key="state"
                    class="stateOption"
                    :class="{ 'is-active': getVersionState(version) === state }"
                    @click.stop="changeState(version, state)"
                  >
                    {{ state }}
                  </button>
                </div>
              </Teleport>
            </div>
          </div>
        </div>
      </div>

      <!-- Expand/collapse history button -->
      <button
        v-if="displayVersions.length > 3"
        class="versionHistoryButton"
        @click="isHistoryExpanded = !isHistoryExpanded"
      >
        {{ isHistoryExpanded ? 'Voir moins' : "Voir tout l'historique" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue'
import versionIcon from '../../assets/menu/version.svg'
import type { Document } from '../../types/Document'

const props = defineProps<{ doc: Document; isOpen: boolean; loading: boolean; selectedVersion: number | null }>()
const emit = defineEmits(['toggle', 'selectVersion', 'updateState'])

const isHistoryExpanded = ref(false)
const openStateMenuFor = ref<number | null>(null)
const dropdownStyle = reactive({ top: '0px', left: '0px' })
const availableStates = ['En édition', 'Actif', 'Archivé']

// Resolve selected or current version
const effectiveSelectedVersion = computed(() => props.selectedVersion ?? props.doc.version)

// Sort versions by date (newest first), filter invalid entries
const displayVersions = computed(() => {
  return [...(props.doc.versions || [])]
    .filter(v => v.id && v.createdAt)
    .sort((a, b) => 
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    )
})

// Show max 2 versions unless expanded
const visibleVersions = computed(() => 
  isHistoryExpanded.value ? displayVersions.value : displayVersions.value.slice(0, 2)
)

// Reset state when menu closes
watch(() => props.isOpen, (val) => { if (!val) { isHistoryExpanded.value = false; openStateMenuFor.value = null } })

// Format date label (today, yesterday, or date)
// Format date as day label (today, yesterday, or formatted date)
const getDayLabel = (date: string | Date) => {
  const d = new Date(date)
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (d.toDateString() === today) return "Aujourd'hui"
  if (d.toDateString() === yesterday) return "Hier"
  return d.toLocaleDateString('fr-FR')
}

// Format time as HH:MM
const formatHour = (date: string | Date) => 
  new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// Get version state with fallback
const getVersionState = (v: any) => v.state?.trim() || v.snapshot?.state?.trim() || 'En édition'

// Toggle version state dropdown and position it
function toggleStateMenu(event: MouseEvent, id: number) {
  if (openStateMenuFor.value === id) {
    openStateMenuFor.value = null
  } else {
    // Calculate position for Teleport
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dropdownStyle.top = `${rect.bottom + window.scrollY + 5}px`
    dropdownStyle.left = `${rect.left + window.scrollX}px`
    openStateMenuFor.value = id
  }
}

// Update version state and close dropdown
function changeState(version: any, newState: string) {
  openStateMenuFor.value = null
  if (version.id) {
    emit('updateState', version.id, newState)
  }
}
</script>

<style scoped>
.versionButtonWrapper {
  position: relative;
  border-left: 1px solid #e5e7eb;
  padding-left: 12px;
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

.actionButton.versions {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 10px;
  background-color: transparent;
  border: none;
  justify-content: center;
}

.actionButton.versions:hover {
  background-color: #f3f4f6;
}

.actionButton.versions .buttonIcon {
  width: 18px;
  height: 18px;
  opacity: 0.45;
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.actionButton.versions:hover .buttonIcon {
  opacity: 0.7;
}

.actionButton.versions.is-open {
  background-color: #1e293b;
}

.actionButton.versions.is-open .buttonIcon {
  opacity: 1;
  filter: brightness(0) invert(1);
}

.versionMenu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: white;
  border: 1px solid #d9dde3;
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
  z-index: 1000;
  width: 240px;
  overflow: visible;
}

.versionMenuTitle {
  padding: 12px 14px;
  border-bottom: 1px solid #e9edf2;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.versionList {
  overflow-y: hidden;
}

.versionList.is-scrollable {
  max-height: 240px;
  overflow-y: auto;
  clip-path: inset(0 0 -500px 0);
}

.emptyVersions {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.loadingVersions {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 13px;
}

.versionItem {
  position: relative;
  padding: 10px 14px;
  border-bottom: 1px solid #eef1f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.versionItem:hover {
  background-color: #f9f9f9;
}

.versionItem.is-selected {
  background-color: #f4f7fb;
}

.versionItem:last-child {
  border-bottom: none;
}

.versionHeader {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.versionLabel {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
  line-height: 1;
}

.versionCurrent {
  font-size: 12px;
  font-weight: 700;
}

.versionCheck {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #5a5a5a;
  font-size: 16px;
  font-weight: 700;
}

.versionMeta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #6b7280;
}

.versionDot {
  color: #94a3b8;
}

.versionSourceMuted {
  color: #94a3b8;
}

.versionHistoryButton {
  width: 90%;
  margin: 8px 12px 10px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background-color: #f1f3f5;
  color: #1e293b;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.versionHistoryButton:hover {
  background-color: #e9edf2;
}

.versionStateWrapper {
  position: relative;
  display: inline-block;
}

.versionStateButton {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 11px;
  padding: 2px 6px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.versionStateButton:hover {
  background-color: #f0f0f0;
  color: #374151;
}

.stateArrow {
  display: inline-block;
  margin-left: 4px;
  font-size: 10px;
  transition: transform 0.2s ease;
}

.versionStateButton.is-open .stateArrow {
  transform: rotate(180deg);
}

.stateDropdown {
  position: fixed;
  background-color: white;
  border: 1px solid #d9dde3;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 140px;
  overflow: hidden;
}

.stateOption {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #374151;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.stateOption:hover {
  background-color: #f3f4f6;
}

.stateOption.is-active {
  background-color: #e0f2fe;
  color: #0369a1;
  font-weight: 600;
}
</style>