import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Menu from '../../components/applications/menu.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'

// Mock du fetch global
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as any

describe('Menu.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Réinitialiser le mock fetch
    vi.clearAllMocks()
  })

  // Test rendering
  it('renders the menu', () => {
    const wrapper = mount(Menu)
    expect(wrapper.exists()).toBe(true)
  })

  // Test has menu container
  it('has menu container', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.menuContainer').exists()).toBe(true)
  })

  // Test has header content
  it('displays header with title', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.headerContent').exists()).toBe(true)
  })

  // Test has documents list section
  it('displays documents list section', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.documentsList').exists()).toBe(true)
  })

  // Test new button exists
  it('has new document button', () => {
    const wrapper = mount(Menu)
    const newButton = wrapper.find('.newButton')
    expect(newButton.exists()).toBe(true)
  })

  // Test new document button emits event
  it('emits selectMode event when new button clicked', async () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: {
              allDocuments: [],
              loadingDocuments: false,
              documentsError: null,
            },
          },
        })],
      },
    })
    const newButton = wrapper.find('.newButton')
    
    await newButton.trigger('click')
    
    const store: any = wrapper.vm.store
    expect(store.createNewDocument).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('selectMode')).toBeTruthy()
    if (wrapper.emitted('selectMode')) {
      expect(wrapper.emitted('selectMode')[0]).toEqual(['editor'])
    }
  })

  it('appelle loadAllDocuments au montage', () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: {
              allDocuments: [],
              loadingDocuments: false,
              documentsError: null,
            },
          },
        })],
      },
    })

    const store: any = wrapper.vm.store
    expect(store.loadAllDocuments).toHaveBeenCalledTimes(1)
  })

  it('affiche le message de chargement', () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: {
              loadingDocuments: true,
              allDocuments: [],
              documentsError: null,
            },
          },
        })],
      },
    })

    expect(wrapper.find('.loadingMessage').exists()).toBe(true)
  })

  it('affiche le message d’erreur', () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: {
              loadingDocuments: false,
              allDocuments: [],
              documentsError: 'Oups',
            },
          },
        })],
      },
    })

    expect(wrapper.find('.errorMessage').text()).toContain('Oups')
  })

  it('affiche le message vide quand aucun document', () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: {
              loadingDocuments: false,
              allDocuments: [],
              documentsError: null,
            },
          },
        })],
      },
    })

    expect(wrapper.find('.emptyMessage').exists()).toBe(true)
  })

  it('affiche la liste et les actions sur les documents', async () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: {
              loadingDocuments: false,
              documentsError: null,
              allDocuments: [
                { id: 1, title: 'Doc A', version: '1', blocks: [] },
                { id: 2, title: 'Doc B', version: '1', blocks: [] },
              ],
            },
          },
        })],
      },
    })

    expect(wrapper.findAll('.documentCard')).toHaveLength(2)

    const store: any = wrapper.vm.store
    const editBtn = wrapper.find('.actionButton.edit')
    await editBtn.trigger('click')

    expect(store.loadDocument).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('selectMode')?.[0]).toEqual(['editor'])
  })

  it('filtre les documents via la recherche', async () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: {
              loadingDocuments: false,
              documentsError: null,
              allDocuments: [
                { id: 1, title: 'Alpha', version: '1', blocks: [] },
                { id: 2, title: 'Beta', version: '1', blocks: [] },
              ],
            },
          },
        })],
      },
    })

    const input = wrapper.find('.searchInput')
    await input.setValue('alpha')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.documentCard')).toHaveLength(1)
    expect(wrapper.text()).toContain('Alpha')
  })
})
