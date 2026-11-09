# 02 · 连线

- 笔记：[02-连线.md](../../../../notes/02-连线.md)
- 源码地图：[2. 连线](../../../../SOURCE_MAP.md#2-连线)
- 画布实现：[ConnectionExercise.tsx](ConnectionExercise.tsx)
- 规则实现：[connectionRules.ts](connectionRules.ts)
- 反馈样式：[connections.css](connections.css)
- 注册表：[topics/index.ts](../index.ts)
- 状态：笔记完成（规则与存边已实现，待 review 验收）。
- 页面：在 demo 本地地址后附加 `#topics/02-connection`。

## 练习内容

追踪 `Handle` → `xyhandle` → `isValidConnection` → `onConnect` → `addEdge`。R1–R5 已填写：End 禁止输出、Start 禁止输入、禁止自连、禁止有向环、禁止重复节点对；C1/C2 存边逻辑已在 `onConnect` 里用 `addEdge` 写回 edges。

Start 仅输出、End 仅输入，预置 A→B→C；普通节点提供第二个输出点用于换端口判重。真实拖线输出规则日志，候选数据探针补测没有对应 Handle 的非法数据；探针不是拖线测试，也不创建边。

所有规则已填写，合法连接放行、非法连接被拒绝。探针不创建边，未实测的因果解释继续标记“推断”。等学习者提交 review 后再验收。
