import 'dotenv/config'
import { OpenAI } from 'openai'
import { ChatCompletionTool, ChatCompletionMessageParam } from 'openai/resources/chat/completions'

export const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE,
})

interface Executable<T, R> {
  execute(params: T): Promise<R>
}

interface CalculatorParams {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  a: number;
  b: number;
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
  async execute(params: CalculatorParams): Promise<number> {
    const { operation, a, b } = params;
    switch (operation) {
      case 'add':
        return a + b;
      case 'subtract':
        return a - b;
      case 'multiply':
        return a * b;
      case 'divide':
        return a / b;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}

const messages: ChatCompletionMessageParam[] = [
  {
    role: 'user',
    content: '请计算 5 + 3 的结果'
  }
]

const tools = [calculator]

export async function run() {
  while (true) {
    const completion = await openai.chat.completions.create({
      messages,
      model: "deepseek-flash",
      reasoning_effort: "high",
      tool_choice: 'auto',
      stream: false,
      tools: [
        calculator
      ]
    })

    const choice = completion.choices[0];

    console.log('Assistant response:', choice.message?.content || choice.message.tool_calls?.map(tc => tc.type === 'function' ? `Tool call: ${tc.function.name} with args ${tc.function.arguments}` : 'Unknown tool call').join(', ') || 'No content');

    // 回复结束，退出循环
    if (choice.finish_reason === 'stop') {
      messages.push({
        role: 'assistant',
        content: choice.message?.content || ''
      })
      break
    }

    if (choice.message.tool_calls?.length) {
      messages.push(choice.message)
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === 'function' && tools.some(tool => tool.function.name === toolCall.function.name)) {
          const tool = tools.find(tool => tool.function.name === toolCall.function.name);
          if (tool) {
            const params = JSON.parse(toolCall.function.arguments)
            
            messages.push({
              role: 'tool',
              content: (await tool.execute(params)).toString(),
              tool_call_id: toolCall.id
            })
          }
        }
      }
    }
  }
}