# Mission: AI Agent 开发

## Why

不满足于「会调框架」，而是想真正搞懂 agent 内部是怎么运转的 —— 从一次模型请求、一次工具调用、一次循环开始亲手实现，再用成熟项目（[Pi / badlogic/pi-mono](https://github.com/badlogic/pi-mono)）当参照系校准自己的理解。最终目标是能独立设计、实现、调试属于自己的 agent 应用。

## Success looks like

- 不看教程，能白板画出并逐步解释：`用户消息 → 模型请求 → 工具调用 → 本地执行 → 工具结果 → 再次请求模型 → 最终回答`
- `mini-agent/` 在正常情况和至少一种错误情况下都能正确结束，且有可重复运行的测试
- 能沿 Pi 源码定位并解释一次完整 agent 运行的调用路径，并区分「源码可确认的事实」与「自己的推断」
- 完成一个自己设计的、解决具体需求的 agent 应用，能说明哪些设计借鉴自 Pi、哪些是自己的决定

## Constraints

- 每次学习 30–60 分钟，偏好「一节课一个小胜利」
- TypeScript/Node 基础：会写代码但经验较浅 —— 不预设 async、类型系统的高级知识，需要时补
- 模型通过 OpenAI 兼容 SDK 调用 DeepSeek（项目：`mini-agent/`）
- 总路线图的 source of truth 是 [`../ROADMAP.md`](../../ROADMAP.md)；本 workspace 只负责课程与学习记录，不取代路线图

## Out of scope（暂时不碰）

- 生产部署、多租户、监控告警、成本治理
- 多 Agent 编排、复杂 RAG 管线
- 模型训练与微调
- 通读 Pi 全部源码（按机制**按需**深入，不以通读为目标）
