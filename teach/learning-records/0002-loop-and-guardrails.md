# 第 2 课前后：用户已自行写出 agent loop，但缺上界与错误兜底

2026-10-15 记录。上一条记录（[0001-starting-point](0001-starting-point.md)）写于当日上午，其中「`index.ts` 只调用一次模型、没有工具执行闭环」的判断**已经过时**。

## 用户实际做了什么（基于文件，非自述）

- `mini-agent/src/agent.ts` 里出现了完整的 `run()`：`while (true)` + 解析 `tool_calls` + `JSON.parse(arguments)` + `await tool.execute()` + push `tool` 消息。**结构是对的**，第 1 课教的「push 整个 message 对象」也做对了（`messages.push(choice.message)`）。
- `notes/tool-call.md`（23:32 写入）用他自己的话复述了第 1 课的三个协议要点：arguments 是字符串、靠 `tool_call_id` 配对、历史要完整（必须把 assistant 的 tool_calls 加进历史）。**第 1 课的核心知识显然落地了**，且措辞是他自己的，不是抄课件。
- 仓库已 `git init`，`.gitignore` 写了 `.env` / `node_modules` / `.DS_Store`，但**没有任何 commit**（`git log` 报 "does not have any commits yet"），文件都停在 staged。第 1 课里建议的 `git commit` 那一步没做。

## 尚未证实的

- **无法确认他跑过 `pnpm start`**。文件里没有运行痕迹，他也未报告过输出。第 1 课的三个破坏性实验（A/B/C）是否有做，同样未知。
- 因此**不记录任何「已掌握」结论**，只记录「代码已写出」这个事实。

## 代码里真实存在的缺陷（本课教学入口）

按严重度：

1. **无最大步数**：`while (true)` 没有任何上界。
2. **白名单判停 → 死循环**：退出条件只有 `finish_reason === 'stop'`。DeepSeek 文档里 `finish_reason` 有 6 个取值，另外 5 个（`length` / `content_filter` / `insufficient_system_resource` / `aborted`，以及本应继续的 `tool_calls` 之外的意外值）会让两个 `if` 都落空 → `messages` 不变 → 同一请求无限重复。
3. **悬空 tool_call（协议违规）**：`tools.some(...)` 为 false 时跳过执行，但上一行已经把带着 `tool_calls` 的 assistant 消息 push 进历史 → 账不平 → **下一次**请求 400。病因与报错现场隔一轮。
4. **`JSON.parse` 与 `tool.execute` 无 try/catch** → 抛异常直接崩进程。
5. **`messages` 是模块级可变数组** → 两次 `run()` 会共享历史。
6. 小问题：`tools` 变量声明了但请求里用字面量 `[calculator]`；`finish_reason === 'stop'` 分支里手工重建 assistant 消息（丢字段），当前无害因为循环立刻结束，但多轮对话时会变成 400。

## Implications

- 第 2 课**不能讲「怎么写 while 循环」**——他已经写出来了。改成「给他的循环做体检」，用他自己的代码当教材。事实证明这个切入点也更容易带入「协议债」这类高阶概念。
- 第 1 课结尾承诺的「第 2 课讲循环」需要当场修正；已在新课开头明确说明，避免让他以为自己的进度落后于课程。
- 他的自学速度快于课程节奏（一节课内独立完成 loop）。**后续课程应预设他会提前完成动手部分**，备课重点放在「他大概率不会自己发现的东西」上，而不是讲解步骤。
- 「报错现场与病因隔一轮」这条概念他此前完全没有接触，值得作为本课最核心的 takeaway。
- 下一课做「可注入的模型依赖 + 测试」时，可以引用本课实验 B/C/D 都只能靠真模型碰运气触发作为动机。
