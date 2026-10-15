# AI Agent 开发 资源清单

精选、高信任来源。教学中的知识从这里取，而不是靠模型的记忆。

> **核实标记**（数据是别人报告的，我区分清楚）：
> - ✅ **已抓取** = 本次会话真的拿到并读了该页正文
> - 🔎 **仅检索** = 搜索结果确认存在，但正文**没能抓取**（Cloudflare 拦截或地区限制），**内容未逐字核对**
> - 📁 **本地核对** = 直接读了你机器上的文件
>
> 抓取用的是 `curl`（HTTP 状态码 + 正文），因为本环境的网页抓取工具对这几个域名被安全策略拦了。**OpenAI 官方文档全部属于 🔎，是最弱的一环。**

---

## Knowledge

### A. 你正在用的：DeepSeek 与 OpenAI 兼容协议

- ✅ [DeepSeek — Tool Calls](https://api-docs.deepseek.com/guides/tool_calls/)
  **最高优先级。** 你就是通过这个接口开发的，它才是最该信的一手来源。覆盖 `tool_choice` 的 `auto` / `none` / `required` / 指定函数名四种取值；`strict` schema 模式（beta）；以及一条容易忽略的限制——**Chat Completions API 不支持把 tool call 消息"插入"对话中途**，只能追加，插入要用 Anthropic `/messages` 或 Responses API。
  *何时翻它*：字段语义拿不准、想强制模型必须调工具、想让参数严格匹配 schema。
  *注意*：旧路径 `/guides/function_calling` 已失效，现行是 `tool_calls`。

- ✅ [DeepSeek — 定价与功能表](https://api-docs.deepseek.com/quick_start/pricing/)
  **用来确认模型名**。现行模型是 `deepseek-flash`（DeepSeek-V4.1-Flash）和 `deepseek-v4-pro`，两者 Tool Calls 都是 ✓。**`deepseek-chat` 和 `deepseek-reasoner` 已从新文档中消失** —— 网上大量教程还在用它们，会误导你。

- ✅ [DeepSeek — Thinking 模式下的 tool call 示例](https://api-docs.deepseek.com/api_samples/thinking_mode_api_example_tool_call/)
  **必读，且关系到你当前代码。** thinking 模式下如果请求带 `tools`，**之前的 `reasoning_content` 必须原样回传**，否则报错。详见下面 [Gaps 第 4 条](#gaps) 与第 1 课的对应小节。

- 🔎 [OpenAI — Function calling guide](https://developers.openai.com/api/docs/guides/function-calling)
  协议的原始出处，DeepSeek 的兼容层以此为准。
  *何时翻它*：想知道某字段是"官方标准"还是某家兼容层的方言。
  ⚠️ **OpenAI 文档主域已从 `platform.openai.com` 迁到 `developers.openai.com`**，旧域名仍在但会重定向。**两者都带 Cloudflare 反爬，本次未能抓取正文。**

- 📁 `mini-agent/node_modules/openai/resources/chat/completions.d.ts`
  你实际装的 `openai@7.32.0` 的类型定义，**字段形状的最终权威**。`ChatCompletionMessageFunctionToolCall` 在 1428 行；`ChatCompletionMessageToolCall` 这个联合类型在 1469 行。
  *何时翻它*：TypeScript 报错、想确认字段是否可空。**这是唯一 100% 可信、且你随时能打开的"文档"。**

---

### B. 概念与设计原则（Anthropic 工程博客）

这四篇构成本领域最被广泛引用的公共框架。**建议按顺序读**，尤其不要跳过第一篇。

- ✅ [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
  奠基性文章（2024-12-19，Erik Schluntz & Barry Zhang）。最重要的贡献是一个区分：**workflow（预定义代码路径）vs agent（模型自主决定路径）**。给出 5 种 workflow 模式、三条设计原则，核心观点是 **"最成功的实现用的是简单可组合的模式，而不是复杂框架"**。
  *何时翻它*：阶段 1–2 结束时。**它也是本课程反对过早引入 LangChain 之类框架的依据。**
  *作者与日期来自检索摘要，未从正文逐字核对。*

- ✅ [Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
  怎么设计工具的 description 和参数。直接对应你 `calculatorTool` 里那段 `description` —— 它决定了模型 *要不要* 调你的工具。
  *何时翻它*：阶段 4 的「工具系统」，或当模型该调工具却没调的时候。

- ✅ [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  上下文窗口怎么管。**直接对应你 ROADMAP 阶段 2 的「上下文窗口」条目** —— 也就是你现在 `messages.push(...)` 那条线未来会撞上的墙。
  *何时翻它*：阶段 2。

- ✅ [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
  多 agent 分工的真实工程取舍。你的 mission 把多 agent 划在范围外，先存着。
  *注意*：`.../built-multi-agent-research-system` 会 307 跳到这个地址，题目里带 `built-` 是错的。

---

### C. 学术源头

阶段 4 讨论"为什么是现在这个循环结构"时会需要。按重要度排序：

- ✅ [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)（Yao et al., 2022）
  **最重要的一篇。** "思考—行动—观察"交错的范式，是今天所有 agent loop 的思想源头。你第 2 课要写的 while 循环，就是它的工程化版本。
- ✅ [Reflexion](https://arxiv.org/abs/2303.11366) — 让 agent 从失败中自我反思并重试。
- ✅ [Toolformer](https://arxiv.org/abs/2302.04761) — 让模型自学何时调用工具。
- ✅ [Tree of Thoughts](https://arxiv.org/abs/2305.10601) — 搜索式推理。
- ✅ [The Rise and Potential of LLM Based Agents](https://arxiv.org/abs/2309.07864) — 综述，用来建立全景。
- ✅ [A Survey on LLM based Autonomous Agents](https://arxiv.org/abs/2308.11432) — 另一篇综述，结构划分清晰。

---

### D. 动手参考（官方最小实现）

- ✅ [How to build an agent with the Node SDK](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_build_an_agent_with_the_node_sdk.mdx)
  **OpenAI 官方的 Node/TypeScript 最小 agent loop 参考实现 —— 本清单里最该看的一篇动手材料。** 语言、SDK、要做的事都和你完全一致。
  *何时翻它*：**第 2 课之后立刻看**，用来对照你自己写的循环。注意后缀是 `.mdx`，写成 `.ipynb` 会 404。
- ✅ [How to call functions with chat models](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_call_functions_with_chat_models.ipynb)
  更基础的 function calling 例子，可以当第 1 课的补充。
- ✅ [Anthropic 的 agent 设计模式 recipe](https://github.com/anthropics/claude-cookbooks/tree/main/patterns/agents)
  五种 workflow 模式的可运行实现，和 B 组第一篇对照着看。
- 📁 [Pi — badlogic/pi-mono](https://github.com/badlogic/pi-mono)
  **你 ROADMAP 选定的对照对象**，作者 Mario Zechner。TypeScript monorepo，MIT。
  关键结构：`@mariozechner/pi-agent-core` 的 **agent loop 只有约 5 个文件（`packages/agent/src/agent-loop.ts`）**，工具、流、事件都通过接口委托给调用方；13 个内置工具（bash / read / write / edit / grep / find / ls…）用 TypeBox 定义 schema、AJV 校验；会话存成 JSONL 树，靠 `parentId` 支持分支与 fork。
  它的设计立场值得注意：作者**公开反对 MCP**，主张"CLI 工具即 skill"；并且**刻意不做 sub-agent、plan mode、reflection loop**。你读到阶段 4 时，这些"不做"比"做了"更有信息量。
  *以上来自网络检索与第三方 review，**尚未逐行核对仓库源码**。*

---

### E. 进阶（阶段 5 再碰）

- ✅ [MCP 入门](https://modelcontextprotocol.io/docs/getting-started/intro) ｜ [MCP 规范](https://modelcontextprotocol.io/specification/latest)
  工具集成的标准化协议。有意思的是 Pi 明确拒绝它 —— 等你学到这里，正好有素材做对比。
- ✅ [Claude Agent SDK 总览](https://docs.claude.com/en/api/agent-sdk/overview) ｜ [TypeScript 参考](https://docs.claude.com/en/api/agent-sdk/typescript)
  托管式 agent 的另一种做法：把 loop 交给 SDK。
- ✅ [LangChain.js](https://js.langchain.com/docs/introduction/)
  **阶段 1–2 期间不要看。** 它会把你要亲手建立的直觉直接替你做完。存到阶段 5，那时你才有能力评判它的取舍。
- 🔎 [openai/openai-agents-js](https://github.com/openai/openai-agents-js)（3.9k ⭐）｜[vercel/ai](https://github.com/vercel/ai)（27.3k ⭐）｜[mastra](https://github.com/mastra-ai/mastra)（28.8k ⭐）｜[cloudflare/agents](https://github.com/cloudflare/agents)（5.8k ⭐）
  活跃的 TS agent 生态，阶段 5 用来了解"生产里的 agent 长什么样"。
  ⚠️ **`run-llama/LlamaIndexTS` 已归档**（最后 push 2026-03），不作为教学推荐。

---

### F. 课程

- ✅ [Claude Academy](https://www.anthropic.com/learn)（原 Anthropic 官方课程页）
- ✅ [microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners)（77.1k ⭐）
  系统但**偏 Python**，且覆盖面比你的路线图宽得多。当补充读物，别当主线。
- ⚠️ [Hugging Face Agents Course](https://huggingface.co/learn/agents-course)（有[中文版](https://huggingface.co/learn/agents-course/zh-CN/)）
  做得很好，但**基于 Python**，且本机网络连不上（存在性由搜索确认）。
- ⚠️ [anthropics/courses](https://github.com/anthropics/courses) —— **仓库已归档**（22.8k ⭐），内容可能过时，慎用。

---

## Wisdom · 社区

Wisdom 只能从真实的人那里获得，读文档读不出来。这是本清单唯一无法靠抓取补上的部分。

**中文社区（优先推荐给你）**
- ⚠️ [LINUX DO](https://linux.do/)
  中文技术社区里对 AI / Agent 工程讨论质量最高的之一，被形容为"Agent 工程师的野生 Stack Overflow"。**本机网络连不上（域名被拦），但搜索评价一致很高。** 你在阶段 3 读 Pi 源码卡住时，这类社区比英文论坛更好提问。
- ✅ [WaytoAGI](https://waytoagi.com/) —— 中文 AI 知识库聚合，适合拓视野，深度一般。

**英文社区**
- ⚠️ [r/AI_Agents](https://www.reddit.com/r/AI_Agents/) ｜ ⚠️ [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/)
  两个都是热门 subreddit，Reddit 封了本机 IP 故未能核实内容质量。**待你自己判断。**
- ✅ [Latent Space 社区页](https://www.latent.space/p/community)
  其 Discord 邀请链接的权威出处。偏从业者、信号密度高。

> **待定**：我还没有问过你是否愿意加入社区。**如果不愿意，直接说，我会把这一节降级为"可选"，之后的课程也不再提。**（这是你的 workspace，你的偏好优先。）

---

## Gaps

本清单目前**没有**可靠来源的部分，也就是下一步该补的：

1. **社区的社交验证** —— 上面几个社区的存在性确认了，但**没有一个是本机真的打开过的**。哪个真正适合你提问，只有你注册之后才知道。
2. **OpenAI 官方文档正文** —— 全部停留在"仅检索"。这是本清单最大的短板，因为你的 API 是 OpenAI 兼容的。**缓解方案**：以 DeepSeek 文档为准（它能抓取），并在 TS 类型上以本地 `.d.ts` 为准。
3. **`reasoning_effort` 与 thinking 模式的确切行为** —— `reasoning_effort: 'high'` 确认是合法参数（出现在 DeepSeek 官方首页 Node.js 示例中），但**你的 `deepseek-flash` 是否因此进入 thinking 模式、以及是否会触发 `reasoning_content` 回传要求，没有实测过**（实测要动用你的 API key）。这是当前最值得用一次真实调用消除的不确定性 —— 见第 1 课末尾。
4. **流式 + 工具的细节** —— 官方未声明二者互斥，但流式下 tool_call 的 `arguments` 是分片（delta）到达、需要自行拼接。**未经核实**，阶段 2 讲流式时再查。
