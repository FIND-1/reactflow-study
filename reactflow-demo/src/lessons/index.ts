import type { ComponentType } from 'react'
import QuickStartDemo from './01-quick-start/QuickStartDemo'
import OverviewDemo from './02-overview/OverviewDemo'
import BuildingFlowDemo from './03-building-a-flow/BuildingFlowDemo'

export type LearningStatus = '未开始' | '骨架已准备' | '实现中' | '笔记完成' | '已验收'

export type Lesson = {
  id: string
  code: string
  officialDocs: { title: string; url: string }[]
  status: LearningStatus
  deepensTopics: string[]
  group: string
  title: string
  file: string
  goal: string
  exercises: string[]
  expected: string
  boundary: string
  component: ComponentType
}

// 保留 01～03 基础示例；后续知识点在 src/topics/index.ts 注册。
export const lessons: Lesson[] = [
  {
    id: 'quick-start',
    code: 'A1',
    officialDocs: [{ title: 'Quick Start', url: 'https://reactflow.dev/learn' }],
    status: '骨架已准备',
    deepensTopics: [],
    group: 'Quick Start',
    title: 'Quick Start',
    file: 'src/lessons/01-quick-start/QuickStartDemo.tsx',
    goal: '运行第一个流程图，先体验节点、连线与画布操作。',
    exercises: [
      '拖动“处理”节点，观察已有连线是否跟随。',
      '选中一条连线并按 Delete 删除，再从输出圆点拖到输入圆点重新连接。',
      '点击“重置流程”，然后修改代码中的 data.label，保存并观察文字变化。',
    ],
    expected: '节点可拖动，连线可删除和新建，重置后恢复三个节点、两条连线。',
    boundary: '保留之前的综合 Demo，额外包含小地图、重置和操作提示；相关原理会在后续章节分别学习。',
    component: QuickStartDemo,
  },
  {
    id: 'overview',
    code: 'A2',
    officialDocs: [{ title: 'Overview', url: 'https://reactflow.dev/learn/concepts/terms-and-definitions' }],
    status: '骨架已准备',
    deepensTopics: [],
    group: 'Core Concepts',
    title: 'Overview',
    file: 'src/lessons/02-overview/OverviewDemo.tsx',
    goal: '认识 Node（节点）、Handle（连接点）、Edge（连线）和 Viewport（视口）。',
    exercises: [
      '在下方图中找到两个节点、节点边缘的圆点和连接它们的线。',
      '拖动画布空白处并滚动鼠标滚轮，观察整张图的显示位置与大小。',
      '回到 Quick Start，选中节点，并从圆点拖出连线，区分临时连接线与已创建的连线。',
    ],
    expected: '能说清节点是图中元素、连接点是连线接入口、连线表达关系，视口决定如何观察整张图。',
    boundary: '本章用固定图示认概念；选中和连线操作在上一章的综合 Demo 中观察。',
    component: OverviewDemo,
  },
  {
    id: 'building-a-flow',
    code: 'A3',
    officialDocs: [{ title: 'Building a Flow', url: 'https://reactflow.dev/learn/concepts/building-a-flow' }],
    status: '骨架已准备',
    deepensTopics: ['01-controlled-flow', '02-connection'],
    group: 'Core Concepts',
    title: 'Building a Flow',
    file: 'src/lessons/03-building-a-flow/BuildingFlowDemo.tsx',
    goal: '按空画布 → 节点 → 连线 → 连线文字与类型的顺序搭建静态流程。',
    exercises: [
      '暂时将 nodes 和 edges 属性都改为 []，确认背景和控制栏仍然显示。',
      '先恢复 nodes，修改第二个节点的 position.x 和 data.label，观察位置及文字。',
      '再恢复 edges，将连线 type 从 smoothstep 改成 step 或 straight，并修改 label。',
    ],
    expected: '出现两个节点和一条带文字的连线；修改数据能改变图形，平移和缩放仍可用。',
    boundary: '本章只搭建静态流程，暂不接入节点拖拽、选中删除和新建连线；这些属于下一章 Adding Interactivity。',
    component: BuildingFlowDemo,
  },
]
