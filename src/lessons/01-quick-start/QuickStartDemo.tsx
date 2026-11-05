import { useCallback, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, applyNodeChanges, applyEdgeChanges,
  type Node, type Edge, type OnNodesChange, type OnEdgesChange, type OnConnect,
} from '@xyflow/react'

// 用“开始 → 处理 → 结束”演示流程图结构；这些节点只展示文字，不会实际处理数据。
// id 是节点的唯一标识；position 是画布坐标；data.label 是节点显示的文字。
// input 节点只有输出连接点，output 节点只有输入连接点；省略 type 时两者都有。
const initialNodes: Node[] = [
  { id: 'start', type: 'input', position: { x: 200, y: 0 }, data: { label: '开始 · 输入数据' } },
  { id: 'process', position: { x: 200, y: 140 }, data: { label: '处理 · 转换数据' } },
  { id: 'end', type: 'output', position: { x: 200, y: 280 }, data: { label: '结束 · 输出结果' } },
]

// 连线通过 source / target 引用节点 id，表示从哪个节点连接到哪个节点。
const initialEdges: Edge[] = [
  { id: 'start-process', source: 'start', target: 'process' },
  { id: 'process-end', source: 'process', target: 'end' },
]

function QuickStartDemo() {
  // 受控状态：节点和连线由 React 保存，画布交互通过下方回调更新这些数据。
  // 数据只保存在当前页面内存中，刷新页面后会回到初始流程。
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  // 拖动、选中或删除节点时，React Flow 会传入一组变化，工具函数负责应用到节点数组。
  // 函数式更新读取最新状态；useCallback 让传给画布的回调保持稳定。
  const onNodesChange = useCallback<OnNodesChange>((changes) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes))
  }, [])

  // 选中或删除连线时，把变化同步到 edges，画布才会显示对应的选中效果或移除连线。
  const onEdgesChange = useCallback<OnEdgesChange>((changes) => {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
  }, [])

  // 从一个节点的输出圆点拖到另一个节点的输入圆点后，新增连线并更新画布。
  // 圆点是连接点（handle）；connection 记录这次连接的源节点和目标节点等信息。
  const onConnect = useCallback<OnConnect>((connection) => {
    setEdges((currentEdges) => addEdge(connection, currentEdges))
  }, [])

  // 点击“重置流程”恢复初始节点位置和连线，便于反复练习；当前缩放和平移位置保持不变。
  function resetFlow() {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }

  return (
    <section className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">QUICK START / 综合体验</p>
          <h1>我的第一个流程图</h1>
          <p className="description">从一个节点开始，连接你的想法。</p>
        </div>
        <div className="header-actions">
          <a href="https://reactflow.dev/learn" target="_blank" rel="noreferrer">官方指引 ↗</a>
          <button type="button" onClick={resetFlow}>重置流程</button>
        </div>
      </header>
      <section className="flow-container" aria-label="交互式流程图">
        {/* 将状态和交互回调交给画布；Delete / Backspace 删除选中项。
            fitView 在初次展示时让全部节点进入视野；之后可用控制栏的适应视图按钮调整。 */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          {/* 点阵背景辅助判断节点位置；gap 是点间距，size 是点大小。 */}
          <Background gap={20} size={1} />
          {/* 提供放大、缩小、适应视图和交互锁定按钮。 */}
          <Controls />
          {/* 小地图展示整体布局；允许通过它平移和缩放主画布，窄屏时由 CSS 隐藏。 */}
          <MiniMap pannable zoomable />
        </ReactFlow>
      </section>
      <footer className="app-footer">
        <p>拖动节点移动 · 从下方圆点拖向另一节点的上方圆点连线 · 滚轮缩放 · Shift + 拖动框选 · 选中后按 Delete 删除</p>
        <span>{nodes.length} 个节点 / {edges.length} 条连线</span>
      </footer>
    </section>
  )
}

export default QuickStartDemo
