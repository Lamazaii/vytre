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
      <TextZoneItem 
        v-for="(zone, index) in textZones" 
        :key="index"
        :model-value="zone"
        @setRef="(el) => setTextZoneEditorRef(el, index)"
        @update:model-value="(html) => onTextZoneUpdate(index, html)"
        @focus="() => onTextZoneFocus(index)"
        @selectionUpdate="onSelectionActivity"
        @remove="onRemoveTextZone(index)"
      />
    </div>

    <div v-if="props.canDelete !== false" 
         class="trashIcon" 
         :class="{ hovering: isTrashHover, active: isTrashActive }" 
         @mouseenter="isTrashHover = true" 
         @mouseleave="isTrashHover = false" 
         @click.stop="onDelete">
      <img :src="(isTrashHover || isTrashActive) ? trashRed : trash" alt="Supprimer" />
    </div>

    <div class="dottedSeparator"></div>

    <div class="shapeCanvasSection">
      <ShapeCanvas 
        ref="shapeCanvasRef"
        :block-index="props.blockIndex"
        :canvas-data="canvasData"
        :active="props.active"
        @update:canvasData="handleCanvasUpdate"
        @modified="(v) => emit('modified', v)"
      />
    </div>

    <div class="dottedSeparator"></div>

    <div class="imageSection">
      <div class="imagesContainer" v-if="images.length > 0">
        <ImageItem 
          v-for="(image, index) in images" 
          :key="image.id || index"
          :image-path="image.imagePath"
          :is-selected="imageCropStore.selectedImageId === image.id"
          @select="toggleSelectImage(image.id)"
          @remove="removeImage(index)"
        />
      </div>
  
      <ImageUploader @upload="handleNewImage" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useTextFormatStore } from '../../../stores/textFormatStore'
import { useBlocksStore } from '../../../stores/blockStores'
import { useImageCropStore } from '../../../stores/imageCropStore'
import { useDeletePopupStore } from '../../../stores/deletePopupStore'
import { useShapeStore } from '../../../stores/shapeStore'

import TextZoneItem from './textZoneItem.vue'
import ImageItem from './imageItem.vue'
import ImageUploader from './imageUploader.vue'
import TiptapEditor from '../../blocks/editor/TiptapEditor.vue'
import ShapeCanvas from './shapeCanvas.vue'

import trash from '../../../assets/blockImage/trash.svg'
import trashRed from '../../../assets/blockImage/trashRed.svg'
import type { Image } from '../../../types/Image'

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

const isTrashHover = ref(false)
const isTrashActive = ref(false)
const images = ref<Image[]>(props.images || [])
const welcomeText = ref(props.description || '')

const textFormatStore = useTextFormatStore()
const blocksStore = useBlocksStore()
const imageCropStore = useImageCropStore()
const deletePopupStore = useDeletePopupStore()
const shapeStore = useShapeStore()
const welcomeEditorRef = ref<InstanceType<typeof TiptapEditor> | null>(null)
const textZoneEditorRefs = ref<Array<any>>([])
const shapeCanvasRef = ref<InstanceType<typeof ShapeCanvas> | null>(null)

function getInitialCanvasData(): string {
  if (props.blockIndex === undefined) return ''
  return blocksStore.blocks[props.blockIndex]?.canvasData || ''
}

const canvasData = ref(getInitialCanvasData())

const textZones = computed(() => {
  if (props.blockIndex === undefined) return []
  const block = blocksStore.blocks[props.blockIndex]
  return block?.textZones || []
})

const toggleSelectImage = (id: string) => {
  if (imageCropStore.selectedImageId === id) {
    imageCropStore.clearSelection()
  } else {
    imageCropStore.selectImage(id, props.blockIndex ?? 0)
  }
}

const removeImage = (index: number) => {
  deletePopupStore.show('image', () => {
    images.value.splice(index, 1)
    emit('update:images', [...images.value])
  })
}

const handleNewImage = (imageData: string) => {
  const newImage: Image = {
    id: Date.now().toString(),
    imagePath: imageData,
    blockId: props.blockIndex ?? 0,
  }
  images.value = [...images.value, newImage]
  emit('update:images', images.value)
  emit('modified', true)
}

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

function handleCanvasUpdate(data: string) {
  if (props.blockIndex !== undefined) {
    blocksStore.updateBlockCanvas(props.blockIndex, data)
  }
  canvasData.value = data
}

function onDelete() { emit('delete') }

watch(() => props.description, (newDesc) => {
  if (newDesc !== welcomeText.value) welcomeText.value = newDesc || ''
})

watch(() => shapeStore.addShapeRequest, () => {
  if (!shapeCanvasRef.value || !props.active) return
  
  const shape = shapeStore.activeShape
  if (shape === 'square') {
    shapeCanvasRef.value.addSquare()
  } else if (shape === 'circle') {
    shapeCanvasRef.value.addCircle()
  } else if (shape === 'triangle') {
    shapeCanvasRef.value.addTriangle()
  }
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

watch(() => imageCropStore.cropRequestTimestamp, (timestamp) => {
  if (timestamp > 0 && imageCropStore.blockIndex === props.blockIndex) {
    const imageToEdit = images.value.find(img => img.id === imageCropStore.selectedImageId)
    if (imageToEdit) {
      imageCropStore.openCropper(imageToEdit.imagePath)
    }
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
}

.trashIcon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
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
  background-position: 0 40%;
  margin : 13px 0px 13px 0px;
}

.textZonesSection { 
    display: flex; 
    flex-direction: 
    column; 
    width: 900px; 
}

.shapeCanvasSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 700px;
}

.imageSection { 
  display: flex;
  flex-direction: column; 
  align-items: center; 
  gap: 12px; 
}

.imagesContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width : 900px;
}
</style>