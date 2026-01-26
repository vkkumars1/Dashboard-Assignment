import { widgetRegistry } from '../engine/WidgetRegistry'

describe('WidgetRegistry', () => {
  it('should register and retrieve widgets', () => {
    // All our widgets should be registered during app init
    expect(widgetRegistry.isRegistered('bar')).toBe(true)
    expect(widgetRegistry.isRegistered('line')).toBe(true)
    expect(widgetRegistry.isRegistered('treemap')).toBe(true)
    expect(widgetRegistry.isRegistered('scatter')).toBe(true)
  })

  it('should return all available widget types', () => {
    const types = widgetRegistry.getAvailableTypes()

    expect(types).toContain('bar')
    expect(types).toContain('line')
    expect(types).toContain('treemap')
    expect(types).toContain('scatter')
    expect(types.length).toBe(4)
  })

  it('should return component for registered type', () => {
    const component = widgetRegistry.getComponent('bar')
    expect(component).not.toBeNull()
  })

  it('should return null for unregistered type', () => {
    const component = widgetRegistry.getComponent('unknown' as any)
    expect(component).toBeNull()
  })

  it('should get definition with constraints', () => {
    const def = widgetRegistry.getDefinition('bar')

    expect(def).not.toBeNull()
    expect(def?.minWidth).toBeGreaterThan(0)
    expect(def?.minHeight).toBeGreaterThan(0)
  })
})
