import { describe, it, expect } from 'vitest'
import UserManager from '../../managers/user.manager'

describe('UserManager', () => {
  it('should return a singleton instance', () => {
    const instance1 = UserManager.instance
    const instance2 = UserManager.instance
    
    expect(instance1).toBe(instance2)
  })

  it('should return user message', () => {
    const result = UserManager.instance.getUser()
    
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result).toBe('respond with a resource')
  })
})
