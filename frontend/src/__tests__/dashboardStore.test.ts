import { useDashboardStore } from '../engine/dashboardStore'
import type { DashboardLayout, WidgetConfig } from '../types/widget.types'

// Reset store between tests
beforeEach(() => {
  useDashboardStore.setState({
    currentLayout: null,
    widgetStates: {},
  })
})

describe('Dashboard Store', () => {
  it('should initialize with empty state', () => {
    const { currentLayout, widgetStates } = useDashboardStore.getState()
    expect(currentLayout).toBeNull()
    expect(Object.keys(widgetStates).length).toBe(0)
  })

  describe('Layout Management', () => {
    it('should set a layout', () => {
      const layout: DashboardLayout = {
        id: 'test',
        name: 'Test Layout',
        widgets: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      useDashboardStore.getState().setLayout(layout)

      const { currentLayout } = useDashboardStore.getState()
      expect(currentLayout?.id).toBe('test')
      expect(currentLayout?.name).toBe('Test Layout')
    })

    it('should add widget to layout', () => {
      const layout: DashboardLayout = {
        id: 'test',
        name: 'Test Layout',
        widgets: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      useDashboardStore.getState().setLayout(layout)

      const widget: WidgetConfig = {
        id: 'widget-1',
        type: 'bar',
        title: 'Test Widget',
        dataSource: 'test',
        position: { x: 0, y: 0, w: 6, h: 3 },
      }

      useDashboardStore.getState().addWidget(widget)

      const { currentLayout } = useDashboardStore.getState()
      expect(currentLayout?.widgets.length).toBe(1)
      expect(currentLayout?.widgets[0].id).toBe('widget-1')
    })

    it('should remove widget from layout', () => {
      const layout: DashboardLayout = {
        id: 'test',
        name: 'Test Layout',
        widgets: [
          {
            id: 'widget-1',
            type: 'bar',
            title: 'Test Widget',
            dataSource: 'test',
            position: { x: 0, y: 0, w: 6, h: 3 },
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      useDashboardStore.getState().setLayout(layout)

      useDashboardStore.getState().removeWidget('widget-1')

      const { currentLayout } = useDashboardStore.getState()
      expect(currentLayout?.widgets.length).toBe(0)
    })

    it('should update widget position', () => {
      const layout: DashboardLayout = {
        id: 'test',
        name: 'Test Layout',
        widgets: [
          {
            id: 'widget-1',
            type: 'bar',
            title: 'Test Widget',
            dataSource: 'test',
            position: { x: 0, y: 0, w: 6, h: 3 },
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      useDashboardStore.getState().setLayout(layout)

      useDashboardStore.getState().updateWidgetPosition('widget-1', {
        x: 6,
        y: 3,
        w: 6,
        h: 3,
      })

      const { currentLayout } = useDashboardStore.getState()
      const widget = currentLayout?.widgets[0]
      expect(widget?.position.x).toBe(6)
      expect(widget?.position.y).toBe(3)
    })
  })

  describe('Widget Data Management', () => {
    it('should set widget data', () => {
      useDashboardStore.getState().setWidgetData('widget-1', {
        isLoading: false,
        error: null,
        data: [{ label: 'A', value: 10 }],
      })

      const state = useDashboardStore.getState().getWidgetState('widget-1')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should set widget loading state', () => {
      useDashboardStore.getState().setWidgetLoading('widget-1', true)

      const state = useDashboardStore.getState().getWidgetState('widget-1')
      expect(state.isLoading).toBe(true)
    })

    it('should set widget error', () => {
      useDashboardStore.getState().setWidgetError('widget-1', 'Network error')

      const state = useDashboardStore.getState().getWidgetState('widget-1')
      expect(state.error).toBe('Network error')
    })

    it('should return default state for unknown widget', () => {
      const state = useDashboardStore.getState().getWidgetState('unknown')

      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.data).toBeNull()
    })
  })
})
