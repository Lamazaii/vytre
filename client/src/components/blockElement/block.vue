<template>
  <div class="editableBlock" :class="{ active: props.active }" @click="emit('select')">
    <div class="editableText">
      <TiptapEditor
        ref="welcomeEditorRef"
        v-model="welcomeText"
        :placeholder="'Sélectionnez ce bloc pour l\'éditer.'"
        @focus="onFocusEditable"
        @selectionUpdate="onSelectionActivity"
      />
    </div>

    <div class="textZonesSection" v-if="textZones.length > 0">
      <div class="textZone" v-for="(zone, index) in textZones" :key="index">
        <div class="textZoneEditorWrapper">
          <TiptapEditor
            :ref="(el) => setTextZoneEditorRef(el, index)"
            :model-value="zone"
            :placeholder="'Nouvelle zone de texte'"
            @update:model-value="(html) => onTextZoneUpdate(index, html)"
            @focus="() => onTextZoneFocus(index)"
            @selectionUpdate="onSelectionActivity"
          />
        </div>
        <button class="removeTextZoneButton" @click.stop="onRemoveTextZone(index)" title="Remove text zone">
          <img :src="trashRed" alt="Remove" />
        </button>
      </div>
    </div>

    <div v-if="props.canDelete !== false" class="trashIcon" :class="{ hovering: isTrashHover, active: isTrashActive }" @mouseenter="isTrashHover = true" @mouseleave="isTrashHover = false" @click.stop="onDelete">
      <img :src="(isTrashHover || isTrashActive) ? trashRed : trash" alt="Supprimer" />
    </div>

    <div class="dottedSeparator"></div>

    <div class="imageSection">
      <div class="imagesContainer" v-if="images.length > 0">
        <div 
          class="imageItem" 
          v-for="(image, index) in images" 
          :key="image.id || index"
          :class="{ 'selected-image': imageCropStore.selectedImageId === image.id }"
          @click.stop="toggleSelectImage(image.id)"
        >
          <img :src="image.imagePath" alt="Illustration" class="blockImage" />

          <div class="removeImageIcon" @click.stop="removeImage(index)">
            <img :src="trashRed" alt="Supprimer" />
          </div>
        </div>
      </div>
  
      <div class="addImage" @click="triggerFileInput">
        <input 
          ref="fileInput" 
          type="file" 
          accept="image/*" 
          style="display: none"
          @change="handleImageSelect"
        />
        <div class="addImageLogo">
          <img src="../../assets/blockImage/imageIcon.svg" alt="Add" />
        </div>
        <p class="addImageText">Ajouter une image</p>
      </div>
    </div>
  </div>

  <CropPopup @crop="handleCropComplete" />
</template>


<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useTextFormatStore } from '../../stores/textFormatStore'
import { useBlocksStore } from '../../stores/blockStores'
import { useImageCropStore } from '../../stores/imageCropStore'
import { useDeletePopupStore } from '../../stores/deletePopupStore'
import TiptapEditor from '../editor/TiptapEditor.vue'
import CropPopup from '../popup/CropPopup.vue'
import trash from '../../assets/blockImage/trash.svg'
import trashRed from '../../assets/blockImage/trashRed.svg'
import type { Image } from '../../types/Image'
import 'vue-advanced-cropper/dist/style.css'

interface Props {
  titre?: string;
  description?: string;
  active? : boolean;
  canDelete?: boolean;
  blockIndex?: number;
  images?: Image[];
}

const props = defineProps<Props>();
const emit = defineEmits(['modified', 'select', 'delete', 'update:description', 'update:images']);

// États
const isTrashHover = ref(false)
const isTrashActive = ref(false)
const images = ref<Image[]>(props.images || [])
const welcomeText = ref(props.description || '')

const fileInput = ref<HTMLInputElement | null>(null)
const textFormatStore = useTextFormatStore()
const blocksStore = useBlocksStore()
const imageCropStore = useImageCropStore()
const deletePopupStore = useDeletePopupStore()
const welcomeEditorRef = ref<InstanceType<typeof TiptapEditor> | null>(null)
const textZoneEditorRefs = ref<Array<InstanceType<typeof TiptapEditor> | null>>([])

// Computed
const textZones = computed(() => {
  if (props.blockIndex === undefined) return []
  const block = blocksStore.blocks[props.blockIndex]
  return block?.textZones || []
})

// Méthodes Image
const toggleSelectImage = (id: string) => {
  if (imageCropStore.selectedImageId === id) {
    imageCropStore.clearSelection()
  } else {
    imageCropStore.selectImage(id, props.blockIndex ?? 0)
  }
}

const handleCropComplete = (croppedImageData: string) => {
  if (imageCropStore.selectedImageId) {
    const index = images.value.findIndex(img => img.id === imageCropStore.selectedImageId)
    if (index !== -1 && images.value[index]) {
      images.value[index].imagePath = croppedImageData
      emit('update:images', [...images.value])
      emit('modified', true)
    }
  }
}

const removeImage = (index: number) => {
  deletePopupStore.show('image', () => {
    images.value.splice(index, 1)
    emit('update:images', [...images.value])
  })
}

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const imageData = e.target?.result
    if (typeof imageData !== 'string') return
    const newImage: Image = {
      id: Date.now().toString(),
      imagePath: imageData,
      blockId: props.blockIndex ?? 0,
    }
    images.value = [...images.value, newImage]
    emit('update:images', images.value)
    emit('modified', true)
    input.value = ''
  }
  reader.readAsDataURL(file)
}

const triggerFileInput = () => fileInput.value?.click()

