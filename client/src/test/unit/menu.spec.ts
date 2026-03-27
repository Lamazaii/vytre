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

vi.mock('../../services/documentService', () => ({
  documentService: {
    getAll: vi.fn().mockResolvedValue([]),
    getVersions: vi.fn().mockResolvedValue([]),
    updateVersionState: vi.fn().mockResolvedValue({}),
  },
}))

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
                { id: 1, title: 'Doc A', version: '1', blocks: [], state: 'En édition' },
                { id: 2, title: 'Doc B', version: '1', blocks: [], state: 'En édition' },
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

  it('handleVersions toggles the version menu open/close', async () => {
    const doc = { id: 1, title: 'Doc', version: 1, blocks: [], state: 'En édition', versions: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] },
          },
        })],
        stubs: { VersionHistoryMenu: true },
      },
    })

    const vm = wrapper.vm as any
    // Open
    vm.handleVersions(doc)
    await wrapper.vm.$nextTick()
    expect(vm.openVersionMenu).toBe(1)

    // Close
    vm.handleVersions(doc)
    await wrapper.vm.$nextTick()
    expect(vm.openVersionMenu).toBeNull()
  })

  it('loadVersions fetches and sets doc versions', async () => {
    const { documentService } = await import('../../services/documentService')
    const mockVersions = [
      { id: 10, documentId: 1, version: 1, title: 'Doc', state: 'En édition', snapshot: '{}', createdAt: new Date().toISOString() },
    ]
    ;(documentService.getVersions as any).mockResolvedValueOnce(mockVersions)

    const doc = { id: 1, title: 'Doc', version: 1, blocks: [], state: 'En édition', versions: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] },
          },
        })],
        stubs: { VersionHistoryMenu: true },
      },
    })

    const vm = wrapper.vm as any
    await vm.loadVersions(doc)

    expect(documentService.getVersions).toHaveBeenCalledWith(1)
  })

  it('openDocument charge la version sélectionnée si différente', async () => {
    const doc = { id: 5, title: 'Doc', version: 1, blocks: [], state: 'En édition', versions: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] },
          },
        })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })

    const vm = wrapper.vm as any
    const store = vm.store
    // Select a different version
    vm.selectedVersionByDoc = { 5: 2 }
    doc.version = 1
    await vm.openDocument(doc)

    expect(store.loadDocumentVersion).toHaveBeenCalledWith(5, 2)
  })

  it('openDocument charge le document courant si pas de version sélectionnée', async () => {
    const doc = { id: 5, title: 'Doc', version: 1, blocks: [], state: 'En édition' }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] },
          },
        })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })

    const vm = wrapper.vm as any
    const store = vm.store
    await vm.openDocument(doc)

    expect(store.loadDocument).toHaveBeenCalledWith(5)
  })

  it('handleVersionSelect enregistre la version sélectionnée', () => {
    const doc = { id: 3, title: 'Doc', version: 1, blocks: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({ stubActions: true, initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } } })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    vm.handleVersionSelect(doc, 42)
    expect(vm.selectedVersionByDoc[3]).toBe(42)
  })

  it('handleVersions charge les versions si elles ne sont pas déjà chargées', async () => {
    const { documentService } = await import('../../services/documentService')
    const doc = { id: 7, title: 'Doc', version: 1, blocks: [], state: 'En édition', versions: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({ stubActions: true, initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } } })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    vm.handleVersions(doc)
    await wrapper.vm.$nextTick()
    expect(documentService.getVersions).toHaveBeenCalledWith(7)
  })

  it('handleStateUpdate gère les erreurs sans throw', async () => {
    const { documentService } = await import('../../services/documentService')
    ;(documentService.updateVersionState as any).mockRejectedValueOnce(new Error('fail'))
    const doc = { id: 1, title: 'Doc', version: 1, blocks: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({ stubActions: true, initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } } })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    await expect(vm.handleStateUpdate(doc, 1, 'Archivé')).resolves.not.toThrow()
  })

  it('loadVersions gère les erreurs sans throw', async () => {
    const { documentService } = await import('../../services/documentService')
    ;(documentService.getVersions as any).mockRejectedValueOnce(new Error('fail'))
    const doc = { id: 9, title: 'Doc', version: 1, blocks: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({ stubActions: true, initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } } })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    await expect(vm.loadVersions(doc)).resolves.not.toThrow()
  })

  it('formatDate retourne À l instant pour moins d 1 minute', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    const now = new Date()
    expect(vm.formatDate(now)).toBe("À l'instant")
  })

  it('formatDate retourne Il y a Xm pour moins d 1 heure', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    const past = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    expect(vm.formatDate(past)).toContain('5m')
  })

  it('isSelectedVersionOlder retourne false si doc.id est undefined', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    expect(vm.isSelectedVersionOlder({ title: 'Test', blocks: [] })).toBe(false)
  })

  it('handleStateUpdate calls updateVersionState and reloads documents', async () => {
    const { documentService } = await import('../../services/documentService')
    ;(documentService.updateVersionState as any).mockResolvedValueOnce({})

    const doc = { id: 1, title: 'Doc', version: 1, blocks: [], state: 'En édition' }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: {
            blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] },
          },
        })],
        stubs: { VersionHistoryMenu: true },
      },
    })

    const vm = wrapper.vm as any
    const store = vm.store
    await vm.handleStateUpdate(doc, 10, 'Archivé')

    expect(documentService.updateVersionState).toHaveBeenCalledWith(1, 10, 'Archivé')
    expect(store.loadAllDocuments).toHaveBeenCalled()
  })

  it('formatDate retourne Il y a Xh pour moins de 24 heures', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    const past = new Date(Date.now() - 2 * 3600 * 1000) // 2 hours ago
    expect(vm.formatDate(past)).toContain('2h')
  })

  it('formatDate retourne Il y a Xj pour moins de 7 jours', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    const past = new Date(Date.now() - 3 * 86400 * 1000) // 3 days ago
    expect(vm.formatDate(past)).toContain('3j')
  })

  it('formatDate retourne une date formatée pour plus de 7 jours', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    const past = new Date(Date.now() - 10 * 86400 * 1000) // 10 days ago
    const result = vm.formatDate(past)
    expect(typeof result).toBe('string')
    expect(result).not.toContain('Il y a')
  })

  it('isSelectedVersionOlder retourne true quand une version antérieure est sélectionnée', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    const doc = {
      id: 1,
      title: 'Doc',
      version: 2,
      blocks: [],
      versions: [
        { id: 10, version: 2, createdAt: new Date().toISOString() },
        { id: 9, version: 1, createdAt: new Date(Date.now() - 1000).toISOString() },
      ],
    }
    vm.selectedVersionByDoc = { 1: 1 }
    expect(vm.isSelectedVersionOlder(doc)).toBe(true)
  })

  it('isSelectedVersionOlder retourne false quand la version la plus récente est sélectionnée', () => {
    const wrapper = mount(Menu)
    const vm = wrapper.vm as any
    const doc = {
      id: 1,
      title: 'Doc',
      version: 2,
      blocks: [],
      versions: [
        { id: 10, version: 2, createdAt: new Date().toISOString() },
      ],
    }
    vm.selectedVersionByDoc = { 1: 2 }
    expect(vm.isSelectedVersionOlder(doc)).toBe(false)
  })

  it('editDocument ne fait rien si version antérieure sélectionnée', async () => {
    const doc = {
      id: 3,
      title: 'Doc',
      version: 2,
      blocks: [],
      versions: [
        { id: 10, version: 2, createdAt: new Date().toISOString() },
        { id: 9, version: 1, createdAt: new Date(Date.now() - 1000).toISOString() },
      ],
    }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } },
        })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    vm.selectedVersionByDoc = { 3: 1 }
    await vm.editDocument(doc)
    expect(vm.store.loadDocument).not.toHaveBeenCalled()
    expect(wrapper.emitted('selectMode')).toBeFalsy()
  })

  it('editDocument charge une version spécifique si sélectionnée et différente', async () => {
    const doc = { id: 4, title: 'Doc', version: 1, blocks: [], versions: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } },
        })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    vm.selectedVersionByDoc = { 4: 2 }
    await vm.editDocument({ ...doc, version: 1 })
    expect(vm.store.loadDocumentVersion).toHaveBeenCalledWith(4, 2)
    expect(wrapper.emitted('selectMode')?.[0]).toEqual(['editor'])
  })

  it('toggles viewMode to reader when Lecteur button clicked', async () => {
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [] } },
        })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    const lecteurBtn = wrapper.findAll('.toggleButton')[0]
    await lecteurBtn?.trigger('click')
    expect(vm.viewMode).toBe('reader')
  })

  it('openDocument emits selectMode reader', async () => {
    const doc = { id: 6, title: 'Doc', version: 1, blocks: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } },
        })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const vm = wrapper.vm as any
    await vm.openDocument(doc)
    expect(wrapper.emitted('selectMode')?.[0]).toEqual(['reader'])
  })

  it('cliquer sur Lire déclenche openDocument depuis le template', async () => {
    const doc = { id: 8, title: 'Doc', version: 1, blocks: [], state: 'En édition' }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } },
        })],
        stubs: { VersionHistoryMenu: true, TitleBar: true },
      },
    })
    const readBtn = wrapper.find('.actionButton.read')
    await readBtn.trigger('click')
    expect(wrapper.emitted('selectMode')?.[0]).toEqual(['reader'])
  })

  it('VersionHistoryMenu events trigger inline template handlers', async () => {
    const doc = { id: 9, title: 'Doc', version: 1, blocks: [], state: 'En édition', versions: [] }
    const wrapper = mount(Menu, {
      global: {
        plugins: [createTestingPinia({
          stubActions: true,
          initialState: { blocks: { loadingDocuments: false, documentsError: null, allDocuments: [doc] } },
        })],
        stubs: {
          TitleBar: true,
          VersionHistoryMenu: {
            template: `<div class="vhm-stub"
              @click="$emit('toggle')"
              @dblclick="$emit('select-version', 42)"
              @mouseenter="$emit('update-state', 10, 'Archivé')"
            />`,
            emits: ['toggle', 'select-version', 'update-state'],
          },
        },
      },
    })
    const stub = wrapper.find('.vhm-stub')
    await stub.trigger('click')
    const vm = wrapper.vm as any
    expect(vm.openVersionMenu).toBe(9)

    await stub.trigger('dblclick')
    expect(vm.selectedVersionByDoc[9]).toBe(42)

    const { documentService } = await import('../../services/documentService')
    ;(documentService.updateVersionState as any).mockResolvedValueOnce({})
    await stub.trigger('mouseenter')
    await wrapper.vm.$nextTick()
    expect(documentService.updateVersionState).toHaveBeenCalledWith(9, 10, 'Archivé')
  })
})
