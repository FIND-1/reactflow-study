import type { LearningStatus, Lesson } from '../lessons'
import ControlledFlowExercise from './01-controlled-flow/ControlledFlowExercise'
import ConnectionExercise from './02-connection/ConnectionExercise'

type TopicMetadata = Pick<Lesson, 'id' | 'code' | 'title' | 'officialDocs'> & {
  // 引用 lessons 或 topics 的唯一 id，允许知识点以前一个知识点为前置。
  prerequisites: string[]
}

export type PreparedTopic = Omit<Lesson, 'deepensTopics' | 'status'> & TopicMetadata & {
  // 笔记路径相对于 reactflow-demo 根目录；用于定位源码文件，不是浏览器路由。
  notePath: string
  status: Exclude<LearningStatus, '未开始'>
}

// 未开始的条目只用于展示计划，不要求创建目录、笔记或可访问的页面。
export type Topic = PreparedTopic | (TopicMetadata & { status: '未开始'; component?: never })

// 知识点导航和学习状态统一在此登记；组件准备好不等于学习者已完成。
export const topics: Topic[] = [
  {
    id: '01-controlled-flow',
    code: 'T01',
    officialDocs: [
      { title: 'Adding Interactivity', url: 'https://reactflow.dev/learn/concepts/adding-interactivity' },
      { title: 'Uncontrolled Flow', url: 'https://reactflow.dev/learn/advanced-use/uncontrolled-flow' },
    ],
    prerequisites: ['building-a-flow'],
    notePath: '../notes/01-受控流.md',
    status: '笔记完成',
    group: 'Core Concepts',
    title: '受控流',
    file: 'src/topics/01-controlled-flow/ControlledFlowExercise.tsx',
    goal: '观察 changes，分别使用 Hook handler 和自己编写的 handler 完成受控状态更新。',
    exercises: [
      '打开浏览器控制台，拖动、点击节点，记录 changes 的 type、id 和附加字段；首次渲染也可能出现日志。',
      '对照 A 组（Hook handler）与 B 组（手写 handler），确认同一次操作产生的 changes 相同、画布表现也一致。',
      '把 A 组 handler 里的 onNodesChange(changes) 注释掉再拖动节点，观察“只打印不更新”的现象，然后恢复。',
      '选中一条边并按 Delete，对照日志里的 select 与 remove，确认边和节点走同一条数据流。',
      'B 组练习 1.5：选中 n1 按 Delete，看日志里节点和边的 remove 都到了、画布却什么都不变；再选中 n2 按 Delete，确认 n2 和 n1-n2 一起消失、n1 仍在。',
    ],
    expected: '两组都支持节点拖动、选中与删除；注释掉更新语句后画布不再跟随操作。B 组把 n1 的 remove 请求丢掉（同时拒绝相连边的 remove），所以删 n1 只剩一条 warn 日志，删 n2 则照常连同边一起删除。',
    boundary: '本章只覆盖受控状态更新，不包含新建连线。B 组的锁定是「在 changes 落到状态之前拒绝请求」，n1 和它的连线都不允许删除；想自己重练可注释掉 handler 里的更新语句；切换 A/B 也会重置画布。',
    component: ControlledFlowExercise,
  },
  {
    id: '02-connection',
    code: 'T02',
    officialDocs: [
      { title: 'Handles', url: 'https://reactflow.dev/learn/customization/handles' },
      { title: 'Adding Interactivity', url: 'https://reactflow.dev/learn/concepts/adding-interactivity' },
    ],
    prerequisites: ['building-a-flow'],
    notePath: '../notes/02-连线.md',
    status: '骨架已准备',
    group: 'Core Concepts · Adding Interactivity 专题',
    title: '连线',
    file: 'src/topics/02-connection/ConnectionExercise.tsx + connectionRules.ts',
    goal: '追踪从 Handle 拖动到 onConnect 的过程，自行实现方向、自连、环和重复节点对校验。',
    exercises: [
      '打开控制台，从输出点拖向输入点，观察开始、逐条校验与结束日志；骨架中的规则都显示“待实现”。',
      '在 connectionRules.ts 填写 R1–R5。Start 只输出、End 只输入；用数据探针补测无法正常拖出的非法候选。',
      '在初始 A → B → C 图上尝试 A → A、C → A，以及从 A 的底部输出点再次连接 B。记录预测与实际反馈。',
      '完成 C1/C2 的 onConnect 存边逻辑，用 Start → A 和 C → End 验证正例；合法连接也不应被全部拒绝。',
    ],
    expected: '骨架可拖出临时线并输出每条规则的状态；完成 TODO 后，非法候选在拖线时被拒绝并给出规则反馈，合法候选松手后生成新边。',
    boundary: '这是 Adding Interactivity 下的独立连线专题，不代表已完成后续 Customization 章节。规则和存边逻辑待自行填写；数据探针只调用业务规则，不模拟库内 Handle 校验，也不创建边。',
    component: ConnectionExercise,
  },
  {
    id: '03-custom-nodes', code: 'T03', title: '自定义节点', prerequisites: [], status: '未开始',
    officialDocs: [
      { title: 'Nodes', url: 'https://reactflow.dev/learn/customization/custom-nodes' },
      { title: 'Utility Classes', url: 'https://reactflow.dev/learn/customization/utility-classes' },
      { title: 'TypeScript', url: 'https://reactflow.dev/learn/advanced-use/typescript' },
    ],
  },
  {
    id: '04-store-and-hooks', code: 'T04', title: 'Store 与 Hooks', prerequisites: [], status: '未开始',
    officialDocs: [
      { title: 'Hooks and Providers', url: 'https://reactflow.dev/learn/advanced-use/hooks-providers' },
      { title: 'State Management', url: 'https://reactflow.dev/learn/advanced-use/state-management' },
    ],
  },
  {
    id: '05-coordinates-and-viewport', code: 'T05', title: '坐标与视口', prerequisites: [], status: '未开始',
    officialDocs: [{ title: 'The Viewport', url: 'https://reactflow.dev/learn/concepts/the-viewport' }],
  },
  {
    id: '06-custom-edges', code: 'T06', title: '自定义边', prerequisites: [], status: '未开始',
    officialDocs: [
      { title: 'Edges', url: 'https://reactflow.dev/learn/customization/custom-edges' },
      { title: 'Edge Labels', url: 'https://reactflow.dev/learn/customization/edge-labels' },
    ],
  },
  {
    id: '07-performance', code: 'T07', title: '性能', prerequisites: [], status: '未开始',
    officialDocs: [{ title: 'Performance', url: 'https://reactflow.dev/learn/advanced-use/performance' }],
  },
  {
    id: '08-computing-flows', code: 'T08', title: '节点间数据流', prerequisites: ['01-controlled-flow'], status: '未开始',
    officialDocs: [{ title: 'Computing Flows', url: 'https://reactflow.dev/learn/advanced-use/computing-flows' }],
  },
]
