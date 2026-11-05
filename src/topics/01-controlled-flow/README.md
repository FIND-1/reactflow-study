# 01 · 受控流

- 笔记：[01-受控流.md](../../../../notes/01-受控流.md)
- 源码地图：[1. 受控流](../../../../SOURCE_MAP.md#1-受控流)
- 练习：[ControlledFlowExercise.tsx](ControlledFlowExercise.tsx)
- 注册表：[topics/index.ts](../index.ts)
- 状态：已实现，待学习验收。
- 页面：在 demo 本地地址后附加 `#topics/01-controlled-flow`。

## 练习内容

观察 `changes`，对照 A 组的 `useNodesState` / `useEdgesState` handler 与 B 组手写 `applyNodeChanges` / `applyEdgeChanges` 的状态更新。

保留 B 组练习 1.5：锁定 `n1` 及其相连边，删除 `n2` 时清理相连边。具体行为与限制以现有实现和笔记为准；本次目录迁移不改变这些逻辑。

切换 A/B 或页面会重置画布，不包含新建连线或持久化。想重练可自行注释更新语句；完成后再请求 review。
