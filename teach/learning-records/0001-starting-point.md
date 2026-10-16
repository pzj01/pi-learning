# 起点：能调模型、定义过 tool schema，但闭环未通

> ⚠️ **后续更新**：当日晚些时候用户已自行写出完整的 agent loop，本记录中「只有一次模型调用」的描述随之过时。见 [0002](0002-loop-and-guardrails.md)。本文件保留为**起点快照**，不改写历史判断。

2026-10-15 建立。用户自评编程水平为「会写代码但经验较浅」（TypeScript/Node），并已独立完成以下工作：用 OpenAI 兼容 SDK 调用 DeepSeek、写好了一个 calculator 的 tool schema、搭好了 `mini-agent/` + `notes/` + `labs/` 的仓库结构，还手写了一份相当完整的 `ROADMAP.md`（7 个阶段，明确写着「先手写最小版本 → 再对照 Pi → 最后独立实践」）。

**关键事实**：`mini-agent/src/index.ts` 只调用了一次模型并打印 `message.content`，**没有解析 `tool_calls`、没有执行工具、没有回传结果**。也就是说他停在了 agent loop 的门槛前一步。

**Evidence**：`mini-agent/src/index.ts`、`notes/什么是Agent.md`、`ROADMAP.md` 的「当前状态」章节。

**Implications**：
- 不需要教「什么是 LLM 调用」或「怎么发 HTTP 请求」——起点直接放在 **tool call 的消息协议（三段消息）** 上。
- 他自学出来的心智模型是「Agent = LLM + Harness（提示词、上下文管理、错误处理、工具）」，这个框架是对的，后续教学可以反复挂靠它，不必重建。
- 他明确偏好「理解原理」而非「会调框架」，因此**在阶段 1–2 期间不要引入 LangChain 之类框架**，否则会破坏亲手建立直觉的过程。
- 他有写文档和记录的习惯（ROADMAP 质量高于同龄学习者），可以让学习记录与他的 `notes/` 形成互补，而不是重复。
