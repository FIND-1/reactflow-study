# 02 · 连线

- 笔记：[02-连线.md](../../../../notes/02-连线.md)
- 源码地图：[2. 连线](../../../../SOURCE_MAP.md#2-连线)
- 画布骨架：[ConnectionExercise.tsx](ConnectionExercise.tsx)
- 规则骨架：[connectionRules.ts](connectionRules.ts)
- 反馈样式：[connections.css](connections.css)
- 注册表：[topics/index.ts](../index.ts)
- 状态：骨架已准备，待实现。
- 页面：在 demo 本地地址后附加 `#topics/02-connection`。

## 练习内容

追踪 `Handle` → `xyhandle` → `isValidConnection` → `onConnect` → `addEdge`。自行填写 R1–R5：End 禁止输出、Start 禁止输入、禁止自连、禁止有向环、禁止重复节点对；再完成 C1/C2 存边逻辑。

Start 仅输出、End 仅输入，预置 A→B→C；普通节点提供第二个输出点用于换端口判重。真实拖线输出规则日志，候选数据探针补测没有对应 Handle 的非法数据；探针不是拖线测试，也不创建边。

所有规则当前保持 `pending`，不会放行新连接。迁移不填写 TODO、不修改笔记中的个人理解与问题；未实测的因果解释继续标记“推断”。等学习者说“我写完了”后再 review。
