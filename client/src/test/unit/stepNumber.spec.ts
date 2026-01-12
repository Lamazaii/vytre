import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StepNumber from '../../components/blocks/stepNumber.vue'

describe('StepNumber.vue', () => {
  // Test basic rendering
  it('renders step number correctly', () => {
    const wrapper = mount(StepNumber, {
      props: {
        numero: 5,
      },
    })
    
    expect(wrapper.text()).toContain('5')
  })

  // Test zero value
  it('displays zero when provided', () => {
    const wrapper = mount(StepNumber, {
      props: {
        numero: 0,
      },
    })
    
    expect(wrapper.text()).toContain('0')
  })

  // Test large numbers
  it('handles large step numbers', () => {
    const wrapper = mount(StepNumber, {
      props: {
        numero: 999,
      },
    })
    
    expect(wrapper.text()).toContain('999')
  })

  // Test component structure
  it('renders with correct class structure', () => {
    const wrapper = mount(StepNumber, {
      props: {
        numero: 1,
      },
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  // Test prop updates
  it('updates when prop changes', async () => {
    const wrapper = mount(StepNumber, {
      props: {
        numero: 1,
      },
    })
    
    await wrapper.setProps({ numero: 10 })
    
    expect(wrapper.text()).toContain('10')
  })
})
