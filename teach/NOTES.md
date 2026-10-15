# 教学笔记

## 用户偏好

- 中文授课，技术术语保留英文（tool calling、agent loop、context window 等）。
- 每节课 **30–60 分钟**，必须包含一个明确、可验证的小胜利。宁可短。
- 代码注释用中文，注释解释「为什么」而非复述代码。
- 编程基础：会写代码但经验较浅（TypeScript/Node）。不预设 async/await 细节、类型体操、Node 运行时知识 —— 用到时现场补一小段。

## 工作区约定

- **`/Users/pzj/Desktop/pi-learning/` 不是 git 仓库**（2026-10-15 确认）。用户自己的 `README.md` 要求「实验前确认 Git 状态，不要让课程代码覆盖 `mini-agent/` 中已有的工作」—— 在没有版本控制的情况下，**改动 `mini-agent/` 前必须先备份或建议用户初始化 git**。
- 总路线图：[`../ROADMAP.md`](../../ROADMAP.md)。每节课要明确说明它对应路线图的哪个阶段/哪个 checkbox，学完后提醒用户去勾选。
- `../notes/` 是用户自己的笔记区（用自己的话总结），`../labs/` 放单点实验。课程产物放 `teach/lessons/`。

## 授课策略

- 用户路线是「**先手写最小实现 → 再对照 Pi 源码 → 最后独立项目**」。教学顺序必须咬合这条线，不要提前引入框架（LangChain 等），那会破坏「亲手实现」的直觉建立。
- 用户的起点：已经能调用 OpenAI 兼容 API，已经写了 tool schema，但**还没跑通 tool 执行闭环**。这是第一节课的入口。
- 用户已有认知：「Agent = LLM + Harness（提示词、上下文管理、错误处理、一系列工具）」—— 可以引用他自己的这句话来接续教学。
- Pi 的源码阅读（阶段 3/4）排在手写闭环之后；本阶段提到 Pi 只作为「未来要对照的对象」，不展开细节。

## 已核实的事实（2026-10-15）

- `deepseek-flash`（DeepSeek-V4.1-Flash）是**真实 model id**，官方定价页标注 Tool Calls ✓。`deepseek-chat` / `deepseek-reasoner` **已退役**，网上老教程会误导用户。
- `reasoning_effort: 'high'` 是**合法参数**（出现在 DeepSeek 官方首页 Node.js 示例中）。
- **未实测**：`deepseek-flash` + `reasoning_effort` 是否真的进入 thinking 模式，从而触发 `reasoning_content` 回传要求。这是当前最大的不确定性，值得用一次真实 API 调用消除（需用户同意动用其 key）。
- OpenAI 文档主域已迁移：`platform.openai.com` → `developers.openai.com`。两者都有 Cloudflare 反爬，本环境**无法抓取 OpenAI 文档正文**（全部降级为"仅检索"）。DeepSeek 文档是最扎实的一手来源。
- Pi（badlogic/pi-mono）核心 agent loop 仅约 5 个文件：`packages/agent/src/agent-loop.ts`。

## 待办 / 悬而未决

- **尚未确认用户是否愿意加入社区**（LINUX DO / r/AI_Agents 等）。这是 RESOURCES.md 里 Wisdom 一节唯一空缺的原因。后续课程温和地提一次，若拒绝则记入 RESOURCES.md。
- 用户还未跑过第 1 课的代码，因此尚无学习证据 —— 不要在他实际验证前写新的 learning record。
