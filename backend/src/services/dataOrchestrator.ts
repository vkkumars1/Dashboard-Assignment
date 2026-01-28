import type { WidgetDataResponse, WidgetType } from '../types/widgetTypes.js'
import { getGenerator, type GeneratorType } from '../generators/dataGenerators.js'
import { WidgetDataResponseSchema } from '../schemas/widgetSchemas.js'
import { ZodError } from 'zod'

// Single service responsible for:
// 1. Figure out which generator to use
// 2. Call the generator
// 3. Validate output against schema
// 4. Return response or error

export interface DataOrchestratorError {
  message: string
  code: 'UNKNOWN_TYPE' | 'GENERATION_FAILED' | 'VALIDATION_FAILED'
}

export const dataOrchestrator = {
  async generateData(
    type: WidgetType
  ): Promise<WidgetDataResponse | DataOrchestratorError> {
    try {
      // Get the generator function for this type
      const generator = getGenerator(type as GeneratorType)
      if (!generator) {
        return {
          message: `Unknown widget type: ${type}`,
          code: 'UNKNOWN_TYPE',
        }
      }

      // Generate raw data
      const seed = Math.floor(Math.random() * 1000)
      const rawData = generator(seed)

      // Create the response object
      const response: WidgetDataResponse = {
        type,
        data: rawData,
        timestamp: Date.now(),
      }

      // Validate against schema - this is important!
      // Catches any shape mismatches before frontend receives it
      const validated = WidgetDataResponseSchema.parse(response) as WidgetDataResponse
      return validated
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          message: `Data validation failed: ${error.message}`,
          code: 'VALIDATION_FAILED',
        }
      }

      return {
        message: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'GENERATION_FAILED',
      }
    }
  },

  // For parallelizing multiple requests - useful in real scenarios
  async generateDataBatch(types: WidgetType[]): Promise<Map<WidgetType, WidgetDataResponse | DataOrchestratorError>> {
    const results = new Map<WidgetType, WidgetDataResponse | DataOrchestratorError>()
    const promises = types.map(async (type) => {
      const result = await this.generateData(type)
      results.set(type, result)
    })

    await Promise.all(promises)
    return results
  },
}
