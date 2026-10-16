import 'dotenv/config'
import { OpenAI } from 'openai'
import {
  ChatCompletionMessageParam,
  DeepseekChoice,
} from 'openai/resources/chat/completions'
import { tools, executeTool } from './tool'

export const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE,
})

const MAX_TURNS = 8

export async function run() {
  // 上下文消息列表，包含用户输入和助手的回复
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: '请计算 5 除以 0'
    }
  ]

  // 记录当前对话是第几轮
  let turn = 0

  // agent loop
  while (turn < MAX_TURNS) {
    try {
      const completion = await openai.chat.completions.create({
        messages,
        model: "deepseek-flash",
        reasoning_effort: "high",
        tool_choice: 'auto',
        stream: false,
        tools
      })

      const { message, finish_reason } = completion.choices[0] as DeepseekChoice
      console.log(finish_reason, message.tool_calls)
      messages.push(message)

      // 回复结束，退出循环
      if (
        finish_reason === 'stop' ||
        finish_reason === 'length' ||
        finish_reason === 'content_filter' ||
        finish_reason === 'insufficient_system_resource' ||
        finish_reason === 'aborted'
      ) {
        return message.content
      }

      const toolCalls = message.tool_calls || []

      // 如果有工具调用，执行工具并将结果加入消息列表
      if (finish_reason === 'tool_calls' && toolCalls?.length) {
        for (const toolCall of toolCalls) {
          const result = await executeTool(toolCall)
          if (result.ok) {
            messages.push({
              role: 'tool',
              content: result.content,
              tool_call_id: toolCall.id
            })
          } else {
            messages.push({
              role: 'tool',
              content: `Error executing tool: ${result.error}`,
              tool_call_id: toolCall.id
            })
          }
        }
      }

      console.log('Assistant response:', message?.content || message.tool_calls?.map(tc => tc.type === 'function' ? `Tool call: ${tc.function.name} with args ${tc.function.arguments}` : 'Unknown tool call').join(', ') || 'No content')

    } catch (error) {
      console.error(error)
      throw error
    }
    turn++
  }
  console.log('Max turns reached or error occurred. Conversation ended.')
}

