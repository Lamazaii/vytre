import { describe, it, expect } from 'vitest'
import HomeManager from '../../managers/home.manager'

describe('HomeManager', () => {
  it('should return a singleton instance', () => {
    const instance1 = HomeManager.instance
    const instance2 = HomeManager.instance
    
    expect(instance1).toBe(instance2)
  })

  it('should return home title', () => {
    const result = HomeManager.instance.getHomeTitle()
    
    expect(result).toBeDefined()
    expect(result).toHaveProperty('title')
    expect(result.title).toBe('Hello World!')
  })
})
