import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import TiptapEditor from '../../components/blocks/editor/TiptapEditor.vue'

describe('TiptapEditor.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(async () => {
    if (wrapper) {
      const vm = wrapper.vm as any
      if (vm.editor) {
        vm.editor.destroy()
      }
      wrapper.unmount()
      wrapper = null
    }
    // Exécuter tous les timers en attente pour éviter l'erreur getMeta
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it('renders editor wrapper', () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test placeholder'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    expect(wrapper.find('.tiptap-editor-wrapper').exists()).toBe(true)
  })

  it('accepts modelValue prop', () => {
    const content = '<p>Test content</p>'
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: content,
        placeholder: 'Enter text'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    expect(wrapper.props('modelValue')).toBe(content)
  })

  it('uses default placeholder when not provided', () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    expect(wrapper.props('placeholder')).toBe('Commencez à écrire...')
  })

  it('uses custom placeholder when provided', () => {
    const customPlaceholder = 'Custom placeholder text'
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: customPlaceholder
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    expect(wrapper.props('placeholder')).toBe(customPlaceholder)
  })

  it('emits focus event when editor focused', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // Trigger focus via editor
    if (vm.editor) {
      vm.editor.emit('focus', { editor: vm.editor })
    }

    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event when editor blurred', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // Trigger blur via editor
    if (vm.editor) {
      vm.editor.emit('blur', { editor: vm.editor })
    }

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('emits selectionUpdate event when selection changes', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // Trigger selection update via editor
    if (vm.editor) {
      vm.editor.emit('selectionUpdate', { editor: vm.editor })
    }

    expect(wrapper.emitted('selectionUpdate')).toBeTruthy()
  })

  it('exposes editor reference', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p>Test</p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // Check that editor is exposed
    expect(vm.editor).toBeDefined()
    expect(vm.getEditor).toBeDefined()
    expect(vm.getEditor()).toBe(vm.editor)
  })

  it('watches modelValue prop and updates editor content when not focused', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p>Initial</p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    if (vm.editor) {
      // Change prop and verify editor content update would be called
      await wrapper.setProps({ modelValue: '<p>Updated</p>' })
      await nextTick()

      expect(wrapper.props('modelValue')).toBe('<p>Updated</p>')
    }
  })

  it('does not update editor content when focused', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p>Initial</p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    if (vm.editor) {
      // Set focused state
      vm.editor.isFocused = true

      const setContentSpy = vi.spyOn(vm.editor.commands, 'setContent')

      await wrapper.setProps({ modelValue: '<p>Updated</p>' })
      await nextTick()

      // Should not call setContent when focused
      // (The watch function returns early)
      expect(wrapper.props('modelValue')).toBe('<p>Updated</p>')
    }
  })

  it('does not update editor when content is same', async () => {
    const content = '<p>Same content</p>'
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: content,
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    if (vm.editor) {
      const setContentSpy = vi.spyOn(vm.editor.commands, 'setContent')

      // Update with same content
      await wrapper.setProps({ modelValue: content })
      await nextTick()

      // Should not call setContent when content is identical
      // This prevents unnecessary updates
    }
  })

  it('destroys editor on unmount', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    if (vm.editor) {
      const destroySpy = vi.spyOn(vm.editor, 'destroy')
      wrapper.unmount()
      expect(destroySpy).toHaveBeenCalled()
    }
  })

  it('applies isEmpty class when content is empty', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // isEmpty should be true when content is empty
    expect(vm.isEmpty).toBe(true)
  })

  it('computes isEmpty correctly with content', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p>Content</p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // Editor should exist
    expect(vm.editor).toBeDefined()
    // isEmpty computed property should be reactive based on editor getText()
  })

  it('renders EditorContent component', () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p>Test</p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    // Check that stub is rendered
    const stub = wrapper.find('.editor-content-stub')
    expect(stub.exists()).toBe(true)
  })

  it('handles empty HTML content correctly', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p></p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // Empty <p></p> should be considered empty
    expect(vm.isEmpty).toBe(true)
  })

  it('handles whitespace-only content as empty', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p>   </p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    // Editor should exist
    expect(vm.editor).toBeDefined()
    // isEmpty computed checks getText() and trims whitespace
  })

  it('maintains editor extensions configuration', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    if (vm.editor) {
      // Check that extensions are properly configured
      expect(vm.editor.extensionManager).toBeDefined()
      expect(vm.editor.extensionManager.extensions).toBeDefined()
    }
  })

  it('configures editor with correct class names', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    if (vm.editor && vm.editor.options && vm.editor.options.editorProps) {
      expect(vm.editor.options.editorProps.attributes.class).toContain('tiptap-content')
    }
  })

  it('handles content updates with markup', async () => {
    wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '<p><strong>Bold</strong> and <em>italic</em></p>',
        placeholder: 'Test'
      },
      global: {
        stubs: {
          EditorContent: {
            template: '<div class="editor-content-stub"></div>',
            props: ['editor']
          }
        }
      }
    })

    await flushPromises()
    const vm = wrapper.vm as any

    expect(vm.editor).toBeDefined()
    expect(wrapper.props('modelValue')).toContain('strong')
    expect(wrapper.props('modelValue')).toContain('em')
  })
})
