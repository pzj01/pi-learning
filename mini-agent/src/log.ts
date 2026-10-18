import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageToolCall,
  ChatCompletionUserMessageParam,
  DeepseekChoice,
} from 'openai/resources/chat/completions'
import { isFunctionToolCall } from './tool'

export interface Logger {
  setup: (params: ChatCompletionCreateParamsNonStreaming) => void
  user: (message: ChatCompletionUserMessageParam) => void
  assistant: (message: ChatCompletionAssistantMessageParam) => void
  tool: (message: ChatCompletionMessageToolCall) => void
  finish: (finishReason: DeepseekChoice['finish_reason']) => void
  error: (error: Error) => void
}

function setup(params: ChatCompletionCreateParamsNonStreaming) {
  console.warn(`
    Model: ${params.model}
    Reasoning effort: ${params.reasoning_effort},
    Tool choice: ${params.tool_choice}
    Tools: ${params.tools?.filter(tool => tool.type === 'function').map(tool => tool.function.name).join(', ')}
  `)
}

function user(message: ChatCompletionUserMessageParam) {
  console.warn(`User: ${message.content}`)
}

function assistant(message: ChatCompletionAssistantMessageParam) {
  console.warn(`Assistant: ${message.content || 'no content'}`)
}

function tool(message: ChatCompletionMessageToolCall) {
  if (isFunctionToolCall(message)) {
    console.warn(`
      Tool: ${message.function.name}
      Arguments: ${message.function.arguments}  
    `)
  }
}

function finish(finishReason: DeepseekChoice['finish_reason']) {
  console.warn(`Finish reason: ${finishReason}`)
}

function error(error: Error | string) {
  console.error(typeof error === 'string' ? error : error.message)
}

export default {
  setup,
  user,
  assistant,
  tool,
  finish,
  error,
}
