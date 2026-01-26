import {
  BarChartSchema,
  LineChartSchema,
  TreemapSchema,
  ScatterSchema,
  WidgetDataResponseSchema,
} from '../schemas/widgetSchemas'

describe('Widget Schemas', () => {
  describe('BarChartSchema', () => {
    it('should validate correct bar chart data', () => {
      const data = [
        { label: 'Q1', value: 100 },
        { label: 'Q2', value: 200 },
      ]
      expect(() => BarChartSchema.parse(data)).not.toThrow()
    })

    it('should reject data with missing label', () => {
      const data = [{ value: 100 }]
      expect(() => BarChartSchema.parse(data)).toThrow()
    })

    it('should reject data with non-numeric value', () => {
      const data = [{ label: 'Q1', value: 'not-a-number' }]
      expect(() => BarChartSchema.parse(data)).toThrow()
    })
  })

  describe('LineChartSchema', () => {
    it('should validate correct line chart data with number timestamp', () => {
      const data = [
        { timestamp: 1000, value: 50 },
        { timestamp: 2000, value: 60 },
      ]
      expect(() => LineChartSchema.parse(data)).not.toThrow()
    })

    it('should validate line chart data with string timestamp', () => {
      const data = [
        { timestamp: '2024-01-01T00:00:00Z', value: 50 },
        { timestamp: '2024-01-02T00:00:00Z', value: 60 },
      ]
      expect(() => LineChartSchema.parse(data)).not.toThrow()
    })

    it('should reject data with missing value', () => {
      const data = [{ timestamp: 1000 }]
      expect(() => LineChartSchema.parse(data)).toThrow()
    })
  })

  describe('TreemapSchema', () => {
    it('should validate nested treemap data', () => {
      const data = {
        name: 'Parent',
        children: [
          { name: 'Child1', value: 100 },
          { name: 'Child2', value: 200 },
        ],
      }
      expect(() => TreemapSchema.parse(data)).not.toThrow()
    })

    it('should validate treemap with no children', () => {
      const data = { name: 'Leaf', value: 100 }
      expect(() => TreemapSchema.parse(data)).not.toThrow()
    })

    it('should reject treemap with invalid nested structure', () => {
      const data = {
        name: 'Parent',
        children: [{ invalid_field: 'test' } as any], // missing name
      }
      expect(() => TreemapSchema.parse(data)).toThrow()
    })
  })

  describe('ScatterSchema', () => {
    it('should validate scatter data with x and y', () => {
      const data = [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ]
      expect(() => ScatterSchema.parse(data)).not.toThrow()
    })

    it('should validate scatter data with optional labels', () => {
      const data = [
        { x: 10, y: 20, label: 'Point A' },
        { x: 30, y: 40, label: 'Point B' },
      ]
      expect(() => ScatterSchema.parse(data)).not.toThrow()
    })

    it('should reject data with missing y coordinate', () => {
      const data = [{ x: 10 }]
      expect(() => ScatterSchema.parse(data)).toThrow()
    })
  })

  describe('WidgetDataResponseSchema', () => {
    it('should validate complete bar chart response', () => {
      const response = {
        type: 'bar',
        data: [
          { label: 'Q1', value: 100 },
          { label: 'Q2', value: 200 },
        ],
        timestamp: Date.now(),
      }
      expect(() => WidgetDataResponseSchema.parse(response)).not.toThrow()
    })

    it('should reject response with missing timestamp', () => {
      const response = {
        type: 'bar',
        data: [{ label: 'Q1', value: 100 }],
      }
      expect(() => WidgetDataResponseSchema.parse(response)).toThrow()
    })

    it('should reject response with invalid type', () => {
      const response = {
        type: 'invalid-type',
        data: [],
        timestamp: Date.now(),
      }
      expect(() => WidgetDataResponseSchema.parse(response)).toThrow()
    })
  })
})
