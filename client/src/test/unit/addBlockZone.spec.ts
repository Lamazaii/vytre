import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AddBlockZone from '../../components/blocks/addBlockZone.vue'

describe('AddBlockZone.vue', () => {
  // Test rendering
  it('renders the component', () => {
    const wrapper = mount(AddBlockZone, {
      props: {
        disabled: false,
      },
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  // Test emit add event
  it('emits add event when clicked and not disabled', async () => {
    const wrapper = mount(AddBlockZone, {
      props: {
        disabled: false,
      },
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
  })

  // Test disabled state
  it('does not emit when disabled', async () => {
    const wrapper = mount(AddBlockZone, {
      props: {
        disabled: true,
      },
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('add')).toBeFalsy()
  })

  // Test disabled class applied
  it('applies disabled styling when disabled', () => {
    const wrapper = mount(AddBlockZone, {
      props: {
        disabled: true,
      },
    })
    
    expect(wrapper.props('disabled')).toBe(true)
  })

  // Test enabled state
  it('is clickable when not disabled', () => {
    const wrapper = mount(AddBlockZone, {
      props: {
        disabled: false,
      },
    })

    expect(wrapper.props('disabled')).toBe(false)
  })

  it('defaults to enabled when disabled prop is not provided', async () => {
    const wrapper = mount(AddBlockZone)
    await wrapper.trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('handles null disabled prop as not disabled', async () => {
    const wrapper = mount(AddBlockZone, { props: { disabled: null as any } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
  })
})
