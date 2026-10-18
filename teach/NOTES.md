# 教学笔记

## 用户偏好

- 中文授课，技术术语保留英文（tool calling、agent loop、context window 等）。
- 每节课 **30–60 分钟**，必须包含一个明确、可验证的小胜利。宁可短。
- 代码注释用中文，注释解释「为什么」而非复述代码。
- 编程基础：会写代码但经验较浅（TypeScript/Node）。不预设 async/await 细节、类型体操、Node 运行时知识 —— 用到时现场补一小段。

## 工作区约定

- **仓库已有 commit 历史**（2026-10-18 确认）：此前「没有 commit」的记录已过时。当前最新三个提交为 `8aae94c`（依赖/工具链）、`df33410`（第 2 课功能：logger、除零错误、MAX_TURNS）、`3317c87`（ESLint 格式化）。`.gitignore` 覆盖 `.env` / `node_modules` / `.DS_Store`，工作区干净。**修改 `mini-agent/` 前仍先确认工作区干净、有回滚点；不要直接覆盖用户写好的代码。**
- 总路线图：[`../ROADMAP.md`](../../ROADMAP.md)。每节课要明确说明它对应路线图的哪个阶段/哪个 checkbox，学完后提醒用户去勾选。
- `../notes/` 是用户自己的笔记区（用自己的话总结），`../labs/` 放单点实验。课程产物放 `teach/lessons/`。
- **不要替用户改 `mini-agent/` 的代码**，除非他明确要求。他用一节课的时间就独立写出了 agent loop，动手能力比自评的「经验较浅」要强；课件给完整代码、他自己敲，是当前有效的模式。

## 授课策略

- 用户路线是「**先手写最小实现 → 再对照 Pi 源码 → 最后独立项目**」。教学顺序必须咬合这条线，不要提前引入框架（LangChain 等），那会破坏「亲手实现」的直觉建立。
- 用户的起点：已经能调用 OpenAI 兼容 API，已经写了 tool schema，但**还没跑通 tool 执行闭环**。这是第一节课的入口。
- 用户已有认知：「Agent = LLM + Harness（提示词、上下文管理、错误处理、一系列工具）」—— 可以引用他自己的这句话来接续教学。
- Pi 的源码阅读（阶段 3/4）排在手写闭环之后；本阶段提到 Pi 只作为「未来要对照的对象」，不展开细节。
- **用户的自学速度快于课程节奏**：第 1 课当天他就独立写完了整个 agent loop。备课时应假设「动手部分他会提前做完」，把力气放在他大概率不会自己发现的机制上（例如协议不变式、错误分类、判据该建在谁的集合上）。

## 已核实的事实（2026-10-15）

