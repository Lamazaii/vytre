import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VersionHistoryMenu from '../../components/applications/versionHistoryMenu.vue'

const makeDoc = (overrides = {}) => ({
  id: 1,
  title: 'Doc',
  version: 3,
  blocks: [],
  state: 'En édition',
  versions: [
    { id: 10, documentId: 1, version: 3, title: 'Doc', state: 'En édition', createdAt: new Date().toISOString() },
    { id: 9,  documentId: 1, version: 2, title: 'Doc', state: 'Actif',      createdAt: new Date(Date.now() - 86400000).toISOString() },
  ],
  ...overrides,
})

describe('VersionHistoryMenu.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the version toggle button', () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: false, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.actionButton.versions').exists()).toBe(true)
  })

  it('emits toggle when version button is clicked', async () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: false, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.actionButton.versions').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('shows version menu when isOpen is true', () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.versionMenu').exists()).toBe(true)
  })

  it('hides version menu when isOpen is false', () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: false, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.versionMenu').exists()).toBe(false)
  })

  it('shows loading state when loading is true', () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: true, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.loadingVersions').exists()).toBe(true)
  })

  it('shows empty state when doc has no versions', () => {
    const doc = makeDoc({ versions: [] })
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc, isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.emptyVersions').exists()).toBe(true)
  })

  it('renders version items', () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    const items = wrapper.findAll('.versionItem')
    expect(items.length).toBe(2)
  })

  it('emits selectVersion when a version item is clicked', async () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.versionItem').trigger('click')
    expect(wrapper.emitted('selectVersion')).toBeTruthy()
  })

  it('marks the effective selected version with is-selected class', () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: false, selectedVersion: 3 },
      global: { stubs: { Teleport: true } },
    })
    const selected = wrapper.find('.versionItem.is-selected')
    expect(selected.exists()).toBe(true)
  })

  it('falls back to doc.version when selectedVersion is null', () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    // doc.version=3, version item with version=3 should be selected
    const selected = wrapper.find('.versionItem.is-selected')
    expect(selected.exists()).toBe(true)
  })

  it('shows "Voir tout l\'historique" button when more than 3 versions exist', () => {
    const doc = makeDoc({
      versions: [
        { id: 1, documentId: 1, version: 1, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 2, documentId: 1, version: 2, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 3, documentId: 1, version: 3, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 4, documentId: 1, version: 4, title: 'D', state: 'E', createdAt: new Date().toISOString() },
      ],
    })
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc, isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.versionHistoryButton').exists()).toBe(true)
  })

  it('toggles expanded history when the button is clicked', async () => {
    const doc = makeDoc({
      versions: [
        { id: 1, documentId: 1, version: 1, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 2, documentId: 1, version: 2, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 3, documentId: 1, version: 3, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 4, documentId: 1, version: 4, title: 'D', state: 'E', createdAt: new Date().toISOString() },
      ],
    })
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc, isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })

    // Initially shows 2 (slice(0,2))
    expect(wrapper.findAll('.versionItem').length).toBe(2)

    // Click to expand
    await wrapper.find('.versionHistoryButton').trigger('click')
    expect(wrapper.findAll('.versionItem').length).toBe(4)
    expect(wrapper.find('.versionHistoryButton').text()).toContain('Voir moins')

    // Click to collapse
    await wrapper.find('.versionHistoryButton').trigger('click')
    expect(wrapper.findAll('.versionItem').length).toBe(2)
  })

  it('opens state dropdown when state button is clicked', async () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })

    const stateBtn = wrapper.find('.versionStateButton')
    await stateBtn.trigger('click')

    // openStateMenuFor should be set to the version id (10)
    // Teleport is stubbed so dropdown won't appear in DOM, but the state is set
    expect(wrapper.vm.openStateMenuFor).toBe(10)
  })

  it('toggles state dropdown closed when clicked again', async () => {
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc: makeDoc(), isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })

    const stateBtn = wrapper.find('.versionStateButton')
    await stateBtn.trigger('click')
    expect(wrapper.vm.openStateMenuFor).toBe(10)

    await stateBtn.trigger('click')
    expect(wrapper.vm.openStateMenuFor).toBeNull()
  })

  it('resets expanded state when menu is closed', async () => {
    const doc = makeDoc({
      versions: [
        { id: 1, documentId: 1, version: 1, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 2, documentId: 1, version: 2, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 3, documentId: 1, version: 3, title: 'D', state: 'E', createdAt: new Date().toISOString() },
        { id: 4, documentId: 1, version: 4, title: 'D', state: 'E', createdAt: new Date().toISOString() },
      ],
    })
    const wrapper = mount(VersionHistoryMenu, {
      props: { doc, isOpen: true, loading: false, selectedVersion: null },
      global: { stubs: { Teleport: true } },
    })

    await wrapper.find('.versionHistoryButton').trigger('click')
    expect(wrapper.findAll('.versionItem').length).toBe(4)

    // Close the menu
    await wrapper.setProps({ isOpen: false })
    // Re-open
    await wrapper.setProps({ isOpen: true })

    // Should be collapsed again
    expect(wrapper.findAll('.versionItem').length).toBe(2)
  })
})
