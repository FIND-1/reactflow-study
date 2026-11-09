import { useCallback, useState } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react'

// 两种方式使用相同的起始图，便于对照同一次操作产生的 changes。
const initialNodes: Node[] = [
  { id: 'n1', type: 'input', position: { x: 0, y: 0 }, data: { label: '拖动我，观察 changes' } },
  { id: 'n2', type: 'output', position: { x: 100, y: 160 }, data: { label: '再试试选中我' } },
]
const initialEdges: Edge[] = [
  { id: 'n1-n2', source: 'n1', target: 'n2', label: '选中这条边，观察 changes' },
]

// 练习 1.5 的锁定目标：n1 是流程入口，删掉它这张图就没有起点了。
// 注意锁定不是在组件上做手脚，而是在「changes 落到状态之前」拒绝这次请求。
const LOCKED_NODE_ID = 'n1'

function HookHandlerExercise() {
  // useNodesState 返回 [nodes, setNodes, onNodesChange]；第三个值已经把 changes 应用到最新状态。
  // 中间的 setter 这里用不到，用空位跳过。
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  // 边的对照：useEdgesState 结构与 useNodesState 相同，只是类型和应用 changes 的函数不同。
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // 外面这层包装只为了先打印 changes；打印后必须把 changes 交给 Hook 的 handler，
  // 否则受控数据不会更新，拖动的位置和选中状态都无法保持。
  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      // 初始化测量、拖动、选中等操作都会触发回调；先观察 type、id 和附加字段。
      console.log('[A / useNodesState] onNodesChange', changes)
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const handleEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      console.log('[A / useEdgesState] onEdgesChange', changes)
      onEdgesChange(changes)
    },
    [onEdgesChange],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      nodesConnectable={false}
      deleteKeyCode={['Backspace', 'Delete']}
      fitView
    >
      <Background />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

function ManualHandlerExercise() {
  // 手写方式：节点和边由普通 useState 保存，变化要自己算、自己存。
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)

  const handleNodesChange = useCallback<OnNodesChange>((changes) => {
    console.log('[B / applyNodeChanges] onNodesChange', changes)
    // 练习 1.6（可选）：拖动中会收到 dragging: true 的位置，结束时收到 dragging: false；批次数取决于实际移动事件。
    // 只想记录「松手那一刻的最终位置」时，按 dragging 过滤即可，不必自己算防抖；
    // 中间态照样应用，界面不会因此卡顿，这里只是少打日志/少写历史记录。
    const restingChanges = changes.filter(
      (change) => change.type === 'position' && change.dragging === false,
    )
    if (restingChanges.length > 0) {
      console.log('[B / 练习 1.6] 拖动结束时的位置', restingChanges)
    }
    // 练习 1.5：changes 是「请求」，不是「命令」——这里把 n1 的 remove 丢掉。
    // 只丢这一条，位置、选中、尺寸照旧应用，所以拖动和选中完全不受影响。
    const acceptedChanges = changes.filter(
      (change) => !(change.type === 'remove' && change.id === LOCKED_NODE_ID),
    )
    if (acceptedChanges.length !== changes.length) {
      console.warn(`[B] 拒绝删除 ${LOCKED_NODE_ID}：它是流程入口`)
    }
    // applyNodeChanges 只负责「changes + 旧数组 → 新数组」，不会替你保存结果；
    // 用更新函数把结果写回状态，画布才能收到新位置和选中状态。
    setNodes((currentNodes) => applyNodeChanges(acceptedChanges, currentNodes))

    // 收尾：删掉一个节点时，库会顺带删掉和它相连的边（getElementsToRemove 里的
    // getConnectedEdges），而边和节点是两批独立的 change，且边那一批先到
    // （useReactFlow.ts 的 deleteElements：先 triggerEdgeChanges，再 triggerNodeChanges）。
    // 也就是说只有走到节点这一批，才知道「这次真正删掉了哪些节点」。
    // 所以在这里把两端已不在图里的边清掉，避免状态里留下指向已删节点的悬空边。
    const removedNodeIds = acceptedChanges.flatMap((change) =>
      change.type === 'remove' ? [change.id] : [],
    )
    if (removedNodeIds.length > 0) {
      setEdges((currentEdges) =>
        currentEdges.filter(
          (edge) => !removedNodeIds.includes(edge.source) && !removedNodeIds.includes(edge.target),
        ),
      )
    }
  }, [])

  const handleEdgesChange = useCallback<OnEdgesChange>((changes) => {
    console.log('[B / applyEdgeChanges] onEdgesChange', changes)
    // 边的处理与节点同构：选中、删除都变成新的边数组。
    // 练习 1.5 的连带问题：删 n1 时库会把相连的边一起删掉，我们已经拦下 n1 的 remove，
    // 这条边也必须留下，否则 n1 会变成一个没有连线的孤立节点。所以和锁定节点相连的边
    // 同样拒绝 remove——换句话说，n1 和它的连线是一起锁住的。
    // remove 只带 id，要在当前边里查出两个端点才知道它是否连着锁定节点；
    // 这段判断放进更新函数里，就不需要把 edges 写进依赖数组。
    setEdges((currentEdges) => {
      const acceptedChanges = changes.filter(
        (change) =>
          change.type !== 'remove' ||
          !currentEdges.some(
            (edge) =>
              edge.id === change.id &&
              (edge.source === LOCKED_NODE_ID || edge.target === LOCKED_NODE_ID),
          ),
      )
      return applyEdgeChanges(acceptedChanges, currentEdges)
    })
  }, [])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      nodesConnectable={false}
      deleteKeyCode={['Backspace', 'Delete']}
      fitView
    >
      <Background />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

export default function ControlledFlowExercise() {
  const [mode, setMode] = useState<'hook' | 'manual'>('hook')

  return (
    <section className="app">
      <header>
        <p className="eyebrow">CORE CONCEPTS / ADDING INTERACTIVITY</p>
        <h1>受控流：把变化接回状态</h1>
        <p className="description">打开浏览器控制台观察日志：A 组把 changes 交给 Hook 提供的 handler，B 组自己调用 applyNodeChanges / applyEdgeChanges 更新状态。拖动、选中、删 n2 时两组一致；唯一的不同是 B 组按练习 1.5 锁住了 n1，删它会被拒绝。</p>
      </header>
      <div className="header-actions" role="group" aria-label="选择 handler 练习方式">
        <button type="button" aria-pressed={mode === 'hook'} onClick={() => setMode('hook')}>
          A · Hook 提供的 handler
        </button>
        <button type="button" aria-pressed={mode === 'manual'} onClick={() => setMode('manual')}>
          B · 手写 handler
        </button>
      </div>
      <section className="flow-container" aria-label={`受控流练习：${mode === 'hook' ? 'Hook handler' : '手写 handler'}`}>
        {/* 两个组件分别持有状态，切换方式时卸载旧组件，重新从起始图开始。 */}
        {mode === 'hook' ? <HookHandlerExercise /> : <ManualHandlerExercise />}
      </section>
      <p className="app-footer">两组都先打印 changes 再更新状态；想自己重练，可注释掉 handler 里的 onNodesChange / onEdgesChange 或 setNodes / setEdges 那一行。B 组的 n1 是「删不掉的流程入口」：选中它按 Delete 只会看到一条 warn，节点和相连的边都留在原位；选中 n2 删除则 n2 和 n1-n2 边一起消失。不练习新建连线；切换方式、章节或刷新会重置画布。</p>
    </section>
  )
}
