<template>
  <div class="tiptap-editor-wrapper">
    <editor-content 
      :editor="(editor as any)" 
      :class="{ isEmpty: isEmpty }"
      :data-placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'

interface Props {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Commencez à écrire...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'selectionUpdate'): void
}>()

const editor = ref<Editor | undefined>(undefined)

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"´`]/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

const isEmpty = computed(() => {
  if (!editor.value) return true
  const text = editor.value.getText()
  return text.trim().length === 0
})

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
    ],
    content: props.modelValue,
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        dir: 'ltr',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      emit('update:modelValue', html)
    },
    onFocus: () => {
      emit('focus')
    },
    onBlur: () => {
      emit('blur')
    },
    onSelectionUpdate: () => {
      emit('selectionUpdate')
    },
  })
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

watch(() => props.modelValue, (next) => {
  if (!editor.value) return

  if (editor.value.isFocused) return
  
  const current = editor.value.getHTML()
  if (current === next) return

  editor.value.commands.setContent(next, { emitUpdate: false })
})

defineExpose({
  editor,
  getEditor: () => editor.value
})
</script>

<style scoped>
.tiptap-editor-wrapper {
  width: 100%;
}

.tiptap-editor-wrapper :deep(.tiptap-content) {
  font-size: 14px;
  color: #000000;
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  text-align: left;
}

.tiptap-editor-wrapper :deep(.ProseMirror) {
  outline: none;
  min-height: 20px;
  text-align: left;
}

.tiptap-editor-wrapper :deep(.is-editor-empty::before) {
  content: attr(data-placeholder);
  color: #9e9e9e;
  opacity: 0.8;
  pointer-events: none;
  float: left;
  height: 0;
}

.tiptap-editor-wrapper :deep(p) {
  margin: 0;
  line-height: 1.5;
  text-align: left;
}

.tiptap-editor-wrapper :deep(strong) {
  font-weight: bold;
}

.tiptap-editor-wrapper :deep(em) {
  font-style: italic;
}

.tiptap-editor-wrapper :deep(u) {
  text-decoration: underline;
}

.tiptap-editor-wrapper :deep(ul),
.tiptap-editor-wrapper :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.tiptap-editor-wrapper :deep(li) {
  margin: 0.25rem 0;
}
</style>
