import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SavePopUp from '../../components/popup/SavePopUp.vue'

describe('SavePopUp.vue', () => {
  it('displays the popup when isOpen is true', () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
        title: 'Save',
      },
    })
    expect(wrapper.find('.popUp').exists()).toBe(true)
  })

  it('emits confirm with the value', async () => {
    const wrapper = mount(SavePopUp, {
      props: {
        isOpen: true,
        modelValue: 'Test',
      },
    })
    
    await wrapper.vm.$nextTick()
    const buttons = wrapper.findAll('button')
    const confirmBtn = buttons.find(b => b.text().includes('CONFIRMER'))
    await confirmBtn?.trigger('click')
    
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })
})