// Méthodes Texte & Bloc
function onFocusEditable() {
  emit('select')
  if (welcomeEditorRef.value) {
    const editor = welcomeEditorRef.value.getEditor()
    if (editor) textFormatStore.setTiptapEditor(editor as any)
  }
  textFormatStore.saveSelection()
}

function setTextZoneEditorRef(el: any, index: number) {
  if (el) textZoneEditorRefs.value[index] = el
}

function onTextZoneFocus(index: number) {
  emit('select')
  const editorRef = textZoneEditorRefs.value[index]
  if (editorRef) {
    const editor = editorRef.getEditor()
    if (editor) textFormatStore.setTiptapEditor(editor as any)
  }
  textFormatStore.saveSelection()
}

function onSelectionActivity() {
  textFormatStore.saveSelection()
  textFormatStore.updateStatesFromCommand()
}

function onTextZoneUpdate(index: number, html: string) {
  if (props.blockIndex === undefined) return
  blocksStore.updateTextZone(props.blockIndex, index, html)
}

function onRemoveTextZone(index: number) {
  if (props.blockIndex === undefined) return
  blocksStore.removeTextZone(props.blockIndex, index)
}

function onDelete() { emit('delete') }

// Watchers
watch(() => props.description, (newDesc) => {
  if (newDesc !== welcomeText.value) welcomeText.value = newDesc || ''
})

watch(() => props.images, (newVal) => {
  if (newVal) images.value = newVal
}, { deep: true })

watch(welcomeText, (newValue) => {
  if (props.blockIndex !== undefined) {
    blocksStore.updateBlockDescription(props.blockIndex, newValue)
  }
  emit('update:description', newValue)
})

// Watcher pour la demande de rognage depuis la barre d'outils
watch(() => imageCropStore.cropRequestTimestamp, (timestamp) => {
  if (timestamp > 0) {
    const imageToEdit = images.value.find(img => img.id === imageCropStore.selectedImageId)
    if (imageToEdit) {
      imageCropStore.openCropper(imageToEdit.imagePath)
    }
  }
})

// Synchroniser l'état du cropper avec le store
watch(() => imageCropStore.isCropperOpen, (isOpen) => {
  if (!isOpen) {
    // Le cropper a été fermé
  }
})

onMounted(() => {
  setTimeout(() => {
    if (welcomeEditorRef.value) {
      const editor = welcomeEditorRef.value.getEditor()
      if (editor) textFormatStore.setTiptapEditor(editor as any)
    }
  }, 100)
})
</script>

<style scoped>
.editableBlock {
  position: relative;
  width: 1000px;
  border: 3px solid #C6C6C6;
  border-radius: 5px;
  background-color: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0px 15px 0px;
}

.editableBlock.active {
  border-color: #DC2626;
}

.editableText {
  display: flex;
  align-items: center;
  width: 900px;
  min-height: 44px;
  background-color: #ffffff;
  padding: 0;
  margin: 0;
}

.trashIcon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, filter 0.2s ease, background-color 0.16s ease;
  z-index: 3;
}

.trashIcon img {
  width: 20px;
  height: 20px;
}

.editableBlock:hover .trashIcon {
  opacity: 0.5;
}

.trashIcon:hover {
  opacity: 1;
  background: #E0E0E0;
  border-radius: 4px;
}

.trashIcon:hover img { filter: none }

.trashIcon.hovering {
  opacity: 1 !important;
}

.trashIcon.active {
  background: rgba(220, 38, 38, 0.15);
  border-radius: 4px;
}
 
.dottedSeparator {
  display :flex;
  align-items: flex-start;
  width: 900px;
  height: 2px;
  opacity: 0.4;
  z-index: 1;
  background-image: radial-gradient(circle, #000000 3px, transparent 1px);
  background-size: 8px 8px;
  background-repeat: repeat-x;
  background-position: 0 40%;
  margin : 13px 0px 13px 0px;
}

.textZonesSection {
  display: flex;
  flex-direction: column;
  width: 900px;
}

.textZone {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
}

.textZoneEditorWrapper {
  flex: 1;
  margin-right: 40px;
}

.removeTextZoneButton {
  position: absolute;
  right: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, filter 0.2s ease, background-color 0.16s ease;
  border: none;
  background: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.removeTextZoneButton img {
  width: 20px;
  height: 20px;
}

.textZone:hover .removeTextZoneButton {
  opacity: 0.5;
}

.removeTextZoneButton:hover {
  opacity: 1 !important;
  background: #E0E0E0;
  border-radius: 4px;
}

.addImage {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 900px;
  height: 68px;
  z-index: 1;
  flex-direction: column;
  border: 2px dashed transparent;
  background-color: transparent;
  border-radius: 8px;
  box-sizing: border-box;
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

.imageSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.addImage:hover {
  background-color: #fef2f2;
  border-color: #DC2626;
}

.addImage:hover ::v-deep .addImageText {
  color: #DC2626;
  opacity: 1;
}

.addImage:hover ::v-deep .addImageLogo img {
  opacity: 1;
  filter: invert(21%) sepia(90%) saturate(6689%) hue-rotate(354deg) brightness(91%) contrast(124%);
}

.imagesContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background-color: #ffffff;
  width : 900px;
}

.imageItem {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
}

.blockImage {
  max-width: 150px;
  max-height: 120px;
  object-fit: contain;
}

.removeImageIcon {
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, filter 0.2s ease, background-color 0.16s ease;
  z-index: 2;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.removeImageIcon img {
  width: 16px;
  height: 16px;
}

.imageItem:hover .removeImageIcon {
  opacity: 0.5;
}

.removeImageIcon:hover {
  opacity: 1 !important;
  background: #E0E0E0;
}

.imageItem.selected-image {
  border: 2px solid #DC2626;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.2);
}
</style>