- `deepseek-flash`（DeepSeek-V4.1-Flash）是**真实 model id**，官方定价页标注 Tool Calls ✓。`deepseek-chat` / `deepseek-reasoner` **已退役**，网上老教程会误导用户。
- `reasoning_effort: 'high'` 是**合法参数**（出现在 DeepSeek 官方首页 Node.js 示例中）。
- **补充（第 2 课备课时发现）**：DeepSeek 文档里有**显式的 thinking 开关** `thinking: { type: 'enabled' }`，与 `reasoning_effort` 并列出现在官方 Node 示例中；文档另有一句 "From DeepSeek-V3.2, the API supports tool use in the thinking mode"。第 1 课遗漏了这个开关，已在第 2 课末尾补正。**「是否进入 thinking 模式」是可显式控制的，不必靠猜**。
- **仍未实测**：只给 `reasoning_effort` 而不给 `thinking` 开关时，是否真的进入 thinking 模式、从而触发 `reasoning_content` 回传规则。需用户同意动用 key 才能验证。
- **`finish_reason` 有 6 个取值**（DeepSeek 官方 API 文档逐字核对）：`stop` / `length` / `content_filter` / `tool_calls` / `insufficient_system_resource` / `aborted`。**与本机 `openai@7.32.0` 的类型声明对不上**（SDK 声明 5 个，多 `function_call`、少后两个）——本机实测 `finishReason === 'aborted'` 会报 `TS2367`（no overlap）。这是一个「类型系统给出借来的安全感」的绝佳教学案例。
- **本机实测（2026-10-18 更新）**：`mini-agent` 在 TypeScript 6.0.3 下 `pnpm exec tsc --noEmit` 干净；此前「TS 7.0.2 与 `@antfu/eslint-config` 9.5.1 不兼容、需要 `--skipLibCheck`」的记录已过时。`tsconfig.json` 现在有 `include`，无 `skipLibCheck`。
- OpenAI 文档主域已迁移：`platform.openai.com` → `developers.openai.com`。两者都有 Cloudflare 反爬，本环境**无法抓取 OpenAI 文档正文**（WebFetch 全部被拦）。**DeepSeek 文档站 `api-docs.deepseek.com` 可以用 `curl` 拿到完整正文**（WebFetch 会被 "unable to verify domain" 拦住，但 `curl -sL` 正常返回 HTML）—— 需要核对协议细节时走 curl。
- Pi（badlogic/pi-mono）核心 agent loop 仅约 5 个文件：`packages/agent/src/agent-loop.ts`。
- **第 3 课备课时实测（2026-10-18）**：本机 Node `v26.11.1`、`tsx v4.23.13`，`tsx --test src/*.test.ts` 可以直接跑 `node:test` 的 TypeScript 测试，**无需新增依赖**。无 `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` 时，`new OpenAI()` 在构造时即抛 `Missing credentials`；因此测试要能跑，必须把 client 改成懒加载。`structuredClone` 遇到对象里的函数（`calculator.execute`）会抛 `DataCloneError`，fake model 记录请求时只能克隆 `messages`。
- **第 3 课代码已在临时副本验证**：`tsc --noEmit` 与 ESLint 均通过；6 个测试全绿（约 0.26s），且两个 key 都 unset 时同样全绿。**未对真实 DeepSeek API 发请求。** 用户现有 `agent.ts` 仍保留 `finish_reason` 白名单判停，第 3 课会换成 `toolCalls.length === 0`。

## 课程进度

- **第 1 课**（`lessons/0001-tool-call-roundtrip.html`）：工具调用的完整往返，无循环。用户的 `notes/tool-call.md` 显示三个协议要点已内化。
- **第 2 课**（`lessons/0002-loop-guardrails.html`）：停止条件 + 错误处理 + MAX_STEPS 兜底，以他自己的 loop 为教材做体检。新增速查表 `reference/agent-loop.html`。**用户尚未报告四个破坏性实验的结果**；已按用户要求直接进入第 3 课。
- **第 3 课**（`lessons/0003-injectable-model-and-tests.html`）：依赖注入（`ChatModel` 窄接口 + 懒加载 client）、`node:test` + fake model、6 个不依赖真实模型的测试。对应阶段 1 最后一项与阶段 2「测试策略」。**待用户跑通测试并反馈**。

## 待办 / 悬而未决

- **尚未确认用户是否愿意加入社区**（LINUX DO / r/AI_Agents 等）。这是 RESOURCES.md 里 Wisdom 一节唯一空缺的原因。后续课程温和地提一次，若拒绝则记入 RESOURCES.md。
- 用户**是否真的跑过 `pnpm start`** 仍未证实。第 1 课三个破坏性实验与第 2 课四个实验是否做过，均未知。2026-10-18 用户直接要求「开始下一课」，因此第 3 课已交付；后续仍应优先询问实验/测试反馈，再决定是否继续加难度。
- 未验证的预测（第 2 课里已明确标注为预测）：悬空 tool_call 导致 HTTP 400；`max_tokens: 1` 是否稳定产生 `finish_reason: 'length'`；模型面对工具失败/垃圾返回值时的实际反应。
