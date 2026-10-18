import type {
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'

interface Executable<T, R> {
  execute: (params: T) => Promise<R>
}

interface CalculatorParams {
  operation: 'add' | 'subtract' | 'multiply' | 'divide'
  a: number
  b: number
}

export const calculator: ChatCompletionTool & Executable<CalculatorParams, number> = {
  type: 'function',
  function: {
    name: 'calculator',
    description: 'A simple calculator tool that can perform basic arithmetic operations.',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The arithmetic operation to perform.',
        },
        a: {
          type: 'number',
          description: 'The first number.',
        },
        b: {
          type: 'number',
          description: 'The second number.',
        },
      },
      required: ['operation', 'a', 'b'],
    },
  },
  async execute(params: CalculatorParams) {
    const { operation, a, b } = params
    switch (operation) {
      case 'add':
        return a + b
      case 'subtract':
        return a - b
      case 'multiply':
        return a * b
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero is not allowed.')
        }
        return a / b
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  },
}

export const tools = [calculator]

export function isFunctionToolCall(toolCall: ChatCompletionMessageToolCall): toolCall is ChatCompletionMessageFunctionToolCall {
  return toolCall.type === 'function'
}

export function getTool(toolCall: ChatCompletionMessageFunctionToolCall) {
  return tools.find(tool => tool.function.name === toolCall.function.name)
}

type ToolExecutionResult = {
  ok: true
  content: string
} | {
  ok: false
  error: Error
}

export async function executeTool(toolCall: ChatCompletionMessageToolCall): Promise<ToolExecutionResult> {
  if (!isFunctionToolCall(toolCall)) {
    return {
      ok: false,
      error: new Error('Invalid tool call'),
    }
  }

  const tool = getTool(toolCall)

  if (tool) {
    let params: any
    try {
      params = JSON.parse(toolCall.function.arguments)
    }
    catch (error) {
      return {
        ok: false,
        error: new Error('Invalid tool call arguments', { cause: error }),
      }
    }

    try {
      const result = await tool.execute(params)
      return {
        ok: true,
        content: result.toString(),
      }
    }
    catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error('Unknown error during tool execution'),
      }
    }
  }
  else {
    return {
      ok: false,
      error: new Error('Tool not found'),
    }
  }
}
