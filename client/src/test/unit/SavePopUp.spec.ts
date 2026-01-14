import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SavePopUp from '../../components/popup/SavePopUp.vue'

describe('SavePopUp.vue', () => {
  // Test popup visibility
  it('displays the popup when isOpen is true', () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
        title: 'Save',
      },
    })
    expect(wrapper.find('.popUp').exists()).toBe(true)
  })

  // Test popup hidden when closed
  it('hides the popup when isOpen is false', () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: false,
      },
    })
    expect(wrapper.find('.popUp').exists()).toBe(false)
  })

  // Test confirm emission
  it('emits confirm with the value', async () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
        modelValue: 'Test Document',
      },
    })
    
    await wrapper.vm.$nextTick()
    const buttons = wrapper.findAll('button')
    const confirmBtn = buttons.find(b => b.text().includes('CONFIRMER'))
    await confirmBtn?.trigger('click')
    
    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')?.[0]).toEqual(['Test Document'])
  })

  // Test cancel emission
  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
      },
    })
    
    await wrapper.vm.$nextTick()
    const buttons = wrapper.findAll('button')
    const cancelBtn = buttons.find(b => b.text().includes('Annuler'))
    await cancelBtn?.trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  // Test close button
  it('closes popup when close button is clicked', async () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
      },
    })
    
    const closeBtn = wrapper.find('.closeButton')
    await closeBtn.trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  // Test v-model binding
  it('updates modelValue when input changes', async () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
        modelValue: 'Initial',
      },
    })
    
    const input = wrapper.find('input')
    await input.setValue('Updated')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Updated'])
  })

  // Test confirm with whitespace trimming
  it('trims whitespace from confirmed value', async () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
        modelValue: '  Spaced Value  ',
      },
    })
    
    await wrapper.vm.$nextTick()
    const buttons = wrapper.findAll('button')
    const confirmBtn = buttons.find(b => b.text().includes('CONFIRMER'))
    await confirmBtn?.trigger('click')
    
    expect(wrapper.emitted('confirm')?.[0]).toEqual(['Spaced Value'])
  })

  // Test default props
  it('uses default props when not provided', () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
      },
    })
    
    expect(wrapper.text()).toContain('Enregistrer')
    expect(wrapper.text()).toContain('CONFIRMER')
  })

  // Test custom props
  it('uses custom title and labels', () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
        title: 'Custom Title',
        confirmText: 'OK',
        cancelText: 'Skip',
      },
    })
    
    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).toContain('OK')
    expect(wrapper.text()).toContain('Skip')
  })
})