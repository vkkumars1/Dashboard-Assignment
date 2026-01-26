import { dataOrchestrator } from '../services/dataOrchestrator'
import { WidgetDataResponseSchema } from '../schemas/widgetSchemas'

describe('DataOrchestrator', () => {
  describe('generateData', () => {
    it('should generate valid bar chart data', async () => {
      const result = await dataOrchestrator.generateData('bar')

      // Should not be an error
      expect('code' in result).toBe(false)

      // Validate against schema
      const validated = WidgetDataResponseSchema.parse(result)
      expect(validated.type).toBe('bar')
      expect(Array.isArray(validated.data)).toBe(true)
      expect(validated.data.length).toBeGreaterThan(0)
    })

    it('should generate valid line chart data', async () => {
      const result = await dataOrchestrator.generateData('line')

      expect('code' in result).toBe(false)
      const validated = WidgetDataResponseSchema.parse(result)
      expect(validated.type).toBe('line')
      expect(Array.isArray(validated.data)).toBe(true)
    })

    it('should generate valid treemap data', async () => {
      const result = await dataOrchestrator.generateData('treemap')

      expect('code' in result).toBe(false)
      const validated = WidgetDataResponseSchema.parse(result)
      expect(validated.type).toBe('treemap')
    })

    it('should generate valid scatter data', async () => {
      const result = await dataOrchestrator.generateData('scatter')

      expect('code' in result).toBe(false)
      const validated = WidgetDataResponseSchema.parse(result)
      expect(validated.type).toBe('scatter')
    })

    it('should reject invalid widget type', async () => {
      const result = await dataOrchestrator.generateData('invalid' as any)

      expect('code' in result).toBe(true)
      if ('code' in result) {
        expect(result.code).toBe('UNKNOWN_TYPE')
      }
    })
  })

  describe('generateDataBatch', () => {
    it('should generate data for multiple types in parallel', async () => {
      const results = await dataOrchestrator.generateDataBatch(['bar', 'line', 'scatter'])

      expect(results.size).toBe(3)
      expect(results.has('bar')).toBe(true)
      expect(results.has('line')).toBe(true)
      expect(results.has('scatter')).toBe(true)

      // All should be valid
      const barResult = results.get('bar')
      expect('code' in barResult!).toBe(false)
    })

    it('should return mixed valid and invalid results', async () => {
      const results = await dataOrchestrator.generateDataBatch(['bar', 'invalid' as any])

      expect(results.size).toBe(2)

      const barResult = results.get('bar')
      expect('code' in barResult!).toBe(false) // valid

      const invalidResult = results.get('invalid' as any)
      expect('code' in invalidResult!).toBe(true) // invalid
    })
  })
})
