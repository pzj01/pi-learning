import { ChatCompletion } from 'openai/resources/chat/completions'

declare module 'openai/resources/chat/completions' {
  export type DeepseekChoice = Omit<ChatCompletion.Choice, 'finish_reason'> & {
    finish_reason: 
      'insufficient_system_resource' |
      'aborted' |
      'function_call' |
      'tool_calls' |
      'stop' |
      'length' |
      'content_filter'
  }
}