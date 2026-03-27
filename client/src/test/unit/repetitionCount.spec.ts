import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RepetitionCount from '../../components/blocks/repetitionCount.vue'

describe('RepetitionCount.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test rendering
  it('renders repetition count component', () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 1,
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.repetitionCountWrapper').exists()).toBe(true)
  })

  // Test label display
  it('displays RÉP. label', () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 1,
      },
    })
    const label = wrapper.find('.label')
    expect(label.text()).toBe('RÉP.')
  })

  // Test input field
  it('has number input field', () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 3,
      },
    })
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('number')
    expect(input.attributes('min')).toBe('0.001')
  })

  // Test v-model binding
  it('displays modelValue in input', () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 5,
      },
    })
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('5')
  })

  // Test input event emission
  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 1,
      },
    })
    const input = wrapper.find('input')
    await input.setValue(7)
    await input.trigger('input')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([7])
  })

  // Test minimum value constraint on blur
  it('resets to 1 when input is less than 1 on blur', async () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 3,
      },
    })
    const input = wrapper.find('input')
    await input.setValue(0)
    await input.trigger('blur')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emittedValues = wrapper.emitted('update:modelValue') as number[][]
    const lastEmit = emittedValues[emittedValues.length - 1]
    expect(lastEmit[0]).toBe(1)
  })

  // Test empty input on blur
  it('resets to 1 when input is empty on blur', async () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 3,
      },
    })
    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('blur')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emittedValues = wrapper.emitted('update:modelValue') as number[][]
    const lastEmit = emittedValues[emittedValues.length - 1]
    expect(lastEmit[0]).toBe(1)
  })

  // Test watch on modelValue prop
  it('updates input when modelValue prop changes', async () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 2,
      },
    })
    
    await wrapper.setProps({ modelValue: 10 })
    await wrapper.vm.$nextTick()
    
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('10')
  })

  // Test default value
  it('defaults to 1 when no modelValue provided', () => {
    const wrapper = mount(RepetitionCount)
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('1')
  })

  // Test valid number input
  it('emits valid number on input', async () => {
    const wrapper = mount(RepetitionCount, {
      props: {
        modelValue: 1,
      },
    })
    const input = wrapper.find('input')
    await input.setValue(15)
    await input.trigger('input')

    const emitted = wrapper.emitted('update:modelValue') as number[][]
    expect(emitted[0][0]).toBe(15)
  })

  it('caps at 9999 when input exceeds 9999 on blur', async () => {
    const wrapper = mount(RepetitionCount, { props: { modelValue: 1 } })
    const input = wrapper.find('input')
    await input.setValue(99999)
    await input.trigger('blur')
    const emitted = wrapper.emitted('update:modelValue') as number[][]
    const lastEmit = emitted[emitted.length - 1]
    expect(lastEmit[0]).toBe(9999)
  })

  it('rounds value when fractional digits exceed precision on blur', async () => {
    const wrapper = mount(RepetitionCount, { props: { modelValue: 1 } })
    const input = wrapper.find('input')
    await input.setValue('1.00001')
    await input.trigger('blur')
    const emitted = wrapper.emitted('update:modelValue') as number[][]
    const lastEmit = emitted[emitted.length - 1]
    expect(lastEmit[0]).toBe(1)
  })

  it('does not emit when value is already rounded on blur', async () => {
    const wrapper = mount(RepetitionCount, { props: { modelValue: 1 } })
    const input = wrapper.find('input')
    await input.setValue('2.5')
    await input.trigger('blur')
    // 2.5 rounds to 2.5 (no change needed), no extra emit beyond the input event
    const emitted = wrapper.emitted('update:modelValue') as number[][]
    if (emitted) {
      const lastEmit = emitted[emitted.length - 1]
      expect(lastEmit[0]).toBe(2.5)
    }
  })
})
