import { useCallback, useState, type MouseEvent } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport,
  type Edge,
  type Node,
  type OnNodesChange,
  type ReactFlowProps,
  type Viewport,
  type XYPosition,
} from '@xyflow/react'
import './viewport.css'

// 节点的 position 是「流程坐标」：画布内部的坐标系，和平移、缩放无关。
// label 里写的是初始流程坐标，拖动节点后文字不会跟着更新。
const initialNodes: Node[] = [
  { id: 'a', position: { x: 0, y: 0 }, data: { label: 'A · flow (0, 0)' } },
  { id: 'b', position: { x: 240, y: 160 }, data: { label: 'B · flow (240, 160)' } },
  { id: 'c', position: { x: 480, y: 0 }, data: { label: 'C · flow (480, 0)' } },
]
const initialEdges: Edge[] = [
  { id: 'a-b', source: 'a', target: 'b' },
  { id: 'b-c', source: 'b', target: 'c' },
]

// 视口（viewport）= { x, y, zoom }：流程坐标经过它变换后才显示到屏幕上。
// 换算关系（相对画布容器左上角）：屏幕 = 流程 × zoom + (x, y)。
// 这里故意不用 fitView，而是给一个固定初始视口，方便对照：A 的流程坐标是 (0, 0)，
// 它在容器里的位置正好就是 (80, 60)。
const initialViewport: Viewport = { x: 80, y: 60, zoom: 1 }

type ControlMode = 'map' | 'design'
type ControlProps = Partial<Pick<ReactFlowProps, 'panOnScroll' | 'panOnDrag' | 'selectionOnDrag' | 'selectionMode'>>

// 默认的「地图式」操作：拖动空白处平移、滚轮缩放、按住 Shift 拖动框选。
// 空对象表示全部使用库的默认值。
const mapStyleProps: ControlProps = {}

// V1：按官方 The Viewport 一节配置「设计工具式」操作：
// 滚轮平移（panOnScroll）、拖动空白处框选而不是平移（selectionOnDrag + panOnDrag: false），
// 框选碰到一部分就算选中（SelectionMode.Partial）。
const designToolProps: ControlProps = {
  panOnScroll: true,
  panOnDrag: false,
  selectionOnDrag: true,
  selectionMode: SelectionMode.Partial,
}

function ViewportCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [mode, setMode] = useState<ControlMode>('map')
  const [placeMode, setPlaceMode] = useState(false)
  // useReactFlow 返回画布实例，视口方法（坐标换算、fitView、setViewport 等）都在上面。
  // 它必须在 ReactFlowProvider 内部调用，所以外层用 Provider 包了一层。
  const reactFlow = useReactFlow()
  // useViewport 订阅当前视口；平移、缩放时这里会更新，用来在页面上实时显示 x、y、zoom。
  const viewport = useViewport()

  // 只打印 change 的类型：用来验证「平移、缩放视口不会产生节点 changes」，
  // 拖动节点才会出现 position。
  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      console.log('[视口 / onNodesChange]', changes.map((change) => change.type))
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  // 把鼠标的屏幕坐标（clientX / clientY，相对浏览器窗口）换算成流程坐标。
  // V2：screenToFlowPosition 先减去画布容器 getBoundingClientRect() 的偏移，
  // 再按 (pos - translate) / zoom 换算成流程坐标（useViewportHelper.ts:84）。
  const toFlowPosition = (clientPosition: XYPosition): XYPosition | null => {
    return reactFlow.screenToFlowPosition(clientPosition)
  }

  // 点击画布空白处：打印同一个点的两种坐标。
  // 先平移或缩放画布，再点同一个屏幕位置，对比屏幕坐标和流程坐标哪个变了。
  const handlePaneClick = (event: MouseEvent) => {
    const clientPosition = { x: event.clientX, y: event.clientY }
    const flowPosition = toFlowPosition(clientPosition)
    if (!flowPosition) {
      console.info('[视口 / 点击] TODO V2 尚未实现：screenToFlowPosition', { clientPosition })
      return
    }
    // 反向换算回屏幕坐标做核对：结果应与 clientPosition 基本一致（可能有小数误差）。
    const roundTrip = reactFlow.flowToScreenPosition(flowPosition)
    console.log('[视口 / 点击]', { clientPosition, flowPosition, roundTrip, viewport: reactFlow.getViewport() })

    if (placeMode) {
      // V3：在 flowPosition 处新增一个节点。
      // 新节点必须存流程坐标而不是屏幕坐标；放好后平移、缩放，它会和其他节点一起移动。
      const roundedX = Math.round(flowPosition.x)
      const roundedY = Math.round(flowPosition.y)
      setNodes((currentNodes) => {
        const nextId = `p${currentNodes.length + 1}`
        return [
          ...currentNodes,
          {
            id: nextId,
            position: { x: roundedX, y: roundedY },
            data: { label: `${nextId.toUpperCase()} · flow (${roundedX}, ${roundedY})` },
          },
        ]
      })
    }
  }

  // V4-a：用 reactFlow.fitView 只把节点 B 移到视口中央（nodes 选项），带 duration 动画。
  const focusNodeB = () => {
    void reactFlow.fitView({ nodes: [{ id: 'b' }], duration: 400, padding: 0.4 })
  }

  // V4-b：用 reactFlow.setViewport 回到 initialViewport，带 duration 动画。
  // 注意：控制栏的「适应视图」按钮调用的是 fitView，结果通常不等于初始视口。
  const resetViewport = () => {
    void reactFlow.setViewport(initialViewport, { duration: 400 })
  }

  return (
    <section className="app viewport-exercise">
      <header>
        <p className="eyebrow">CORE CONCEPTS / THE VIEWPORT</p>
        <h1>坐标与视口：屏幕坐标、流程坐标与视口变换</h1>
        <p className="description">节点 position 是流程坐标，视口 {'{ x, y, zoom }'} 决定它显示在屏幕哪里。打开控制台，点击空白处对照两种坐标；平移、缩放只改变视口，不改变节点数据。</p>
      </header>
      <div className="header-actions viewport-actions">
        <div role="group" aria-label="选择画布操作方式">
          <button type="button" aria-pressed={mode === 'map'} onClick={() => setMode('map')}>地图式（默认）</button>
          <button type="button" aria-pressed={mode === 'design'} onClick={() => setMode('design')}>设计工具式（V1）</button>
        </div>
        <div role="group" aria-label="视口操作">
          <button type="button" onClick={focusNodeB}>聚焦 B（V4-a）</button>
          <button type="button" onClick={resetViewport}>回到初始视口（V4-b）</button>
          <button type="button" onClick={() => setNodes(initialNodes)}>恢复初始节点</button>
        </div>
        <label className="viewport-place-toggle">
          <input type="checkbox" checked={placeMode} onChange={(event) => setPlaceMode(event.target.checked)} />
          点击空白处放置节点（V3）
        </label>
      </div>
      {/* 实时视口读数：与上面的换算公式对照，例如 zoom 为 1 时 A 的屏幕位置 = (x, y)。 */}
      <p className="viewport-readout" aria-live="polite">
        viewport：x = {viewport.x.toFixed(1)}，y = {viewport.y.toFixed(1)}，zoom = {viewport.zoom.toFixed(2)}
      </p>
      <section className="flow-container" aria-label="坐标与视口练习">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onPaneClick={handlePaneClick}
          // 一次平移或缩放结束时打印最终视口（XYPanZoom 的 end 事件把 d3 的 sourceEvent 传过来）。
          // 推断（待实测）：setViewport、fitView 等程序调用没有鼠标事件，event 为空，hasEvent 为 false。
          onMoveEnd={(event, nextViewport) => console.log('[视口 / onMoveEnd]', { hasEvent: Boolean(event), viewport: nextViewport })}
          defaultViewport={initialViewport}
          nodesConnectable={false}
          {...(mode === 'design' ? designToolProps : mapStyleProps)}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </section>
      <p className="app-footer">不练习新建连线和自定义节点。切换操作方式只改交互配置，不重置画布；切换章节或刷新会恢复初始节点和视口，视口不持久保存。</p>
    </section>
  )
}

// useReactFlow / useViewport 需要在 ReactFlowProvider 内部才能读到画布状态；
// 本练习在画布外（工具栏、读数）也要用它们，所以由 Provider 包住整个练习。
export default function ViewportExercise() {
  return (
    <ReactFlowProvider>
      <ViewportCanvas />
    </ReactFlowProvider>
  )
}
