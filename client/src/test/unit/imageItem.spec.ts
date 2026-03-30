import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ImageItem from '../../components/blocks/EditableBlock/imageItem.vue'

describe('ImageItem.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders with imagePath', () => {
    const wrapper = mount(ImageItem, {
      props: { imagePath: 'test.jpg', isSelected: false },
    })
    expect(wrapper.exists()).toBe(true)
    const img = wrapper.find('.blockImage')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('test.jpg')
  })

  it('applies selected-image class when isSelected is true', () => {
    const wrapper = mount(ImageItem, {
      props: { imagePath: 'photo.png', isSelected: true },
    })
    expect(wrapper.find('.imageItem').classes()).toContain('selected-image')
  })

  it('does not apply selected-image class when isSelected is false', () => {
    const wrapper = mount(ImageItem, {
      props: { imagePath: 'photo.png', isSelected: false },
    })
    expect(wrapper.find('.imageItem').classes()).not.toContain('selected-image')
  })

  it('emits select event when the item is clicked', async () => {
    const wrapper = mount(ImageItem, {
      props: { imagePath: 'test.jpg', isSelected: false },
    })
    await wrapper.find('.imageItem').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('emits remove event when the trash icon is clicked', async () => {
    const wrapper = mount(ImageItem, {
      props: { imagePath: 'test.jpg', isSelected: false },
    })
    await wrapper.find('.removeImageIcon').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
  })

  it('remove click does not also emit select (click.stop)', async () => {
    const wrapper = mount(ImageItem, {
      props: { imagePath: 'test.jpg', isSelected: false },
    })
    await wrapper.find('.removeImageIcon').trigger('click')
    expect(wrapper.emitted('select')).toBeFalsy()
  })

  it('renders trash icon inside removeImageIcon', () => {
    const wrapper = mount(ImageItem, {
      props: { imagePath: 'test.jpg', isSelected: false },
    })
    expect(wrapper.find('.removeImageIcon img').exists()).toBe(true)
  })
})
