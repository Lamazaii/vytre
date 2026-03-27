import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IconToggleGroup from '../../components/optionBar/shared/iconToggleGroup.vue'

describe('IconToggleGroup.vue', () => {
  // Test rendering
  it('renders toggle group with icons', () => {
    const wrapper = mount(IconToggleGroup, {
      props: {
        personIcon: 'test.svg',
        visibilityIcon: 'test.svg',
        leftActive: false,
        rightActive: false,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test has buttons
  it('renders two toggle buttons', () => {
    const wrapper = mount(IconToggleGroup, {
      props: {
        personIcon: 'test.svg',
        visibilityIcon: 'test.svg',
        leftActive: false,
        rightActive: false,
      },
    })
    
    const buttons = wrapper.findAll('.iconButton')
    expect(buttons.length).toBe(2)
  })

  // Test left button active state
  it('applies active class when left button is active', () => {
    const wrapper = mount(IconToggleGroup, {
      props: {
        personIcon: 'test.svg',
        visibilityIcon: 'test.svg',
        leftActive: true,
        rightActive: false,
      },
    })
    
    const buttons = wrapper.findAll('.iconButton')
    expect(buttons[0].classes()).toContain('active')
  })

  // Test right button active state
  it('applies active class when right button is active', () => {
    const wrapper = mount(IconToggleGroup, {
      props: {
        personIcon: 'test.svg',
        visibilityIcon: 'test.svg',
        leftActive: false,
        rightActive: true,
      },
    })
    
    const buttons = wrapper.findAll('.iconButton')
    expect(buttons[1].classes()).toContain('active')
  })

  // Test button click
  it('emits event when left button is clicked', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: {
        personIcon: 'test.svg',
        visibilityIcon: 'test.svg',
        leftActive: false,
        rightActive: false,
      },
    })
    
    const buttons = wrapper.findAll('.iconButton')
    await buttons[0].trigger('click')
    
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  // Test both buttons active
  it('handles both buttons active state', () => {
    const wrapper = mount(IconToggleGroup, {
      props: {
        personIcon: 'test.svg',
        visibilityIcon: 'test.svg',
        leftActive: true,
        rightActive: true,
      },
    })

    const buttons = wrapper.findAll('.iconButton')
    expect(buttons[0].classes()).toContain('active')
    expect(buttons[1].classes()).toContain('active')
  })

  it('clicking left when right is active switches to left', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: { personIcon: 'a.svg', visibilityIcon: 'b.svg', leftActive: false, rightActive: true },
    })
    const buttons = wrapper.findAll('.iconButton')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
    const emitted = wrapper.emitted('change')![0][0] as any
    expect(emitted.left).toBe(true)
    expect(emitted.right).toBe(false)
  })

  it('clicking left when left is already active does nothing', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: { personIcon: 'a.svg', visibilityIcon: 'b.svg', leftActive: true, rightActive: false },
    })
    const buttons = wrapper.findAll('.iconButton')
    await buttons[0].trigger('click')
    // No change event emitted since already active
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('clicking right when neither active activates right', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: { personIcon: 'a.svg', visibilityIcon: 'b.svg', leftActive: false, rightActive: false },
    })
    const buttons = wrapper.findAll('.iconButton')
    await buttons[1].trigger('click')
    const emitted = wrapper.emitted('change')![0][0] as any
    expect(emitted.left).toBe(false)
    expect(emitted.right).toBe(true)
  })

  it('clicking right when left is active switches to right', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: { personIcon: 'a.svg', visibilityIcon: 'b.svg', leftActive: true, rightActive: false },
    })
    const buttons = wrapper.findAll('.iconButton')
    await buttons[1].trigger('click')
    const emitted = wrapper.emitted('change')![0][0] as any
    expect(emitted.left).toBe(false)
    expect(emitted.right).toBe(true)
  })

  it('clicking right when right is already active does nothing', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: { personIcon: 'a.svg', visibilityIcon: 'b.svg', leftActive: false, rightActive: true },
    })
    const buttons = wrapper.findAll('.iconButton')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('syncs local state when leftActive prop changes', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: { personIcon: 'a.svg', visibilityIcon: 'b.svg', leftActive: false, rightActive: false },
    })
    await wrapper.setProps({ leftActive: true })
    const buttons = wrapper.findAll('.iconButton')
    expect(buttons[0].classes()).toContain('active')
  })

  it('syncs local state when rightActive prop changes', async () => {
    const wrapper = mount(IconToggleGroup, {
      props: { personIcon: 'a.svg', visibilityIcon: 'b.svg', leftActive: false, rightActive: false },
    })
    await wrapper.setProps({ rightActive: true })
    const buttons = wrapper.findAll('.iconButton')
    expect(buttons[1].classes()).toContain('active')
  })
})
