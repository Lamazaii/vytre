<template>
  <div class="textZone">
    <div class="textZoneEditorWrapper">
      <TiptapEditor
        :ref="(el: any) => emit('setRef', el)"
        :model-value="modelValue"
        :placeholder="'Nouvelle zone de texte'"
        @update:model-value="(html: string) => emit('update:modelValue', html)"
        @focus="emit('focus')"
        @selectionUpdate="emit('selectionUpdate')"
      />
    </div>
    <button class="removeTextZoneButton" @click.stop="emit('remove')" title="Remove text zone">
      <img :src="trashRed" alt="Remove" />
    </button>
  </div>
</template>

<script setup lang="ts">
import TiptapEditor from '../../blocks/editor/TiptapEditor.vue'
import trashRed from '../../../assets/blockImage/trashRed.svg'

// Text content passed from the parent block.
defineProps<{ modelValue: string }>();
// Forward editor and removal events to parent container.
const emit = defineEmits(['update:modelValue', 'focus', 'selectionUpdate', 'remove', 'setRef']);
</script>

<style scoped>
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
</style>