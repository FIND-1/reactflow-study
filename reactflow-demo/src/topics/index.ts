import type { LearningStatus, Lesson } from '../lessons'
import ControlledFlowExercise from './01-controlled-flow/ControlledFlowExercise'
import ConnectionExercise from './02-connection/ConnectionExercise'
import CustomNodesExercise from './03-custom-nodes/CustomNodesExercise'
import ViewportExercise from './05-coordinates-and-viewport/ViewportExercise'

type TopicMetadata = Pick<Lesson, 'id' | 'code' | 'title' | 'officialDocs'> & {
  // 引用 lessons 或 topics 的唯一 id，允许知识点以前一个知识点为前置。
  prerequisites: string[]
}

export type PreparedTopic = Omit<Lesson, 'deepensTopics' | 'status'> & TopicMetadata & {
  // 笔记路径相对于 reactflow-demo 根目录；页面只把它作为文本显示，方便找到笔记文件，不是浏览器路由。
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
    boundary: '本章只覆盖受控状态更新，不包含新建连线。B 组的锁定是「在 changes 落到状态之前拒绝请求」，n1 和它的连线都不允许删除；B 组唯一的边 n1-n2 连着 n1，直接选中删除会被静默拒绝，练习删边请用 A 组。想自己重练可注释掉 handler 里的更新语句；切换 A/B 也会重置画布。',
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
    status: '笔记完成',
    group: 'Core Concepts · Adding Interactivity 专题',
    title: '连线',
    file: 'src/topics/02-connection/ConnectionExercise.tsx + connectionRules.ts',
    goal: '追踪从 Handle 拖动到 onConnect 的过程，实现方向、自连、环和重复节点对校验。',
    exercises: [
      '打开控制台，从输出点拖向输入点，观察开始、逐条校验与结束日志。',
      '对照 connectionRules.ts 的 R1–R5。Start 只输出、End 只输入；用数据探针补测无法正常拖出的非法候选。',
      '在初始 A → B → C 图上验证 A → A、C → A，以及从 A 的底部输出点再次连接 B。记录预测与实际反馈。',
      '用 Start → A 和 C → End 验证 onConnect 的存边逻辑；合法连接不应被全部拒绝。',
    ],
    expected: '非法候选在拖线时被拒绝并给出规则反馈，合法候选松手后生成新边。',
    boundary: '这是 Adding Interactivity 下的独立连线专题，不代表已完成后续 Customization 章节。规则和存边逻辑已实现；数据探针只调用业务规则，不模拟库内 Handle 校验，也不创建边。',
    component: ConnectionExercise,
  },
  {
    id: '03-custom-nodes',
    code: 'T03',
    officialDocs: [
      { title: 'Nodes', url: 'https://reactflow.dev/learn/customization/custom-nodes' },
      { title: 'Utility Classes', url: 'https://reactflow.dev/learn/customization/utility-classes' },
      { title: 'TypeScript', url: 'https://reactflow.dev/learn/advanced-use/typescript' },
    ],
    prerequisites: ['01-controlled-flow', '02-connection'],
    notePath: '../notes/03-自定义节点.md',
    status: '笔记完成',
    group: 'Customization',
    title: '自定义节点',
    file: 'src/topics/03-custom-nodes/CustomNodesExercise.tsx',
    goal: '定义带 TypeScript 类型的自定义节点并注册到 nodeTypes，用 updateNodeData 从节点内部更新 data，并用 nodrag / nowheel / nopan 解决内部控件与画布手势冲突。',
    exercises: [
      '把 nodeTypes 里的 inspectorCard 映射临时注释掉，打开页面和控制台，复现 003 告警及默认节点回退现象，再恢复。',
      '对照模块顶层的 nodeTypes 与 InspectorCardNodeComponent，确认左右 Handle、selected 与 dragging 状态展示。',
      '在标题输入框打字、拖动步数滑块、在备注框滚轮，确认内部控件不触发节点移动或画布缩放；可临时清空 UTILITY_CLASSES 对照手势冲突。',
      '观察修改输入或拉动滑块时控制台 onNodesChange 打印的 replace 类型 change，确认 updateNodeData 浅合并了节点 data。',
    ],
    expected: '两张自定义卡片正常渲染且与左侧 input 节点水平相连；内部输入框、滑块和滚动条可独立操作；修改输入或滑块通过 updateNodeData 产生 replace change 并更新节点 data。',
    boundary: '本章只覆盖自定义节点注册、NodeProps 类型、内部控件更新自身 data 及工具类名，不包含跨节点数据计算（T08）或自定义边（T06）。N1–N3 已实现；想重练可临时清空 nodeTypes 或 UTILITY_CLASSES。',
    component: CustomNodesExercise,
  },
  {
    id: '04-store-and-hooks', code: 'T04', title: 'Store 与 Hooks', prerequisites: [], status: '未开始',
    officialDocs: [
      { title: 'Hooks and Providers', url: 'https://reactflow.dev/learn/advanced-use/hooks-providers' },
      { title: 'State Management', url: 'https://reactflow.dev/learn/advanced-use/state-management' },
    ],
  },
  {
    id: '05-coordinates-and-viewport',
    code: 'T05',
    officialDocs: [{ title: 'The Viewport', url: 'https://reactflow.dev/learn/concepts/the-viewport' }],
    prerequisites: ['01-controlled-flow'],
    notePath: '../notes/05-坐标与视口.md',
    status: '骨架已准备',
    group: 'Core Concepts',
    title: '坐标与视口',
    file: 'src/topics/05-coordinates-and-viewport/ViewportExercise.tsx',
    goal: '区分屏幕坐标与流程坐标，理解视口 { x, y, zoom } 如何把节点 position 显示到屏幕上，并用 useReactFlow 的视口方法换算坐标、移动视口。',
    exercises: [
      '不改代码：对照页面上的 viewport 读数，确认初始时 A（流程坐标 0,0）显示在画布容器的 (80, 60)；平移、缩放后看读数变化，并确认控制台没有 onNodesChange 日志。',
      'V1：在 designToolProps 中填写设计工具式配置，切换两种操作方式，对比拖动空白处、滚轮、Shift 拖动的效果。',
      'V2：在 toFlowPosition 中用 screenToFlowPosition 换算坐标；平移或缩放后点击同一屏幕位置，记录 clientPosition 不变、flowPosition 变化，并核对 roundTrip。',
      'V3：勾选“点击空白处放置节点”，在点击处添加节点；放好后平移、缩放，确认新节点和其他节点一起移动。',
      'V4：实现“聚焦 B”（fitView 的 nodes 选项）与“回到初始视口”（setViewport），观察 onMoveEnd 日志里的 hasEvent 与手动平移时有何不同。',
    ],
    expected: '平移、缩放只改变 viewport 读数，节点 position 不变；同一屏幕点在不同视口下换算出不同的流程坐标；新节点按流程坐标保存，随视口一起移动；两个按钮能带动画移动视口。',
    boundary: '本章只覆盖视口与坐标换算，不包含自定义节点、新建连线、translateExtent / minZoom 等视口限制和受控 viewport 属性。V1–V4 为待学习者填写的 TODO，未填写前对应按钮只打印提示。切换操作方式不重置画布。',
    component: ViewportExercise,
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
