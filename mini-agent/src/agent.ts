import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionToolMessageParam,
  DeepseekChoice,
} from 'openai/resources/chat/completions'
import process from 'node:process'
import { OpenAI } from 'openai'
import logger from './log'
import { executeTool, tools } from './tool'
import 'dotenv/config'

export const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE,
})

const MAX_TURNS = 8

export async function run() {
  const context: ChatCompletionCreateParamsNonStreaming = {
    // 上下文消息列表，包含用户输入和助手的回复
    messages: [
      {
        role: 'user',
        content: '请计算 1500 除以 3',
      },
    ],
    model: 'deepseek-flash',
    reasoning_effort: 'high',
    tool_choice: 'auto',
    stream: false,
    tools,
  }

  // 记录当前对话是第几轮
  let turn = 0

  logger.setup(context)

  // agent loop
  while (turn < MAX_TURNS) {
    try {
      const completion = await openai.chat.completions.create(context)

      const { message, finish_reason } = completion.choices[0] as DeepseekChoice
      context.messages.push(message)

      // 回复结束，退出循环
      if (
        finish_reason === 'stop'
        || finish_reason === 'length'
        || finish_reason === 'content_filter'
        || finish_reason === 'insufficient_system_resource'
        || finish_reason === 'aborted'
      ) {
        logger.finish(finish_reason)
        return message.content
      }

      const toolCalls = message.tool_calls || []

      // 如果有工具调用，执行工具并将结果加入消息列表
      if (finish_reason === 'tool_calls' && toolCalls?.length) {
        for (const toolCall of toolCalls) {
          logger.tool(toolCall)
          const result = await executeTool(toolCall)
          const message: ChatCompletionToolMessageParam = {
            role: 'tool',
            content: '',
            tool_call_id: toolCall.id,
          }
          if (result.ok) {
            message.content = result.content
          }
          else {
            message.content = `Error executing tool: ${result.error.message}`
          }
          context.messages.push(message)
        }
      }

      logger.assistant(message)
    }
    catch (error) {
      logger.error(error as Error)
      throw error
    }
    turn++
  }

  logger.error('Max turns reached')
}
