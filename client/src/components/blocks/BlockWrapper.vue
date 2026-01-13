<template>
  <div class="wrapper">
    <div class="element-container">
      <div class="element-content">
        <div class="drag-handle" title="Déplacer le bloc">
          <StepNumber :numero="block.step" :active="active"/>
        </div>
        <EditableBlock
          :description="block.text"
          :images="block.images"
          :blockIndex="blockIndex"
          :active="active"
          :canDelete="canDelete"
          @select="emit('select')"
          @delete="emit('delete')"
          @modified="(v) => emit('modified', v)"
          @update:description="(v) => handleUpdateDescription(v)"
          @update:images="(v) => handleUpdateImages(v)"
        />
        <RepetitionCount v-model="nbOfRepeats" />

    </div>
    </div>
    <div v-if="showAddBlockZone" class="addBlock">
      <AddBlockZone @add="emit('addBlock')" :disabled="!canAddBlock" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import StepNumber from './stepNumber.vue'
import RepetitionCount from './repetitionCount.vue'
import EditableBlock from './EditableBlock/editableBlock.vue'
import type { Block as BlockType } from '../../types/Blocks'
import { useBlocksStore } from '../../stores/blockStores'
import AddBlockZone from './addBlockZone.vue'

interface Props {
  block: BlockType
  blockIndex: number
  active: boolean
  canDelete: boolean
  showAddBlockZone?: boolean
  canAddBlock?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': []
  'delete': []
  'modified': [value: boolean]
  'addBlock': []
}>()

const blocksStore = useBlocksStore()
const nbOfRepeats = ref(props.block.nbOfRepeats)

watch(nbOfRepeats, (newVal) => {
  if (props.block) {
    props.block.nbOfRepeats = newVal
  }
})

watch(
  () => props.block,
  (newBlock) => {
    if (newBlock) {
      nbOfRepeats.value = newBlock.nbOfRepeats
    }
  },
  { deep: true }
)

function handleUpdateDescription(newDescription: string) {
  if (props.block) {
    props.block.text = newDescription
    blocksStore.updateBlockDescription(props.blockIndex, newDescription)
  }
}

function handleUpdateImages(newImages: any[]) {
  if (props.block) {
    props.block.images = newImages
  }
}
</script>

<style scoped>
.element-container {
  display: flex;
  align-items: center;
  width: auto;
  margin-top: 20px;
  margin-bottom: 20px;
}

.element-content {
  display: flex;
  gap: 50px;
  align-items: center;
}

.drag-handle {
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
