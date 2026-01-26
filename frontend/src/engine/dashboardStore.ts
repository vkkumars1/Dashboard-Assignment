import { create } from 'zustand'
import type { DashboardLayout, WidgetConfig, WidgetState } from '../types/widget.types'

// Single source of truth for dashboard state
// Keep it simple - we persist layout separately, cache widget data here

interface DashboardStoreState {
  currentLayout: DashboardLayout | null
  widgetStates: Record<string, WidgetState>

  // Layout management
  setLayout: (layout: DashboardLayout) => void
  updateWidgetPosition: (widgetId: string, position: DashboardLayout['widgets'][0]['position']) => void
  addWidget: (widget: WidgetConfig) => void
  removeWidget: (widgetId: string) => void

  // Widget data management
  setWidgetData: (widgetId: string, state: WidgetState) => void
  setWidgetLoading: (widgetId: string, isLoading: boolean) => void
  setWidgetError: (widgetId: string, error: string | null) => void

  // Helpers
  getWidget: (widgetId: string) => WidgetConfig | undefined
  getWidgetState: (widgetId: string) => WidgetState
}

const DEFAULT_WIDGET_STATE: WidgetState = {
  isLoading: false,
  error: null,
  data: null,
}

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  currentLayout: null,
  widgetStates: {},

  setLayout: (layout) => set({ currentLayout: layout }),

  updateWidgetPosition: (widgetId, position) =>
    set((state) => {
      if (!state.currentLayout) return state
      return {
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map((w) =>
            w.id === widgetId ? { ...w, position } : w
          ),
          updatedAt: Date.now(),
        },
      }
    }),

  addWidget: (widget) =>
    set((state) => {
      if (!state.currentLayout) return state
      return {
        currentLayout: {
          ...state.currentLayout,
          widgets: [...state.currentLayout.widgets, widget],
          updatedAt: Date.now(),
        },
        // initialize widget state
        widgetStates: {
          ...state.widgetStates,
          [widget.id]: {
            isLoading: true,
            error: null,
            data: null,
          },
        },
      }
    }),

  removeWidget: (widgetId) =>
    set((state) => {
      if (!state.currentLayout) return state
      const { [widgetId]: _, ...remainingStates } = state.widgetStates
      return {
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.filter((w) => w.id !== widgetId),
          updatedAt: Date.now(),
        },
        widgetStates: remainingStates,
      }
    }),

  setWidgetData: (widgetId, widgetState) =>
    set((state) => ({
      widgetStates: {
        ...state.widgetStates,
        [widgetId]: widgetState,
      },
    })),

  setWidgetLoading: (widgetId, isLoading) =>
    set((state) => ({
      widgetStates: {
        ...state.widgetStates,
        [widgetId]: {
          ...state.widgetStates[widgetId],
          isLoading,
        },
      },
    })),

  setWidgetError: (widgetId, error) =>
    set((state) => ({
      widgetStates: {
        ...state.widgetStates,
        [widgetId]: {
          ...state.widgetStates[widgetId],
          error,
        },
      },
    })),

  getWidget: (widgetId) => {
    const layout = get().currentLayout
    return layout?.widgets.find((w) => w.id === widgetId)
  },

  getWidgetState: (widgetId) => {
    return get().widgetStates[widgetId] || DEFAULT_WIDGET_STATE
  },
}))
