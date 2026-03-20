<template>
  <div class="versionButtonWrapper">
    <button
      class="actionButton versions"
      :class="{ 'is-open': isOpen }"
      @click="emit('toggle')"
      aria-label="Historique des versions"
      title="Historique des versions"
    >
      <img :src="versionIcon" alt="Versions" class="buttonIcon" />
    </button>
    <div v-if="isOpen" class="versionMenu">
      <div class="versionMenuTitle">HISTORIQUE DES VERSIONS</div>
      <div class="versionList" :class="{ 'is-scrollable': isHistoryExpanded }">
        <div v-if="loading" class="loadingVersions">
          Chargement des versions...
        </div>
        <div v-else-if="!doc.versions || doc.versions.length === 0" class="emptyVersions">
          Aucune version disponible
        </div>
        <div
          v-for="(version, index) in visibleVersions"
          :key="version.id ?? `version-${version.version}-${index}`"
          class="versionItem"
        >
          <div class="versionHeader">
            <span class="versionLabel">
              {{ getVersionDayLabel(version.createdAt) }}
              <span v-if="index === 0" class="versionCurrent"> (Actuelle)</span>
            </span>
            <span v-if="index === 0" class="versionCheck">✓</span>
          </div>
          <div class="versionMeta">
            <span>{{ formatVersionHour(version.createdAt) }}</span>
            <span v-if="version.state" class="versionDot">•</span>
            <span v-if="version.state" :class="{ versionSourceMuted: index !== 0 }">
              {{ version.state }}
            </span>
          </div>
        </div>
      </div>
      <button
        v-if="displayVersions.length > 3"
        class="versionHistoryButton"
        type="button"
        @click="toggleVersionHistory"
      >
        {{ isHistoryExpanded ? 'Voir moins' : "Voir tout l'historique" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import versionIcon from '../../assets/menu/version.svg'
import type { Document } from '../../types/Document'

const props = defineProps<{
  doc: Document
  isOpen: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const isHistoryExpanded = ref(false)

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      isHistoryExpanded.value = false
    }
  }
)

function normalizeDate(dateInput?: Date | string): Date {
  if (!dateInput) return new Date()
  const parsed = new Date(dateInput)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function formatVersionHour(dateInput?: Date | string): string {
  const date = normalizeDate(dateInput)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function getVersionDayLabel(dateInput?: Date | string): string {
  const date = normalizeDate(dateInput)
  const now = new Date()
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayDiff = Math.floor((todayStart - dayStart) / 86400000)

  if (dayDiff === 0) return "Aujourd'hui"
  if (dayDiff === 1) return 'Hier'
  return date.toLocaleDateString('fr-FR')
}

const displayVersions = computed(() => {
  if (!props.doc.versions) return []
  return [...props.doc.versions].sort((a, b) => {
    const dateA = normalizeDate(a.createdAt).getTime()
    const dateB = normalizeDate(b.createdAt).getTime()
    return dateB - dateA
  })
})

const visibleVersions = computed(() => {
  if (isHistoryExpanded.value) {
    return displayVersions.value
  }
  return displayVersions.value.slice(0, 2)
})

function toggleVersionHistory() {
  isHistoryExpanded.value = !isHistoryExpanded.value
}
</script>

<style scoped>
.versionButtonWrapper {
  position: relative;
  border-left: 1px solid #e5e7eb;
  padding-left: 12px;
  margin-left: 4px;
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
  overflow: hidden;
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
  padding-right: 34px;
  border-bottom: 1px solid #eef1f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.versionItem:hover {
  background-color: #f9f9f9;
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
</style>
